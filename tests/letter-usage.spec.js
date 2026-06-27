import { test, expect } from '@playwright/test'
import { getUsedLetters } from '../src/letterUsage.js'

test.describe('getUsedLetters', () => {
  const sixLetter = 'GLITCH'
  const emptyWords = { 5: '', 4: '', 3: '', 2: '', 1: '' }

  test('includes six-letter word letters', () => {
    const used = getUsedLetters(emptyWords, sixLetter)
    expect([...used].sort().join('')).toBe('CGHILT')
  })

  test('includes letters from all word rows', () => {
    const words = { 5: 'RENDS', 4: 'BRA', 3: '', 2: '', 1: '' }
    const used = getUsedLetters(words, sixLetter)
    expect(used.has('N')).toBe(true)
    expect(used.has('R')).toBe(true)
    expect(used.has('B')).toBe(true)
  })

  test('excludes letter at replace position', () => {
    const words = { 5: 'RENDS', 4: '', 3: '', 2: '', 1: '' }
    const used = getUsedLetters(words, sixLetter, 5, 2)
    expect(used.has('N')).toBe(false)
    expect(used.has('R')).toBe(true)
  })
})
