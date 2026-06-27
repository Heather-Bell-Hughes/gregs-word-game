/**
 * Smoke tests against the live GitHub Pages site.
 * Run: npm run test:production
 */
import { test, expect } from '@playwright/test'
import { assertMobileLayout, PHONE_VIEWPORTS } from './device-layout-helpers.js'
import { mkdirSync } from 'node:fs'

const PRODUCTION_BASE = 'https://heather-bell-hughes.github.io/gregs-word-game'

mkdirSync('qa-screenshots/production', { recursive: true })

test.describe('Production site smoke tests', () => {
  test.use({ baseURL: PRODUCTION_BASE })

  test('root loads the game', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('game-screen')).toBeVisible()
    await expect(page.getByTestId('keyboard')).toBeVisible()
    await expect(page.getByTestId('six-letter-row')).toBeVisible()
  })

  test('puzzle routes load via SPA fallback', async ({ page }) => {
    await page.goto('/1')
    await expect(page.getByTestId('six-letter-row')).toHaveText('GLITCH')
    await expect(page.getByText('AlphaDelta #1')).toBeVisible()

    await page.goto('/3')
    await expect(page.getByTestId('six-letter-row')).toHaveText('THINKS')
    await expect(page.getByText('AlphaDelta #3')).toBeVisible()
  })

  test('404.html exists for deep links', async ({ request }) => {
    const response = await request.get(`${PRODUCTION_BASE}/404.html`)
    expect(response.status()).toBe(200)
  })

  for (const device of PHONE_VIEWPORTS.slice(0, 3)) {
    test(`mobile layout on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height })
      await page.goto('/3')
      await page.getByTestId('keyboard').waitFor()
      await assertMobileLayout(page)
      await page.screenshot({
        path: `qa-screenshots/production/${device.id}.png`,
        fullPage: false,
      })
    })
  }
})
