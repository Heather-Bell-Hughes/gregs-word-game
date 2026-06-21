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
  
  // Get the puzzle title
  const title = await page.$eval('.puzzle-title', el => el.textContent);
  console.log(`Puzzle: ${title}\n`);
  
  // Get disabled keyboard buttons
  const keyboardKeys = await page.$$('.keyboard-key');
  const disabledKeys = [];
  
  for (const key of keyboardKeys) {
    const disabled = await key.getAttribute('disabled');
    if (disabled !== null) {
      const text = await key.textContent();
      disabledKeys.push(text);
    }
  }
  
  console.log(`Disabled letters: [${disabledKeys.join(', ')}]`);
  console.log(`Total disabled: ${disabledKeys.length}`);
  
  await browser.close();
})();
