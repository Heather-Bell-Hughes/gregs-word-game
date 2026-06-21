import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  // Get the 6-letter word from the display
  const letterBoxes = await page.$$('.letter-box');
  let sixLetterWord = '';
  for (const box of letterBoxes) {
    const text = await box.textContent();
    sixLetterWord += text;
  }
  
  console.log(`6-letter word: ${sixLetterWord}`);
  
  // Start the game by clicking first puzzle
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && !text.includes('Back') && !text.includes('?') && !text.includes('Clear') && !text.includes('Check') && !text.includes('Reveal')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(1500);
  
  // Check the puzzle title to confirm which puzzle we're on
  const title = await page.$eval('.puzzle-title', el => el.textContent);
  console.log(`Puzzle: ${title}`);
  
  const letterBoxes2 = await page.$$('.letter-box');
  sixLetterWord = '';
  for (const box of letterBoxes2) {
    const text = await box.textContent();
    sixLetterWord += text;
  }
  
  console.log(`6-letter word (in game): ${sixLetterWord}`);
  console.log(`C is in 6-letter word: ${sixLetterWord.includes('C')}`);
  
  await browser.close();
})();
