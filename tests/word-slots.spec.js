import { test, expect } from '@playwright/test'
import {
  wordSlots,
  slotsToWord,
  setLetterAt,
  deleteLetterAt,
  firstEmptySlot,
  isWordFull
} from '../src/wordSlots.js'

test.describe('wordSlots helpers', () => {
  test('wordSlots pads to row length', () => {
    expect(wordSlots('JOXY', 5)).toEqual(['J', 'O', 'X', 'Y', '_'])
  })

  test('deleteLetterAt leaves a gap instead of shifting', () => {
    expect(deleteLetterAt('JOXYZ', 5, 0)).toBe('_OXYZ')
    expect(deleteLetterAt('JOXYZ', 5, 1)).toBe('J_XYZ')
  })

  test('deleteLetterAt clears to empty string when last letter removed', () => {
    expect(deleteLetterAt('J', 5, 0)).toBe('')
  })

  test('setLetterAt fills a gap', () => {
    expect(setLetterAt('J_XYZ', 5, 1, 'O')).toBe('JOXYZ')
  })

  test('isWordFull requires every slot filled', () => {
    expect(isWordFull('JOXYZ', 5)).toBe(true)
    expect(isWordFull('J_XYZ', 5)).toBe(false)
    expect(isWordFull('JOXY', 5)).toBe(false)
  })

  test('firstEmptySlot finds earliest gap', () => {
    expect(firstEmptySlot('J_XYZ', 5)).toBe(1)
    expect(firstEmptySlot('JOXYZ', 5)).toBe(-1)
  })

  test('slotsToWord preserves internal gaps', () => {
    expect(slotsToWord(['_', 'O', 'X', 'Y', 'Z'])).toBe('_OXYZ')
    expect(slotsToWord(['J', '_', 'X', 'Y', '_'])).toBe('J_XY')
  })
})
