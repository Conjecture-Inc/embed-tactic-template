// Uncomment below to debug the tactic in the 

// story_opening = `In a dimly lit abandoned carnival, the twisted remains of rusty rides loom overhead. The sound of demented calliope music echoes through the fog as a gigantic, grotesque clown known as "Giggles the Eternal" emerges from the shadows, its razor-sharp teeth gleaming in the moonlight.`;

// user_stats = {
//     hp: 150,
//     max_hp: 150,
//     items: ["blessed silver chainsaw", "anti-clown spray", "circus performer's amulet"]
// };

// enemy_stats = {
//     type: "Giggles the Eternal Clown",
//     hp: 800,
//     max_hp: 800
// };

// action = `Rev up my blessed silver chainsaw and charge at Giggles, aiming to slice through the demon clown's oversized shoes.`;


result_of_player_action = $do `You are a combat referee. Evaluate the following player action and assign a difficulty rating.

Current Scene:
${story_opening}

Player Stats: ${user_stats}
Enemy Stats: ${enemy_stats}

Action to evaluate: ${action}

Rate this action's difficulty from 1-20 where:
1-5: Simple actions (talking, walking)
6-10: Basic combat moves (basic attacks)
11-15: Complex actions (special moves, tactical maneuvers)
16-20: Nearly impossible actions

Format: \`{ "difficulty": [number]}\`` `{ "type": "object", "properties": { "difficulty": "number" } }`;

player_difficulty = result_of_player_action["difficulty"];
player_roll = $randint(1, 20);

if (player_roll > player_difficulty) {
  player_outcome = "success";
} else {
  player_outcome = "failure";
}

player_action_result = $do `You are a combat referee describing the outcome of an action.

Scene State:
${story_opening}

Action: ${action}
Roll Result: ${player_outcome} (rolled ${player_roll} vs difficulty ${player_difficulty})

Player Stats: ${user_stats}
Enemy Stats: ${enemy_stats}

Describe the immediate result of the action in 1-2 sentences, third person perspective. Focus only on what the player did and its direct impact.`;

enemy_action = $do `You are controlling an enemy in combat. Choose their next action based on the current situation.

Scene State:
Last Player Action: ${action}
Result: ${player_action_result}

Enemy Stats: ${enemy_stats}
Player Stats: ${user_stats}

Choose a tactical action for the enemy. They should:
- React to the player's last action
- Act according to their remaining HP
- Use their available weapons/abilities
- Take logical combat actions

Format: Return only the action in third person (e.g. "The kobold swings his sword at the adventurer's legs")`;

result_of_enemy_action = $do `You are a combat referee evaluating the difficulty of an action in combat.

Action being evaluated:
${enemy_action}

Current combat state:
Player stats: ${user_stats}
Enemy stats: ${enemy_stats}

As a DM, evaluate how feasible the enemy's action is. Represent it as a difficulty number between 1 and 20. Format your response as \`{ "difficulty": [number]}\`. Simple actions should be easy (1). Complex or unlikely actions should have higher difficulty.` `{ "type" : "object" , "properties" : { "difficulty" : "number" } }` ;

enemy_difficulty = result_of_enemy_action["difficulty"];


enemy_roll = $randint(1, 20);

if (enemy_roll > enemy_difficulty) {
  enemy_outcome = "success";
} else {
  enemy_outcome = "failure";
}

enemy_action_result = $do `You are a combat referee describing an enemy action outcome.

Action: ${enemy_action}
Success: ${enemy_outcome}

Combat State:
Player Stats: ${user_stats}
Enemy Stats: ${enemy_stats}
Previous Player Action: ${player_action_result}

Describe the immediate result in 1-2 sentences, third person perspective.`;

_new_hp = $do `You are calculating combat damage.

Combat Sequence:
1. Player: ${action} -> ${player_action_result}
2. Enemy: ${enemy_action} -> ${enemy_action_result}

Current HP:
- Player: ${user_stats.hp}
- Enemy: ${enemy_stats.hp}

Calculate final HP after this exchange. Consider:
- Success/failure of actions
- Weapon damage
- Defensive abilities
- Logical combat outcomes

Format: \`{ "player_hp": [number], "enemy_hp": [number] }\`` `{ "type": "object", "properties": { "player_hp": "number", "enemy_hp": "number" } }`;

// Update the stats based on the damage calculation
user_stats = { ...user_stats , hp : _new_hp.player_hp } ;
enemy_stats = { ...enemy_stats , hp : _new_hp.enemy_hp } ;


return {
  user_stats: user_stats,
  enemy_stats: enemy_stats,
  user_action: action,
  enemy_action: enemy_action,
  player_action_result: player_action_result,
  enemy_action_result: enemy_action_result,
  player_roll: player_roll,
  player_difficulty: player_difficulty,
  enemy_roll: enemy_roll,
  enemy_difficulty: enemy_difficulty
};
