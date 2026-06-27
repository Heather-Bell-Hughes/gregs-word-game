import { test, expect } from '@playwright/test'
import { openFirstPuzzle, typeWord } from './helpers.js'

test.describe('AlphaDelta mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await openFirstPuzzle(page)
  })

  test('keyboard keys remain centered on mobile', async ({ page }) => {
    const key = page.getByTestId('keyboard-key-A')
    const centered = await key.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.display.includes('flex') &&
        style.alignItems === 'center' &&
        style.justifyContent === 'center'
    })
    expect(centered).toBe(true)
  })

  test('word boxes and keyboard are visible on mobile', async ({ page }) => {
    await expect(page.getByTestId('word-box-5-0')).toBeVisible()
    await expect(page.getByTestId('keyboard-key-Q')).toBeVisible()
    await expect(page.getByTestId('keyboard-delete')).toBeVisible()
  })

  test('can type and edit on mobile viewport', async ({ page }) => {
    await typeWord(page, 'JOXYZ')
    await page.getByTestId('word-box-5-0').click()
    await page.getByTestId('keyboard-delete').click()
    await expect(page.getByTestId('word-box-5-0')).toHaveText('')
    await expect(page.getByTestId('word-box-5-1')).toHaveText('O')
  })
})
