// Everyday English word list (SCOWL-50 filtered)
// See WORDLIST.md for generation details

import dictionaryText from '../wordlist.txt?raw'

let _dictionary = null

export function getDictionary() {
  if (!_dictionary) {
    _dictionary = new Set(
      dictionaryText
        .split('\n')
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0)
    )
  }
  return _dictionary
}

export function isValidWord(word) {
  return getDictionary().has(word.toUpperCase())
}
