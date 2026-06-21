import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDictionary() {
  const possiblePaths = [
    '/usr/share/dict/words',
    '/usr/dict/words',
    '/opt/homebrew/share/dict/words'
  ];

  for (const dictPath of possiblePaths) {
    if (fs.existsSync(dictPath)) {
      console.log(`📚 Loading dictionary from: ${dictPath}`);
      const content = fs.readFileSync(dictPath, 'utf-8');
      return content
        .split('\n')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length > 0 && /^[A-Z]+$/.test(w));
    }
  }

  throw new Error('Dictionary not found');
}

function hasUniqueLetters(word) {
  return new Set(word).size === word.length;
}

function getLetters(word) {
  return new Set(word);
}

function hasCommonLetters(...words) {
  const combined = new Set();
  for (let i = 0; i < words.length - 1; i++) {
    for (const letter of words[i]) {
      if (combined.has(letter) || words[words.length - 1].includes(letter)) return true;
      combined.add(letter);
    }
  }
  return false;
}

function totalLetters(...words) {
  const all = words.join('');
  return all.length === 21 && new Set(all).size === 21;
}

function generatePuzzles(count = 30) {
  console.log('🎮 Generating word puzzles...\n');

  const words = loadDictionary();
  console.log(`📖 Loaded ${words.length} words\n`);

  const byLength = {};
  for (const word of words) {
    if (!byLength[word.length]) byLength[word.length] = [];
    byLength[word.length].push(word);
  }

  const six = (byLength[6] || []).filter(hasUniqueLetters);
  const five = (byLength[5] || []).filter(hasUniqueLetters);
  const four = (byLength[4] || []).filter(hasUniqueLetters);
  const three = (byLength[3] || []).filter(hasUniqueLetters);
  const two = (byLength[2] || []).filter(hasUniqueLetters);
  const one = (byLength[1] || []).filter(hasUniqueLetters);

  console.log(`Unique letter words: 6=${six.length}, 5=${five.length}, 4=${four.length}, 3=${three.length}, 2=${two.length}, 1=${one.length}\n`);

  const puzzles = [];
  const seen = new Set();
  let attempts = 0;

  for (const sixLetter of six) {
    if (puzzles.length >= count) break;

    for (const fiveLetter of five) {
      if (puzzles.length >= count) break;
      if (hasCommonLetters(sixLetter, fiveLetter)) continue;

      for (const fourLetter of four) {
        if (puzzles.length >= count) break;
        if (hasCommonLetters(sixLetter + fiveLetter, fourLetter)) continue;

        for (const threeLetter of three) {
          if (puzzles.length >= count) break;
          if (hasCommonLetters(sixLetter + fiveLetter + fourLetter, threeLetter)) continue;

          for (const twoLetter of two) {
            if (puzzles.length >= count) break;
            if (hasCommonLetters(sixLetter + fiveLetter + fourLetter + threeLetter, twoLetter)) continue;

            for (const oneLetter of one) {
              attempts++;
              if (hasCommonLetters(sixLetter + fiveLetter + fourLetter + threeLetter + twoLetter, oneLetter)) continue;

              if (totalLetters(sixLetter, fiveLetter, fourLetter, threeLetter, twoLetter, oneLetter)) {
                const key = [sixLetter, fiveLetter, fourLetter, threeLetter, twoLetter, oneLetter].join('|');
                if (seen.has(key)) continue;
                seen.add(key);

                puzzles.push({ sixLetter, fiveLetters: fiveLetter, fourLetters: fourLetter, threeLetters: threeLetter, twoLetters: twoLetter, oneLetter });
                console.log(`✓ Puzzle #${puzzles.length}: ${sixLetter} → ${fiveLetter} ${fourLetter} ${threeLetter} ${twoLetter} ${oneLetter}`);

                if (puzzles.length >= count) break;
              }
            }
          }
        }
      }
    }
  }

  console.log(`\n📊 Complete! Found ${puzzles.length}/${count} puzzles in ${attempts} attempts\n`);

  if (puzzles.length > 0) {
    const output = `export const puzzles = [\n${puzzles.map(p => `  { sixLetter: "${p.sixLetter}", fiveLetters: "${p.fiveLetters}", fourLetters: "${p.fourLetters}", threeLetters: "${p.threeLetters}", twoLetters: "${p.twoLetters}", oneLetter: "${p.oneLetter}" }`).join(',\n')}\n];\n`;
    fs.writeFileSync(path.join(__dirname, 'generated-puzzles.js'), output);
    console.log(`💾 Saved ${puzzles.length} puzzles to generated-puzzles.js\n`);
  }

  return puzzles;
}

generatePuzzles(30);
