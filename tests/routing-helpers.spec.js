import { test, expect } from '@playwright/test'
import { getTodaysPuzzleIndex, isMenuPath, menuPath, parsePuzzleIndexFromPath } from '../src/routing.js'

test.describe('routing helpers', () => {
  const count = 100

  test('parsePuzzleIndexFromPath returns today for /', () => {
    expect(parsePuzzleIndexFromPath('/', count)).toBe(getTodaysPuzzleIndex(count))
  })

  test('parsePuzzleIndexFromPath maps /1 to index 0', () => {
    expect(parsePuzzleIndexFromPath('/1', count)).toBe(0)
  })

  test('parsePuzzleIndexFromPath maps /42 to index 41', () => {
    expect(parsePuzzleIndexFromPath('/42', count)).toBe(41)
  })

  test('parsePuzzleIndexFromPath clamps out-of-range numbers', () => {
    expect(parsePuzzleIndexFromPath('/999', count)).toBe(99)
    expect(parsePuzzleIndexFromPath('/0', count)).toBe(0)
  })

  test('parsePuzzleIndexFromPath strips GitHub Pages base path', () => {
    expect(parsePuzzleIndexFromPath('/AlphaDelta/3', count, '/AlphaDelta/')).toBe(2)
    expect(parsePuzzleIndexFromPath('/AlphaDelta/', count, '/AlphaDelta/')).toBe(getTodaysPuzzleIndex(count))
  })

  test('isMenuPath detects /menu with and without base path', () => {
    expect(isMenuPath('/menu')).toBe(true)
    expect(isMenuPath('/menu/')).toBe(true)
    expect(isMenuPath('/AlphaDelta/menu', '/AlphaDelta/')).toBe(true)
    expect(isMenuPath('/1')).toBe(false)
    expect(isMenuPath('/')).toBe(false)
  })

  test('menuPath includes GitHub Pages base path', () => {
    expect(menuPath('/AlphaDelta/')).toBe('/AlphaDelta/menu')
  })
})
