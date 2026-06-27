/** Epoch for cycling daily puzzles at `/` (UTC midnight). */
const PUZZLE_EPOCH = Date.UTC(2024, 0, 1)

function getBaseUrl() {
  return (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
}

export function getTodaysPuzzleIndex(puzzleCount) {
  const today = new Date()
  const utcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const dayNumber = Math.floor((utcMidnight - PUZZLE_EPOCH) / 86_400_000)
  return ((dayNumber % puzzleCount) + puzzleCount) % puzzleCount
}

function stripBasePath(pathname, baseUrl = getBaseUrl()) {
  const base = baseUrl.replace(/\/$/, '')
  if (base && base !== '' && pathname.startsWith(base)) {
    const stripped = pathname.slice(base.length)
    return stripped.startsWith('/') ? stripped : `/${stripped}`
  }
  return pathname
}

/** Parse `/`, `/1`, `/42` into a zero-based puzzle index. */
export function parsePuzzleIndexFromPath(pathname, puzzleCount, baseUrl = getBaseUrl()) {
  const path = stripBasePath(pathname, baseUrl)

  if (path === '/' || path === '') {
    return getTodaysPuzzleIndex(puzzleCount)
  }

  const match = path.match(/^\/(\d+)\/?$/)
  if (match) {
    const n = parseInt(match[1], 10)
    return Math.min(Math.max(n - 1, 0), puzzleCount - 1)
  }

  return getTodaysPuzzleIndex(puzzleCount)
}

export function puzzlePath(index, baseUrl = getBaseUrl()) {
  const base = baseUrl
  return `${base}${index + 1}`.replace(/([^:]\/)\/+/g, '$1')
}

export function navigateToPuzzle(index) {
  const url = puzzlePath(index)
  window.history.pushState({ puzzleIndex: index }, '', url)
}
