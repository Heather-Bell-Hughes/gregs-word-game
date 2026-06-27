import { test, expect } from '@playwright/test'
import { openFirstPuzzle, typeWord, getWordBoxTexts, getWordRowClasses } from './helpers.js'

test.describe('AlphaDelta game', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstPuzzle(page)
  })

  test('renders keyboard with all letter keys', async ({ page }) => {
    const keyboard = page.getByTestId('keyboard')
    await expect(keyboard).toBeVisible()

    for (const letter of 'QWERTYUIOPASDFGHJKLZXCVBNM') {
      await expect(page.getByTestId(`keyboard-key-${letter}`)).toBeVisible()
    }
    await expect(page.getByTestId('keyboard-delete')).toBeVisible()
  })

  test('keyboard keys center their label text', async ({ page }) => {
    for (const letter of ['Q', 'A', 'Z', 'M']) {
      const key = page.getByTestId(`keyboard-key-${letter}`)
      const box = await key.boundingBox()
      expect(box).not.toBeNull()

    const centered = await key.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.display.includes('flex') &&
        style.alignItems === 'center' &&
        style.justifyContent === 'center'
    })
      expect(centered).toBe(true)
    }
  })

  test('disabled letters from the 6-letter word cannot be typed', async ({ page }) => {
    await page.getByTestId('keyboard-key-H').click()
    expect(await getWordBoxTexts(page, 5)).toBe('')

    await page.getByTestId('keyboard-key-G').click()
    expect(await getWordBoxTexts(page, 5)).toBe('')
  })

  test('types letters into the active word row', async ({ page }) => {
    await typeWord(page, 'JUMBO')
    expect(await getWordBoxTexts(page, 5)).toBe('JUMBO')
  })

  test('invalid word is marked wrong and stays on the same row', async ({ page }) => {
    await typeWord(page, 'JOXYZ')
    expect(await getWordBoxTexts(page, 5)).toBe('JOXYZ')

    for (let i = 0; i < 5; i++) {
      const classes = await getWordRowClasses(page, 5, i)
      expect(classes).toContain('wrong')
    }

    // Should not have advanced to the 4-letter row
    expect(await getWordBoxTexts(page, 4)).toBe('')
    const fourLetterBox = page.getByTestId('word-box-4-0')
    const classes = await fourLetterBox.getAttribute('class')
    expect(classes).not.toContain('focused')
  })

  test('focused letter on a wrong word has a visible white outline', async ({ page }) => {
    await typeWord(page, 'JOXYZ')
    await page.getByTestId('word-box-5-2').click()

    const outline = await page.getByTestId('word-box-5-2').evaluate((el) => {
      const style = window.getComputedStyle(el)
      return {
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        className: el.className,
      }
    })

    expect(outline.className).toContain('focused')
    expect(outline.className).toContain('wrong')
    expect(parseFloat(outline.outlineWidth)).toBeGreaterThan(0)
  })

  test('can select and replace a letter on a wrong word', async ({ page }) => {
    await typeWord(page, 'JOXYZ')
    await page.getByTestId('word-box-5-2').click()
    await page.getByTestId('keyboard-key-W').click()
    expect(await getWordBoxTexts(page, 5)).toBe('JOWYZ')
  })

  test('can delete a letter at the selected position on a wrong word', async ({ page }) => {
    await typeWord(page, 'JOXYZ')
    await page.getByTestId('word-box-5-0').click()
    await page.getByTestId('keyboard-delete').click()
    expect(await getWordBoxTexts(page, 5)).toBe('OXYZ')
    await expect(page.getByTestId('word-box-5-0')).toHaveText('')
    await expect(page.getByTestId('word-box-5-1')).toHaveText('O')
  })

  test('backspace deletes at the selected letter position', async ({ page }) => {
    await typeWord(page, 'JOXY')
    await page.getByTestId('word-box-5-1').click()
    await page.keyboard.press('Backspace')
    expect(await getWordBoxTexts(page, 5)).toBe('JXY')
    await expect(page.getByTestId('word-box-5-0')).toHaveClass(/focused/)
    await expect(page.getByTestId('word-box-5-1')).toHaveText('')
    await expect(page.getByTestId('word-box-5-2')).toHaveText('X')
  })

  test('backspace on an empty box moves to the prior box', async ({ page }) => {
    await typeWord(page, 'JOXY')
    await page.getByTestId('word-box-5-1').click()
    await page.keyboard.press('Backspace')
    await page.getByTestId('word-box-5-1').click()
    await page.keyboard.press('Backspace')
    await expect(page.getByTestId('word-box-5-0')).toHaveClass(/focused/)
    expect(await getWordBoxTexts(page, 5)).toBe('JXY')
  })

  test('arrow keys move selection within the active row', async ({ page }) => {
    await typeWord(page, 'JOXY')
    await page.getByTestId('word-box-5-0').click()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('word-box-5-1')).toHaveClass(/focused/)
    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('word-box-5-2')).toHaveClass(/focused/)
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByTestId('word-box-5-1')).toHaveClass(/focused/)
  })

  test('valid word is marked correct and advances to the next row', async ({ page }) => {
    await typeWord(page, 'DROWN')

    for (let i = 0; i < 5; i++) {
      const classes = await getWordRowClasses(page, 5, i)
      expect(classes).toContain('correct')
    }

    // 4-letter row should now be active with focus on first box
    const fourLetterBox = page.getByTestId('word-box-4-0')
    const classes = await fourLetterBox.getAttribute('class')
    expect(classes).toContain('focused')
  })

  test('clear button clears the current word row', async ({ page }) => {
    await typeWord(page, 'JOXY')
    await page.getByTestId('clear-btn').click()
    expect(await getWordBoxTexts(page, 5)).toBe('')
  })

  test('restart resets all word rows', async ({ page }) => {
    await typeWord(page, 'JOXY')
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByTestId('restart-btn').click()
    expect(await getWordBoxTexts(page, 5)).toBe('')
    expect(await getWordBoxTexts(page, 4)).toBe('')
  })

  test('clicking a word row selects the last filled letter', async ({ page }) => {
    await typeWord(page, 'JOX')
    await page.getByTestId('word-row-5').evaluate((el) => el.click())
    const classes = await getWordRowClasses(page, 5, 2)
    expect(classes).toContain('focused')
  })

  test('disabled keyboard keys are visually marked as used', async ({ page }) => {
    for (const letter of 'GLITCH') {
      await expect(page.getByTestId(`keyboard-key-${letter}`)).toHaveClass(/used/)
    }
    await expect(page.getByTestId('keyboard-key-J')).not.toHaveClass(/used/)
  })

  test('can return to a completed row and edit it', async ({ page }) => {
    await typeWord(page, 'DROWN')
    expect(await getWordBoxTexts(page, 4)).toBe('')

    await page.getByTestId('word-box-5-4').click()
    await page.getByTestId('keyboard-delete').click()
    expect(await getWordBoxTexts(page, 5)).toBe('DROW')
  })

  test('can replace a letter on a completed green word', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await page.getByTestId('word-box-5-2').click()
    await page.getByTestId('keyboard-key-B').click()
    expect(await getWordBoxTexts(page, 5)).toBe('DRBWN')
  })

  test('clear only clears the currently active row', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await typeWord(page, 'BUMP')
    expect(await getWordBoxTexts(page, 5)).toBe('DROWN')
    expect(await getWordBoxTexts(page, 4)).toBe('BUMP')

    await page.getByTestId('word-box-4-0').click()
    await page.getByTestId('clear-btn').click()
    expect(await getWordBoxTexts(page, 4)).toBe('')
    expect(await getWordBoxTexts(page, 5)).toBe('DROWN')
  })

  test('solving all words shows congratulations', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await typeWord(page, 'BUMP')
    await typeWord(page, 'SKY')
    await typeWord(page, 'EX')
    await typeWord(page, 'A')

    await expect(page.getByText('🎉 Congratulations, Well Done!')).toBeVisible()
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()
  })

  test('rapid continuous typing solves all rows', async ({ page }) => {
    await typeWord(page, 'DROWNBUMPSKYEXA')
    await expect(page.getByText('🎉 Congratulations, Well Done!')).toBeVisible()
  })

  test('clicking ahead empty box and typing fills the gap', async ({ page }) => {
    await page.getByTestId('keyboard-key-J').click()
    await page.getByTestId('keyboard-key-O').click()
    await page.getByTestId('word-box-5-4').click()
    await page.getByTestId('keyboard-key-Z').click()
    expect(await getWordBoxTexts(page, 5)).toBe('JOZ')
  })

  test('delete on active row does not affect other rows', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await typeWord(page, 'B')
    await page.getByTestId('word-box-5-0').click()
    await page.getByTestId('keyboard-delete').click()
    expect(await getWordBoxTexts(page, 5)).toBe('ROWN')
    expect(await getWordBoxTexts(page, 4)).toBe('B')
  })

  test('same letter on selected box advances cursor without changing word', async ({ page }) => {
    await typeWord(page, 'JUMB')
    await page.getByTestId('word-box-5-0').click()
    await page.getByTestId('keyboard-key-J').click()
    expect(await getWordBoxTexts(page, 5)).toBe('JUMB')
    await expect(page.getByTestId('word-box-5-1')).toHaveClass(/focused/)
  })

  test('solution button reveals answers and hides clear/restart', async ({ page }) => {
    await page.getByRole('button', { name: 'Solution' }).click()
    expect(await getWordBoxTexts(page, 5)).toBe('DROWN')
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()
    await expect(page.getByTestId('clear-btn')).not.toBeVisible()
    await expect(page.getByTestId('restart-btn')).not.toBeVisible()
  })

  test('navigating away and back via URL resets game state', async ({ page }) => {
    await typeWord(page, 'JOXY')
    await page.goto('/2')
    await page.goto('/1')
    expect(await getWordBoxTexts(page, 5)).toBe('')
  })

  test('lowercase physical keyboard input works', async ({ page }) => {
    await page.keyboard.type('jumbo', { delay: 20 })
    expect(await getWordBoxTexts(page, 5)).toBe('JUMBO')
  })

  test('cannot type more letters than row length', async ({ page }) => {
    await typeWord(page, 'JUMBO')
    await page.getByTestId('keyboard-key-A').click()
    expect(await getWordBoxTexts(page, 5)).toBe('JUMBO')
  })

  test('editing green word to invalid immediately shows red marking', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await page.getByTestId('word-box-5-4').click()
    await page.getByTestId('keyboard-key-Z').click()
    await expect(page.getByTestId('word-box-5-4')).toHaveClass(/wrong/)
    expect(await getWordBoxTexts(page, 5)).toBe('DROWZ')
  })

  test('restart cancel keeps current progress', async ({ page }) => {
    await typeWord(page, 'JOXY')
    page.once('dialog', (d) => d.dismiss())
    await page.getByTestId('restart-btn').click()
    expect(await getWordBoxTexts(page, 5)).toBe('JOXY')
  })

  test('new game after solve loads next puzzle with fresh state', async ({ page }) => {
    await typeWord(page, 'DROWN')
    await typeWord(page, 'BUMP')
    await typeWord(page, 'SKY')
    await typeWord(page, 'EX')
    await typeWord(page, 'A')
    await page.getByRole('button', { name: 'New Game' }).click()
    await expect(page).toHaveURL(/\/2\/?$/)
    await expect(page.getByTestId('six-letter-row')).toHaveText('BRUNCH')
    expect(await getWordBoxTexts(page, 5)).toBe('')
  })

  test('cannot reuse a letter already placed in another word row', async ({ page }) => {
    await typeWord(page, 'RENDS')
    await typeWord(page, 'BRAN')
    expect(await getWordBoxTexts(page, 5)).toBe('RENDS')
    // R and N are already used in RENDS, so only B and A get through
    expect(await getWordBoxTexts(page, 4)).toBe('BA')
  })

  test('keyboard disables letters used in word rows', async ({ page }) => {
    await typeWord(page, 'RENDS')
    await expect(page.getByTestId('keyboard-key-N')).toHaveClass(/used/)
    await expect(page.getByTestId('keyboard-key-R')).toHaveClass(/used/)
    await expect(page.getByTestId('keyboard-key-E')).toHaveClass(/used/)
    await expect(page.getByTestId('keyboard-key-B')).not.toHaveClass(/used/)
  })

  test('deleting a letter makes it available on the keyboard again', async ({ page }) => {
    await typeWord(page, 'RENDS')
    await expect(page.getByTestId('keyboard-key-N')).toHaveClass(/used/)
    await page.getByTestId('word-box-5-2').click()
    await page.getByTestId('keyboard-delete').click()
    await expect(page.getByTestId('keyboard-key-N')).not.toHaveClass(/used/)
  })

  test('selected letter stays enabled on keyboard for same-letter advance', async ({ page }) => {
    await typeWord(page, 'RENDS')
    await page.getByTestId('word-box-5-0').click()
    await expect(page.getByTestId('keyboard-key-R')).not.toHaveClass(/used/)
    await page.getByTestId('keyboard-key-R').click()
    await expect(page.getByTestId('word-box-5-1')).toHaveClass(/focused/)
    expect(await getWordBoxTexts(page, 5)).toBe('RENDS')
  })

  test('cannot use duplicate letters within the same word', async ({ page }) => {
    await typeWord(page, 'REND')
    await page.getByTestId('keyboard-key-R').click()
    expect(await getWordBoxTexts(page, 5)).toBe('REND')
  })
})
