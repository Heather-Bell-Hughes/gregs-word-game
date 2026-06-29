import puzzlesData from './puzzles.json'

export const puzzles = puzzlesData

export function getAllLettersForPuzzle(puzzle) {
  return (
    puzzle.sixLetter +
    puzzle.fiveLetters +
    puzzle.fourLetters +
    puzzle.threeLetters +
    puzzle.twoLetters +
    puzzle.oneLetter
  )
}

// ── Puzzle candidates ─────────────────────────────────────────────────────────
// 6L+ start words found in the tree that don't have puzzles yet.
// Run: node scripts/find-puzzle-candidates.js  (after building the tree)
// to regenerate this list.
export const puzzleCandidates = []
