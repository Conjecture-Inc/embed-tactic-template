# Dragon Slayer Adventure Template

A simple example of how to use the Tactics API to create a text-based adventure game.

## How to Use This Template

1. Click the "Use this template" button at the top of this repository
2. Clone your new repository
3. Create an API key [here](https://tactics.dev/keys)
4. Update the API key in `game.js`
5. Enable GitHub Pages in your repository settings
6. Your game will be available at `https://[your-username].github.io/[repo-name]`

## Customization

You can customize the game by:
- Modifying story text and game logic in `game.js`
- Updating the UI styling in `index.html`
- Adjusting game parameters (health, damage, etc.) in `game.js`

## API Usage

This template uses the Tactics API to handle game logic. Example API call:

```bash
curl -X POST https://api.tactics.dev/run \
-H "Content-Type: application/json" \
-H "X-API-Key: YOUR_API_KEY" \
-d '{
      "initial_variables": {
        "playerHealth": 100,
        "playerDamage": 20
    },
    "tactic_id": "YOUR_TACTIC_ID"
}'
```

For more examples and documentation, visit [Tactics Documentation](https://tactics.dev/docs).

