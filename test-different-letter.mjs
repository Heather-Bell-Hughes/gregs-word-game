import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && !text.includes('Back') && !text.includes('?')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(1500);
  
  const wordBoxes = await page.$$('.word-box');
  
  console.log('Test: Type A, B, X, D, E\n');
  
  await wordBoxes[0].click();
  await page.waitForTimeout(200);
  
  for (const letter of ['A', 'B', 'X', 'D', 'E']) {
    await page.keyboard.press(letter);
    await page.waitForTimeout(200);
  }
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result with X instead of C: [${contents.join(', ')}]`);
  
  await browser.close();
})();
