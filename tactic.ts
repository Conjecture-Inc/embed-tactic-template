import readline from "readline";

type GameStats = {
  hp: number;
  max_hp: number;
  items: Array<string>;
};

type DragonStats = {
  type: string;
  hp: number;
  max_hp: number;
};

type ApiResponse = {
  user_stats: GameStats;
  enemy_stats: DragonStats;
  user_action: string;
  enemy_action: string;
  result_of_die_roll: string;
  enemy_result: string;
};

const story_opening = `The ancient cave mouth looms before you, a dark portal carved into the mountainside. Ancient runes, worn by centuries of wind and rain, frame the entrance with their mysterious warnings.

Your torch casts dancing shadows on the weathered stone walls as you venture deeper into the mountain's heart. The weight of your enchanted armor feels reassuring, though your hands tremble slightly as you grip your weapon tighter. Each step echoes through the vast chambers, disturbing centuries of silence.

Stories of the cave's terrible guardian have circulated in your homeland for generations, but now, standing in these hallowed depths, those fireside tales crystallize into a heart-pounding reality.

Suddenly, the tunnel opens into a vast cavern, and your breath catches in your throat. Mountains of gold and precious gems glitter in your torchlight, but it's what lies atop the treasure that makes your blood run cold. An enormous scaled form shifts in the darkness, and two enormous eyes, like molten gold, snap open to fix upon you.

The dragon unfurls its wings, sending cascades of coins clattering across the chamber floor. Steam curls from its nostrils as it raises its serpentine head, regarding you with ancient intelligence. Its scales shimmer with an iridescent gleam that speaks of centuries of life and power beyond mortal comprehension.

Face the ancient dragon if you dare!`;

const user_stats = {
  hp: 200,
  max_hp: 200,
  items: ["legendary staff of power", "merlin's cloak of domination"],
};

const enemy_stats = {
  type: "ancient dragon",
  hp: 1000,
  max_hp: 1000,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const makeApiCall = async (action: string): Promise<ApiResponse> => {
  const response = await fetch(`https://api.tactics.dev/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.TACTICS_STAGING_KEY || "",
    },
    body: JSON.stringify({
      initial_variables: {
        action,
        user_stats,
        enemy_stats,
        story_opening,
      },
      tactic_id: "99044185-e8a2-451c-a3cd-7c96729c93e5",
    }),
  });

  const rawResponse = await response.json();
  return JSON.parse(rawResponse.result.content.value);
};

const gameLoop = async () => {
  while (user_stats.hp > 0 && enemy_stats.hp > 0) {
    const action = await new Promise<string>((resolve) => {
      rl.question("\nWhat would you like to do? ", resolve);
    });

    const result = await makeApiCall(action);

    // Update stats
    user_stats.hp = result.user_stats.hp;
    enemy_stats.hp = result.enemy_stats.hp;

    // Display results
    console.log("\nYour action:", result.result_of_die_roll);
    console.log("Dragon's action:", result.enemy_result);
    console.log(`\nYour HP: ${user_stats.hp}/${user_stats.max_hp}`);
    console.log(`Dragon HP: ${enemy_stats.hp}/${enemy_stats.max_hp}`);
  }

  console.log("\nGame Over!");
  if (user_stats.hp <= 0) {
    console.log("You have been defeated by the ancient dragon.");
  } else {
    console.log("Congratulations! You have slain the ancient dragon!");
  }

  rl.close();
};

gameLoop();
