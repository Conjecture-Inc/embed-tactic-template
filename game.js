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

const story_opening = `The ancient cave mouth looms before you...`; // Your full story text here

// DOM elements
const storyText = document.getElementById('story-text');
const gameOutput = document.getElementById('game-output');
const actionInput = document.getElementById('action-input');
const playerStats = document.getElementById('player-stats');
const dragonStats = document.getElementById('dragon-stats');

// Initialize the game
storyText.textContent = story_opening;
updateStats();

async function makeApiCall(action) {
    const response = await fetch(`https://api.tactics.dev/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": "YOUR_API_KEY", // You'll need to handle this securely
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
}

function updateStats() {
    playerStats.textContent = `Player HP: ${user_stats.hp}/${user_stats.max_hp}`;
    dragonStats.textContent = `Dragon HP: ${enemy_stats.hp}/${enemy_stats.max_hp}`;
}

function appendToOutput(text) {
    const p = document.createElement('p');
    p.textContent = text;
    gameOutput.appendChild(p);
    gameOutput.scrollTop = gameOutput.scrollHeight;
}

actionInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && user_stats.hp > 0 && enemy_stats.hp > 0) {
        const action = actionInput.value;
        actionInput.value = '';

        try {
            const result = await makeApiCall(action);

            // Update stats
            user_stats.hp = result.user_stats.hp;
            enemy_stats.hp = result.enemy_stats.hp;

            // Display results
            appendToOutput(`Your action: ${result.result_of_die_roll}`);
            appendToOutput(`Dragon's action: ${result.enemy_result}`);
            updateStats();

            // Check for game over
            if (user_stats.hp <= 0 || enemy_stats.hp <= 0) {
                actionInput.disabled = true;
                if (user_stats.hp <= 0) {
                    appendToOutput("Game Over! You have been defeated by the ancient dragon.");
                } else {
                    appendToOutput("Congratulations! You have slain the ancient dragon!");
                }
            }
        } catch (error) {
            appendToOutput("An error occurred. Please try again.");
            console.error(error);
        }
    }
}); 