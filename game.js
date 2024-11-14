/*
GAME CONFIGURATION INSTRUCTIONS
1. API Setup:
   - Get your API key from tactics.dev
   - Replace the API_KEY value below with your key

2. Tactic Setup:
   - Create your tactic at tactics.dev or edit the one below
   - Replace TACTIC_URL with your tactic's URL
   
3. Game Customization:
   - Modify user_stats to set your player's starting attributes
   - Modify enemy_stats to define your opponent
   - Update story_opening to set your game's introduction
*/

let API_KEY;
let TACTIC_URL;
let user_stats;
let enemy_stats;
let story_opening;
let TACTIC_ID;

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

// Add these functions at the top of the file, after the constants
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateTacticUrl(newUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('tactic', newUrl);
    window.history.pushState({}, '', url);
    return newUrl;
}

// Add this function after the other initialization code
function initializeTacticLink() {
    const tacticDisplay = document.getElementById('tactic-display');
    const visitButton = document.getElementById('visit-tactic');
    
    // Display the tactic ID
    tacticDisplay.textContent = TACTIC_ID;
    
    // Visit button handler
    visitButton.addEventListener('click', () => {
        window.open(TACTIC_URL, '_blank');
    });
    
    // Make the display text editable and handle updates
    tacticDisplay.addEventListener('click', () => {
        const newTacticUrl = prompt('Enter new tactic URL:', TACTIC_URL);
        if (newTacticUrl && newTacticUrl !== TACTIC_URL) {
            updateTacticUrl(newTacticUrl);
            window.location.reload(); // Reload to use new tactic
        }
    });
}

// Add this new initialization function
function initializeGame(config) {
    API_KEY = config.apiKey;
    TACTIC_URL = config.tacticUrl;
    TACTIC_ID = TACTIC_URL.split('/').pop();
    
    user_stats = {
        hp: parseInt(config.playerHp),
        max_hp: parseInt(config.playerHp),
        items: config.playerItems.split(',').map(item => item.trim()),
    };
    
    enemy_stats = {
        type: config.enemyType,
        hp: parseInt(config.enemyHp),
        max_hp: parseInt(config.enemyHp),
    };
    
    story_opening = config.storyOpening;
    
    // Initialize the game UI
    document.getElementById('config-form').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    storyText.textContent = story_opening;
    updateStats();
    initializeTacticLink();
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Game';
    resetButton.style.cssText = `
        background-color: #ff4a4a;
        color: #fff;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        margin-top: 15px;
        cursor: pointer;
    `;
    resetButton.addEventListener('click', resetGame);
    document.getElementById('game-container').appendChild(resetButton);
}

// Add new reset function
function resetGame() {
    // Reset game state
    game_state.turn_counter = 1;
    game_state.game_over = false;
    
    // Clear game output
    gameOutput.innerHTML = 'Battle Log';
    
    // Enable input
    actionInput.disabled = false;
    actionInput.value = '';
    
    // Hide game container and show config form
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('config-form').style.display = 'block';
}

// Add form submission handler
document.getElementById('game-setup').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const config = {
        apiKey: document.getElementById('api-key').value,
        tacticUrl: document.getElementById('tactic-url').value,
        playerHp: document.getElementById('player-hp').value,
        playerItems: document.getElementById('player-items').value,
        enemyType: document.getElementById('enemy-type').value,
        enemyHp: document.getElementById('enemy-hp').value,
        storyOpening: document.getElementById('story-opening').value,
    };
    
    initializeGame(config);
});

async function makeApiCall(action) {
    try {
        const response = await fetch(`https://api.tactics.dev/api/run`, {
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
                tactic_id: TACTIC_ID,
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
    const playerSuccess = result.player_roll >= result.player_difficulty;
    appendToOutput(
        `Roll: ${result.player_roll} vs difficulty ${result.player_difficulty} (${playerSuccess ? 'SUCCESS' : 'FAILURE'})`,
        `roll-details ${playerSuccess ? 'success' : 'failure'}`
    );
    appendToOutput(`Result: ${result.player_action_result}`, 'combat-details');
    
    // Enemy results
    appendToOutput(`${enemy_stats.type}'s action: ${result.enemy_action}`, 'combat-details');
    const enemySuccess = result.enemy_roll >= result.enemy_difficulty;
    appendToOutput(
        `Roll: ${result.enemy_roll} vs difficulty ${result.enemy_difficulty} (${enemySuccess ? 'SUCCESS' : 'FAILURE'})`,
        `roll-details ${enemySuccess ? 'success' : 'failure'}`
    );
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