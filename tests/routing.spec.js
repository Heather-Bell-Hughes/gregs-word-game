import { test, expect } from '@playwright/test'
import { typeWord } from './helpers.js'

test.describe('AlphaDelta routing', () => {
  test('loads straight into a puzzle at /', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('game-screen')).toBeVisible()
    await expect(page.getByTestId('keyboard')).toBeVisible()
    await expect(page.getByTestId('six-letter-row')).toBeVisible()
  })

  test('loads puzzle 1 at /1 with GLITCH', async ({ page }) => {
    await page.goto('/1')
    await expect(page.getByTestId('six-letter-row')).toHaveText('GLITCH')
    await expect(page.getByText('AlphaDelta #1')).toBeVisible()
  })

  test('loads puzzle 2 at /2 with BRUNCH', async ({ page }) => {
    await page.goto('/2')
    await expect(page.getByTestId('six-letter-row')).toHaveText('BRUNCH')
    await expect(page.getByText('AlphaDelta #2')).toBeVisible()
  })

  test('updates URL when starting the next puzzle', async ({ page }) => {
    await page.goto('/1')
    await page.getByTestId('keyboard').waitFor()
    await typeWord(page, 'DROWNBUMPSKYEXA')
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()
    await page.getByRole('button', { name: 'New Game' }).click()
    await expect(page).toHaveURL(/\/2\/?$/)
    await expect(page.getByTestId('six-letter-row')).toHaveText('BRUNCH')
  })

  test('loads hidden menu at /menu with no link from puzzle', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.getByTestId('menu-screen')).toBeVisible()
    await expect(page.getByText('🧩 AlphaDelta')).toBeVisible()
    await expect(page.getByTestId('game-screen')).toHaveCount(0)

    await page.goto('/1')
    await expect(page.getByTestId('game-screen')).toBeVisible()
    await expect(page.getByTestId('menu-screen')).toHaveCount(0)
    await expect(page.getByRole('link', { name: /menu/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /menu/i })).toHaveCount(0)
  })

  test('menu puzzle selection navigates to puzzle URL', async ({ page }) => {
    await page.goto('/menu')
    await page.getByTestId('menu-puzzle-3').click()
    await expect(page).toHaveURL(/\/3\/?$/)
    await expect(page.getByTestId('six-letter-row')).toHaveText('THINKS')
    await expect(page.getByTestId('menu-screen')).toHaveCount(0)
  })
})