import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && !text.includes('Back') && !text.includes('?') && !text.includes('Clear') && !text.includes('Check') && !text.includes('Reveal')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(1500);
  
  const wordRows = await page.$$('.word-row');
  const allWordBoxes = await page.$$('.word-box');
  
  console.log('Which word row is each wordBox in:\n');
  
  let boxIndex = 0;
  for (let r = 0; r < wordRows.length; r++) {
    const boxes = await wordRows[r].$$('.word-box');
    console.log(`Row ${r} (${boxes.length} boxes):`);
    for (let i = 0; i < boxes.length; i++) {
      console.log(`  wordBoxes[${boxIndex}] = position ${i} in row ${r}`);
      boxIndex++;
    }
  }
  
  console.log(`\nSo wordBoxes[0-4] are row 1 positions 0-4 (5-letter word)`);
  console.log(`And wordBoxes[5-8] are row 2 positions 0-3 (4-letter word)`);
  
  await browser.close();
})();
