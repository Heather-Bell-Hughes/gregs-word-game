/** Puzzle 0: GLITCH — letters G,L,I,T,C,H are disabled */

export const PUZZLE_0 = {
  sixLetter: 'GLITCH',
  fiveLetters: 'DROWN',
  fourLetters: 'BUMP',
  threeLetters: 'SKY',
  twoLetters: 'EX',
  oneLetter: 'A',
}

export async function openFirstPuzzle(page) {
  await page.goto('/1')
  await page.getByTestId('keyboard').waitFor()
}

export async function openPuzzle(page, number) {
  await page.goto(`/${number}`)
  await page.getByTestId('keyboard').waitFor()
}

export async function typeWord(page, word) {
  for (const letter of word) {
    await page.keyboard.press(letter)
  }
}

export async function getWordBoxTexts(page, size) {
  const boxes = page.locator(`[data-testid^="word-box-${size}-"]`)
  const count = await boxes.count()
  const letters = []
  for (let i = 0; i < count; i++) {
    letters.push((await boxes.nth(i).textContent()) || '')
  }
  return letters.join('')
}

export async function getWordRowClasses(page, size, index) {
  return page.getByTestId(`word-box-${size}-${index}`).getAttribute('class')
}
