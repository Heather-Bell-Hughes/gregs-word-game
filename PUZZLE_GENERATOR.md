# Puzzle Generator

This project includes a script to automatically generate valid word puzzle solutions from the system dictionary.

## How to Use

```bash
# Generate 30 puzzles (default)
node generate-puzzles.js

# Edit the script to change the count
# Change this line at the bottom:
# generatePuzzles(30);  ← change 30 to your desired count
```

## How It Works

The generator:
1. Loads the system dictionary (/usr/share/dict/words)
2. Filters to only words with unique letters (no repeated letters)
3. Finds valid combinations where:
   - All 21 letters are unique across all 6 words
   - No letter appears in multiple words
   - Uses exactly: 1 six-letter + 1 five-letter + 1 four-letter + 1 three-letter + 1 two-letter + 1 one-letter word

## Output

The script saves valid puzzles to `generated-puzzles.js` in the format needed for the game:

```javascript
export const puzzles = [
  { sixLetter: "ABDEST", fiveLetters: "CHING", fourLetters: "FLOP", threeLetters: "JUR", twoLetters: "MY", oneLetter: "K" },
  // ... more puzzles
];
```

## Tips

- First run takes ~5-15 seconds depending on how many puzzles you request
- More puzzles = longer generation time (roughly exponential)
- Start with smaller counts (10-30) and increase as needed
- The algorithm finds valid combinations fairly quickly on modern hardware

## Integration

Once you have generated puzzles:
1. Copy the relevant puzzles from `generated-puzzles.js`
2. Add them to `src/puzzles.js`
3. Test them in the game!

Example:
```javascript
// In src/puzzles.js, add to the puzzles array:
{
  sixLetter: "GLITCH",
  fiveLetters: "DROWN",
  fourLetters: "BUMP",
  threeLetters: "SKY",
  twoLetters: "EX",
  oneLetter: "A"
}
```
