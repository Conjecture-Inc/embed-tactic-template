const user_stats = {
    hp: 200,
    max_hp: 200,
    items: ["legendary staff of power", "merlin's cloak of domination"],
};

const enemy_stats = {
    type: "Ancient Dragon",
    hp: 1000,
    max_hp: 1000,
};

const story_opening = `The ancient cave mouth looms before you, its jagged edges resembling the teeth of some colossal beast. The air grows colder as you approach, carrying the unmistakable scent of brimstone and ancient magic. Your legendary staff pulses with power, and Merlin's cloak billows around you despite the still air.

Deep within the darkness, you hear the rhythmic breathing of something massive, and occasional glints of gold and precious gems catch what little light reaches this far. The ancient dragon, guardian of untold treasures, awaits within.

Face the ancient dragon if you dare!`;

// DOM elements
const storyText = document.getElementById('story-text');
const gameOutput = document.getElementById('game-output');
const actionInput = document.getElementById('action-input');
const playerStats = document.getElementById('player-stats');
const enemyStats = document.getElementById('enemy-stats');

// Add turn counter at the top with other state variables
const game_state = {
    turn_counter: 1,
    game_over: false
};

// Initialize the game
storyText.textContent = story_opening;
updateStats();

async function makeApiCall(action) {

  const API_KEY = "pk_ab458d9ea1c0fe97449faf128877aa74c2cb14467ac2e105a0b3226dc251b007";
    
    try {
        const response = await fetch(`http://localhost:3000/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY,
            },
            body: JSON.stringify({
                initial_variables: {
                    action,
                    user_stats,
                    enemy_stats,
                    story_opening,
                },
                tactic_id: "1c517383-6dc6-49e8-a129-7b225e86948c",
            }),
        });

        const rawResponse = await response.json();
        return JSON.parse(rawResponse.result.content.value);
    } catch (error) {
        console.error("API call failed:", error);
        throw error;
    }
}

function updateStats() {
    const playerHpPercent = (user_stats.hp / user_stats.max_hp) * 100;
    const enemyHpPercent = (enemy_stats.hp / enemy_stats.max_hp) * 100;

    // Get color based on HP percentage
    const getHpColor = (percentage) => {
        if (percentage > 66) return '#4aff4a'; // Green
        if (percentage > 33) return '#ffd700'; // Yellow
        return '#ff4a4a'; // Red
    };

    playerStats.style.color = getHpColor(playerHpPercent);
    enemyStats.style.color = getHpColor(enemyHpPercent);
    
    playerStats.textContent = `Player HP: ${user_stats.hp}/${user_stats.max_hp}`;
    enemyStats.textContent = `${enemy_stats.type} HP: ${enemy_stats.hp}/${enemy_stats.max_hp}`;
}

function appendToOutput(text, type = 'action') {
    const p = document.createElement('p');
    p.textContent = text;
    p.className = `game-text ${type}`;
    gameOutput.appendChild(p);
    gameOutput.scrollTop = gameOutput.scrollHeight;
}

function displayCombatResults(result) {
    appendToOutput(`Turn ${game_state.turn_counter}:`, 'turn-header');
    
    // Player results
    appendToOutput(`Your action: ${result.user_action}`, 'combat-details');
    appendToOutput(`Roll: ${result.player_roll} vs difficulty ${result.player_difficulty}`, 'roll-details');
    appendToOutput(`Result: ${result.player_action_result}`, 'combat-details');
    
    // Enemy results
    appendToOutput(`${enemy_stats.type}'s action: ${result.enemy_action}`, 'combat-details');
    appendToOutput(`Roll: ${result.enemy_roll} vs difficulty ${result.enemy_difficulty}`, 'roll-details');
    appendToOutput(`Result: ${result.enemy_action_result}`, 'combat-details');
    
    game_state.turn_counter++;
}

actionInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !game_state.game_over) {
        const action = actionInput.value.trim();
        if (!action) return;
        
        // Show loading indicator and user's action
        document.getElementById('loading').style.display = 'block';
        appendToOutput(`You attempt to: ${action}`, 'user-input');
        
        actionInput.value = '';

        try {
            const result = await makeApiCall(action);
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
            
            // Update stats
            user_stats.hp = result.user_stats.hp;
            enemy_stats.hp = result.enemy_stats.hp;

            // Display results
            displayCombatResults(result);
            
            updateStats();

            // Check for game over
            if (user_stats.hp <= 0 || enemy_stats.hp <= 0) {
                game_state.game_over = true;
                actionInput.disabled = true;
                appendToOutput(user_stats.hp <= 0 
                    ? `You have been defeated by the ${enemy_stats.type}.`
                    : `Congratulations! You have slain the ${enemy_stats.type}!`,
                    'game-over');
            }
        } catch (error) {
            // Hide loading indicator on error
            document.getElementById('loading').style.display = 'none';
            appendToOutput("An error occurred. Please try again.", 'error');
            console.error(error);
        }
    }
}); 