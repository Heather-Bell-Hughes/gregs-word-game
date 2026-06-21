// Auto-generated dictionary from SCOWL word list
// Contains 167,190 valid English words

import dictionaryText from './dictionary.txt?raw'

let _dictionary = null

export function getDictionary() {
  if (!_dictionary) {
    // Create a Set of all words for fast O(1) lookup
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
