import { expect } from '@playwright/test'

/** Common phone viewports for layout QA. */
export const PHONE_VIEWPORTS = [
  { id: 'iphone-se', name: 'iPhone SE', width: 320, height: 568 },
  { id: 'iphone-13-mini', name: 'iPhone 13 mini', width: 375, height: 812 },
  { id: 'galaxy-s8', name: 'Galaxy S8', width: 360, height: 740 },
  { id: 'iphone-12', name: 'iPhone 12', width: 390, height: 844 },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', width: 430, height: 932 },
]

export async function assertMobileLayout(page) {
  const letterBox = await page.locator('.letter-box').first().boundingBox()
  expect(letterBox.width).toBeGreaterThanOrEqual(44)
  expect(letterBox.height).toBeGreaterThanOrEqual(44)
  const wordBox = await page.getByTestId('word-box-5-0').boundingBox()
  const keyBox = await page.getByTestId('keyboard-key-Q').boundingBox()
  expect(wordBox.width).toBeGreaterThanOrEqual(44)
  expect(wordBox.height).toBeGreaterThanOrEqual(44)
  expect(wordBox.width).toBeGreaterThanOrEqual(keyBox.width - 1)

  const dimensions = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
  }))
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 12)

  const sixLetterCenter = await page.getByTestId('six-letter-row').evaluate(el => {
    const r = el.getBoundingClientRect()
    return r.left + r.width / 2
  })
  for (const size of [5, 4, 3, 2, 1]) {
    const center = await page.getByTestId(`word-row-${size}`).evaluate(el => {
      const r = el.getBoundingClientRect()
      return r.left + r.width / 2
    })
    expect(Math.abs(center - sixLetterCenter)).toBeLessThan(2)
  }

  const keyboardBox = await page.getByTestId('keyboard').boundingBox()
  const viewport = page.viewportSize()
  expect(keyboardBox.x).toBeGreaterThanOrEqual(0)
  expect(keyboardBox.x + keyboardBox.width).toBeLessThanOrEqual(viewport.width + 1)
  const keyboardCenter = keyboardBox.x + keyboardBox.width / 2
  expect(Math.abs(keyboardCenter - viewport.width / 2)).toBeLessThan(12)

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
}

export function deviceScreenshotPath(deviceId, scenario) {
  return `qa-screenshots/devices/${deviceId}-${scenario}.png`
}
