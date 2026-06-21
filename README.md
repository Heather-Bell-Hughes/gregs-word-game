# Greg's Word Game 🎮

A fun word puzzle game where you find all the words using limited letters!

## How to Play

1. **Look at the main word** - A 6-letter word is displayed at the top
2. **Find the remaining words** - Using only the 20 letters left (after the 6-letter word), create:
   - 1 five-letter word
   - 1 four-letter word
   - 1 three-letter word
   - 1 two-letter word
   - 1 one-letter word
3. **Use each letter only once** - You have exactly 26 letters to use (6 + 5 + 4 + 3 + 2 + 1 = 21... wait, that's 21. You'll have 5 letters left over!)
4. **Enter your words** - Type each word in the input fields
5. **Check your answers** - Click "Check" to see if you got them right
6. **Progress through puzzles** - Move to the next puzzle when you solve one!

## Game Rules

- Each 6-letter puzzle comes with specific correct answers
- Letters must be used from the available pool only
- Case doesn't matter (enter in any case)
- Word lengths are enforced automatically
- Visual feedback shows which words are correct (green) or incorrect (red)

## How to Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface
1. Fork or create a repository on GitHub
2. Upload `index.html` and `words.json` to the main branch
3. Go to Settings → Pages
4. Set "Source" to "Deploy from a branch"
5. Select "main" branch and "/" folder
6. Click Save
7. Your game will be available at `https://yourusername.github.io/gregs-word-game/`

### Option 2: Using Git Command Line
```bash
# Navigate to your local repo
cd gregs-word-game

# Add the remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/gregs-word-game.git

# Push to GitHub
git branch -M main
git push -u origin main

# Enable GitHub Pages in repository settings
```

### Option 3: Quick Test Locally
```bash
# Python 3
python3 -m http.server 8000

# Or Node.js
npx http-server

# Then visit http://localhost:8000
```

## Features

✅ **Mobile Responsive** - Works perfectly on phones, tablets, and desktops
✅ **20 Puzzles** - Multiple word combinations to solve
✅ **Instant Feedback** - Visual validation as you enter answers
✅ **No Installation Required** - Works in any modern web browser
✅ **Offline Ready** - Works even without internet connection
✅ **Modern Design** - Beautiful gradient background and smooth animations

## Puzzle Data

The game includes 20 pre-loaded puzzles with their solutions. To add more puzzles, edit the `puzzles` array in `index.html` with the format:

```javascript
{
  sixLetter: "GLITCH",
  fiveLetters: "CROWN",
  fourLetters: "BUMP",
  threeLetters: "SKY",
  twoLetters: "EX",
  oneLetter: "A"
}
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Game won't load?**
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Make sure JavaScript is enabled

**Words not validating?**
- Check spelling - answers are case-insensitive
- Verify each word is the correct length
- Make sure you've filled all fields

**Having trouble on mobile?**
- Try landscape orientation for better visibility
- Make sure your browser is up to date

## Enjoy! 🎉

Have fun solving the word puzzles! Each puzzle has a unique combination of words to discover.
