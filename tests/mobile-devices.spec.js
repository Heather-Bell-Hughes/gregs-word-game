/**
 * Layout + screenshot QA across common phone sizes.
 * Run: npm run test:devices
 */
import { mkdirSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { openPuzzle, typeWord } from './helpers.js'
import {
  PHONE_VIEWPORTS,
  assertMobileLayout,
  deviceScreenshotPath,
} from './device-layout-helpers.js'

mkdirSync('qa-screenshots/devices', { recursive: true })

for (const device of PHONE_VIEWPORTS) {
  test.describe(`${device.name} (${device.width}×${device.height})`, () => {
    test.use({ viewport: { width: device.width, height: device.height } })

    test('layout passes and screenshots capture key states', async ({ page }) => {
      await openPuzzle(page, 3)
      await assertMobileLayout(page)
      await page.screenshot({
        path: deviceScreenshotPath(device.id, 'initial'),
        fullPage: false,
      })

      await typeWord(page, 'CROW')
      await assertMobileLayout(page)
      await page.screenshot({
        path: deviceScreenshotPath(device.id, 'typing'),
        fullPage: false,
      })

      await typeWord(page, 'D')
      await page.screenshot({
        path: deviceScreenshotPath(device.id, 'valid-row'),
        fullPage: false,
      })

      await typeWord(page, 'JOXY')
      await page.getByTestId('word-box-4-0').click()
      await page.screenshot({
        path: deviceScreenshotPath(device.id, 'wrong-word'),
        fullPage: false,
      })

      await expect(page.getByTestId('keyboard')).toBeVisible()
      await expect(page.getByTestId('six-letter-row')).toBeVisible()
    })
  })
}
