import { wordSlots } from './wordSlots'

export const WORD_ORDER = [5, 4, 3, 2, 1]

/** Letters already taken by the six-letter word and all filled word boxes. */
export function getUsedLetters(words, sixLetter, excludeSize = null, excludeIndex = null) {
  const used = new Set(sixLetter.split(''))
  for (const size of WORD_ORDER) {
    const slots = wordSlots(words[size] || '', size)
    for (let i = 0; i < size; i++) {
      const char = slots[i]
      if (char === '_') continue
      if (size === excludeSize && i === excludeIndex) continue
      used.add(char)
    }
  }
  return used
}
