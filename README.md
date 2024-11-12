# Dragon Slayer Adventure Template

A simple example of how to use the Tactics API to create a text-based adventure game.

## How to Use This Template

1. Click the "Use this template" button at the top of this repository to create a copy in your GitHub account
2. Clone your new repository to your local machine:
   ```bash
   git clone https://github.com/[your-username]/[repo-name].git
   cd [repo-name]
   ```
3. Create an API key:
   - Go to [https://tactics.dev/keys](https://tactics.dev/keys)
   - Sign in or create an account
   - Click "Create New Key"
   - Copy your new API key

4. Update the API key in `game.js`:
   ```javascript
   const API_KEY = 'your-api-key-here';
   ```

5. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Select "/ (root)" as the folder
   - Click "Save"
   - Wait a few minutes for deployment

6. Access your game:
   - Your game will be available at `https://[your-username].github.io/[repo-name]`
   - It may take a few minutes for the initial deployment to complete

7. Test your game locally (optional):
   - Open `index.html` in your browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     ```
   - Then visit `http://localhost:8000` in your browser

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

