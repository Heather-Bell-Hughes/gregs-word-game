# Word List Generation

## Overview

This project uses **SCOWL-50** (Spell Checker Oriented Word Lists) filtered for everyday English words suitable for word games.

## Final Word Lists

### Main Wordlist (Validation)
**File:** `wordlist.txt`
- **Total words:** 61,547
- **Characteristics:**
  - All lowercase (removes proper nouns and acronyms)
  - No possessives
  - Single letters: only 'a' and 'i' (real words, not b-z letter names)
  - Contains at least one vowel (no abbreviations like RPM, MPG, PKG, etc.)
  - Includes real 2-letter words (ad, ah, am, an, as, at, aw, be, by, do, ex, go, he, if, in, is, it, my, no, of, on, or, to, up, us, we, etc.)
  - Used for: Word validation when checking player answers

### Generation Wordlist (Puzzle Creation)
**File:** `wordlist-generation.txt`
- **Total words:** 8,958
- **Characteristics:**
  - Same as main wordlist, PLUS:
  - Contains only words with **unique letters** (no duplicates like BOOK, LETTER)
  - Maximum 6 letters (puzzle only needs 1-6 letter words)
  - Used for: Generating valid puzzle combinations

## Generation Process

### Step 1: Clone English Speller Database
```bash
git clone https://github.com/en-wl/wordlist.git
cd wordlist
```

### Step 2: Build the Database
```bash
make
```
Creates `scowl.db` SQLite database from source data.

### Step 3: Generate SCOWL-50
```bash
./scowl word-list 50 A '' --apostrophe False --deaccent > scowl-50-fresh.txt
```
- `50` = top 50% most common words by frequency
- `A` = American English
- `--apostrophe False` = excludes possessives
- `--deaccent` = removes accented characters

### Step 4: Filter for Everyday Words
```bash
grep "^[a-z]*$" scowl-50-fresh.txt | grep -v "^[b-h,j-z]$" > scowl-50-clean.txt
```
- Keeps only lowercase words (removes capitalized proper nouns and all-caps acronyms)
- Removes single letters b-h and j-z (keeps only 'a' and 'i' which are real English words)
- Result: 61,612 words

### Step 5: Remove No-Vowel Words and Abbreviations
```bash
node << 'EOF'
const fs = require('fs');
const vowels = /[aeiouy]/i;
const words = fs.readFileSync('scowl-50-clean.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w.length > 0 && vowels.test(w));
fs.writeFileSync('wordlist.txt', words.join('\n'));
EOF
```
- Removes 62 words with no vowels (abbreviations like: RPM, MPG, PKG, HWY, CF, FT, KG, etc.)
- Result: `wordlist.txt` with 61,550 words

### Step 6: Remove Obscure/Non-Words
```bash
# Manually remove: HWY, PYX, PYXES
grep -v "^hwy$\|^pyx$\|^pyxes$" wordlist.txt > wordlist.txt.tmp && mv wordlist.txt.tmp wordlist.txt
```
- Result: `wordlist.txt` with 61,547 words

### Step 7: Create Puzzle Generation Wordlist
```bash
node << 'EOF'
const fs = require('fs');
const words = fs.readFileSync('wordlist.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w.length > 0 && w.length <= 6);

// Keep only words with unique letters (no duplicates)
const uniqueLetterWords = words.filter(word => {
  const unique = new Set(word);
  return unique.size === word.length;
});

fs.writeFileSync('wordlist-generation.txt', uniqueLetterWords.join('\n'));
EOF
```
- Filters to max 6 letters (puzzle only uses 1-6 letter words)
- Keeps only words with unique letters (no word can repeat a letter in our puzzle structure)
- Result: `wordlist-generation.txt` with 8,958 words

## Usage

### wordlist.txt (Main Validation Dictionary)
- Used by the game to validate player answers
- Contains all cleaned English words (61,547 total)
- Includes words of any length

### wordlist-generation.txt (Puzzle Generation Dictionary)
- Used by `generate-puzzles-clean.js` to create new puzzles
- Contains only words with unique letters, max 6 letters (8,958 total)
- Ensures all puzzle words meet the constraint of non-overlapping letters

## Rebuilding the Wordlists

To rebuild from scratch starting from `wordlist.txt`:

1. Start with `wordlist.txt` (or regenerate from SCOWL-50 using Steps 1-6 above)
2. Run Step 7 to create `wordlist-generation.txt`

Both processes are automated and can be run with the Node scripts shown in each step.

## External Resources

- **ESDB Project:** https://github.com/en-wl/wordlist
- **SCOWL Documentation:** Official Spell Checker Oriented Word Lists project
