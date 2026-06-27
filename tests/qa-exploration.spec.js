/**
 * Visual QA screenshots — run with: npx playwright test tests/qa-exploration.spec.js
 */
import { test, expect } from '@playwright/test'
import { openPuzzle, typeWord, getWordBoxTexts } from './helpers.js'

const SHOT = (name) => `qa-screenshots/${name}.png`

test.describe('Visual QA screenshots', () => {
  test('capture key game states', async ({ page }) => {
    await openPuzzle(page, 1)
    await page.screenshot({ path: SHOT('01-game-initial'), fullPage: true })

    await page.getByRole('button', { name: '?' }).click()
    await page.screenshot({ path: SHOT('02-rules-modal'), fullPage: true })
    await page.getByRole('button', { name: 'Close' }).click()

    await typeWord(page, 'JOXYZ')
    await page.getByTestId('word-box-5-2').click()
    await page.screenshot({ path: SHOT('03-wrong-word-selected'), fullPage: true })

    await page.getByTestId('clear-btn').click()
    await typeWord(page, 'DROWN')
    await page.screenshot({ path: SHOT('04-valid-word-green'), fullPage: true })

    await page.getByRole('button', { name: 'Solution' }).click()
    await page.screenshot({ path: SHOT('05-solution-revealed'), fullPage: true })

    await page.goto('/1')
    await page.getByTestId('keyboard').waitFor()
    await typeWord(page, 'DROWNBUMPSKYEXA')
    await expect(page.getByText('🎉 Congratulations, Well Done!')).toBeVisible()
    await page.screenshot({ path: SHOT('06-puzzle-solved'), fullPage: true })

    await page.setViewportSize({ width: 375, height: 812 })
    await page.getByRole('button', { name: 'New Game' }).click()
    await page.screenshot({ path: SHOT('07-mobile-next-puzzle'), fullPage: true })

    expect(await getWordBoxTexts(page, 5)).toBe('')
  })
})
