/** Pad word to fixed row length with `_` for empty slots. */
export function wordSlots(word, wordSize) {
  return word.padEnd(wordSize, '_').slice(0, wordSize).split('')
}

/** Serialize slots back to stored word string. */
export function slotsToWord(slots) {
  const s = slots.join('')
  if (!s.replace(/_/g, '')) return ''
  if (s.startsWith('_') || /_[A-Z]/.test(s)) {
    return s.replace(/_+$/, '')
  }
  return s.replace(/_+$/, '')
}

export function setLetterAt(word, wordSize, index, letter) {
  const slots = wordSlots(word, wordSize)
  slots[index] = letter
  return slotsToWord(slots)
}

export function deleteLetterAt(word, wordSize, boxIndex) {
  const slots = wordSlots(word, wordSize)

  let targetIndex = boxIndex
  if (targetIndex === null) {
    for (let i = wordSize - 1; i >= 0; i--) {
      if (slots[i] !== '_') {
        targetIndex = i
        break
      }
    }
    if (targetIndex === null) return word
  }

  if (targetIndex < 0 || targetIndex >= wordSize || slots[targetIndex] === '_') {
    return word
  }

  slots[targetIndex] = '_'
  return slotsToWord(slots)
}

export function firstEmptySlot(word, wordSize) {
  const slots = wordSlots(word, wordSize)
  return slots.indexOf('_')
}

export function isWordFull(word, wordSize) {
  return wordSlots(word, wordSize).every(c => c !== '_')
}
