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
  
  console.log('Word rows and their sizes:');
  for (let r = 0; r < wordRows.length; r++) {
    const boxes = await wordRows[r].$$('.word-box');
    console.log(`Row ${r}: ${boxes.length} boxes`);
  }
  
  // Also check total wordBoxes
  const allWordBoxes = await page.$$('.word-box');
  console.log(`\nTotal word boxes: ${allWordBoxes.length}`);
  console.log(`Expected: 5+4+3+2+1 = 15`);
  
  await browser.close();
})();
