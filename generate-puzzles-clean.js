#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Create bitmask for each word (26 bits, one per letter a-z)
function getWordMask(word) {
  let mask = 0
  for (const letter of word.toLowerCase()) {
    mask |= (1 << (letter.charCodeAt(0) - 97))
  }
  return mask
}

function hasNoOverlap(mask1, mask2) {
  return (mask1 & mask2) === 0
}

// Load wordlist (unique letters only, max 6 letters for puzzle generation)
const wordlistPath = path.join(process.cwd(), 'wordlist-generation.txt')
let wordlist

try {
  const data = fs.readFileSync(wordlistPath, 'utf-8')
  const allWords = data
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0)

  // All words already filtered for unique letters, just need to uppercase
  wordlist = new Set(allWords.map(w => w.toUpperCase()))

  console.log(`✓ Loaded ${wordlist.size} words from wordlist-generation.txt`)
} catch (e) {
  console.error('❌ Could not load wordlist-generation.txt')
  process.exit(1)
}

// Group words by length and pre-compute bitmasks
const wordsByLength = {}
const wordMasks = {}

for (const word of wordlist) {
  const len = word.length
  if (!wordsByLength[len]) wordsByLength[len] = []
  wordsByLength[len].push(word)
  wordMasks[word] = getWordMask(word)
}

console.log('Words by length:', Object.keys(wordsByLength).map(l => `${l}L: ${wordsByLength[l].length}`).join(', '))

function findPuzzles(twoLetterWord, maxPuzzles = 2, usedSixLetters = new Set()) {
  const puzzles = []
  const sixLetterWords = wordsByLength[6] || []
  const twoLetterMask = wordMasks[twoLetterWord]

  let checked6L = 0
  let skipped2LConflict = 0
  let skipped6LUsed = 0
  const startTime = Date.now()

  // Try each 6-letter word as the base (one puzzle per 6-letter word)
  for (const sixLetter of sixLetterWords) {
    if (puzzles.length >= maxPuzzles) break
    checked6L++

    // Skip if this 6-letter word has already been used
    if (usedSixLetters.has(sixLetter)) {
      skipped6LUsed++
      continue
    }

    const sixLetterMask = wordMasks[sixLetter]

    // Skip if 2-letter word shares letters with 6-letter word (bitwise AND)
    if (!hasNoOverlap(twoLetterMask, sixLetterMask)) {
      skipped2LConflict++
      continue
    }

    // Find compatible 5-letter words
    const fiveLetterWords = (wordsByLength[5] || []).filter(w => hasNoOverlap(wordMasks[w], sixLetterMask))
    if (fiveLetterWords.length === 0) continue

    // Search 5-letter words until we find a complete puzzle
    let foundPuzzle = false
    for (const fiveLetters of fiveLetterWords.slice(0, 500)) {
      if (foundPuzzle) break

      const fiveLetterMask = wordMasks[fiveLetters]
      const combined56 = sixLetterMask | fiveLetterMask

      // Find compatible 4-letter words
      const fourLetterWords = (wordsByLength[4] || []).filter(w => hasNoOverlap(wordMasks[w], combined56))
      if (fourLetterWords.length === 0) continue

      // Search 4-letter words
      for (const fourLetters of fourLetterWords.slice(0, 500)) {
        if (foundPuzzle) break

        const fourLetterMask = wordMasks[fourLetters]
        const combined564 = combined56 | fourLetterMask

        // Find compatible 3-letter words
        const threeLetterWords = (wordsByLength[3] || []).filter(w => hasNoOverlap(wordMasks[w], combined564))
        if (threeLetterWords.length === 0) continue

        for (const threeLetters of threeLetterWords.slice(0, 500)) {
          const threeLetterMask = wordMasks[threeLetters]
          const combined5643 = combined564 | threeLetterMask

          // Find compatible 1-letter word
          const oneLetterWords = (wordsByLength[1] || []).filter(w => hasNoOverlap(wordMasks[w], combined5643))
          if (oneLetterWords.length === 0) continue

          const oneLetter = oneLetterWords[0]

          puzzles.push({
            sixLetter,
            fiveLetters,
            fourLetters,
            threeLetters,
            twoLetters: twoLetterWord,
            oneLetter,
            difficulty: 'normal'
          })

          usedSixLetters.add(sixLetter)
          foundPuzzle = true
          break
        }
      }
    }
  }

  if (process.env.DEBUG) {
    const elapsed = Date.now() - startTime
    console.error(`  [${twoLetterWord}] ${puzzles.length} found in ${elapsed}ms`)
  }

  return puzzles
}

// Load existing puzzles to avoid duplicate 6-letter words
let existingPuzzles = []
try {
  const puzzlesModule = await import('./src/puzzles.js')
  existingPuzzles = puzzlesModule.puzzles
} catch (e) {
  // If we can't load, continue without checking existing puzzles
}

// Target 2-letter words (ones Greg hasn't used)
const targetWords = process.argv.slice(2).length > 0
  ? process.argv.slice(2).map(w => w.toUpperCase())
  : ['IT', 'IS', 'IN', 'TO', 'OR', 'AS', 'AT', 'AN', 'SO', 'NO', 'US', 'HE', 'AM', 'AX']

console.log(`\nGenerating puzzles for: ${targetWords.join(', ')}\n`)

const allPuzzles = []
const usedSixLetters = new Set()

// Add existing 6-letter words to avoid duplicates
for (const puzzle of existingPuzzles) {
  usedSixLetters.add(puzzle.sixLetter)
}

for (const twoLetter of targetWords) {
  process.stdout.write(`"${twoLetter}": `)
  const puzzles = findPuzzles(twoLetter, 2, usedSixLetters)

  if (puzzles.length === 0) {
    console.log('❌ No valid puzzles found')
    continue
  }

  console.log(`✓ ${puzzles.length} puzzle(s)`)
  allPuzzles.push(...puzzles)
}

console.log(`\n${'='.repeat(80)}`)
console.log(`\n✅ Generated ${allPuzzles.length} total puzzles\n`)

console.log('Formatted for puzzles.js:\n')
console.log('const newPuzzles = ' + JSON.stringify(allPuzzles, null, 2) + ';')

console.log(`\n${'='.repeat(80)}`)
console.log('\nTo add to your puzzles.js:')
console.log('1. Copy the JSON above')
console.log('2. Add to the export const puzzles = [ ... ] array')
