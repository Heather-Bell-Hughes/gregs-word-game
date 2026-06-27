import { test, expect } from '@playwright/test'
import { openFirstPuzzle, typeWord } from './helpers.js'

test.describe('AlphaDelta mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await openFirstPuzzle(page)
  })

  test('keyboard rows are centered together on mobile', async ({ page }) => {
    const rowCenters = await page.locator('.keyboard-row').evaluateAll(rows =>
      rows.map(row => {
        const keys = [...row.querySelectorAll('.keyboard-key')]
        const rects = keys.map(key => key.getBoundingClientRect())
        const left = Math.min(...rects.map(r => r.left))
        const right = Math.max(...rects.map(r => r.right))
        return (left + right) / 2
      })
    )
    const spread = Math.max(...rowCenters) - Math.min(...rowCenters)
    expect(spread).toBeLessThan(4)
  })

  test('keyboard stays centered within the viewport on mobile', async ({ page }) => {
    const box = await page.getByTestId('keyboard').boundingBox()
    const viewport = page.viewportSize()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
    const keyboardCenter = box.x + box.width / 2
    expect(Math.abs(keyboardCenter - viewport.width / 2)).toBeLessThan(12)
  })

  test('keyboard stays centered on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/3')
    await page.getByTestId('keyboard').waitFor()
    const box = await page.getByTestId('keyboard').boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(321)
    const keyboardCenter = box.x + box.width / 2
    expect(Math.abs(keyboardCenter - 160)).toBeLessThan(12)
  })

  test('keyboard keys use fluid sizing with touch-friendly height on mobile', async ({ page }) => {
    const key = page.getByTestId('keyboard-key-Q')
    const box = await key.boundingBox()
    expect(box.width).toBeGreaterThan(33)
    expect(box.height).toBeGreaterThanOrEqual(44)
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
