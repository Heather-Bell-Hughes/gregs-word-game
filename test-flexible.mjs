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
  
  const wordBoxes = await page.$$('.word-box');
  
  console.log('Test: Select any box, letters append if beyond current word\n');
  
  console.log('1. Select box 0, type Y');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('Y');
  await page.waitForTimeout(200);
  
  console.log('2. Select box 2, type M (will append at end)');
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('M');
  await page.waitForTimeout(200);
  
  console.log('3. Select box 1, type P (will replace position 1)');
  await wordBoxes[1].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('P');
  await page.waitForTimeout(200);
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  console.log('(Y at 0, P at 1, M at 2)');
  
  await browser.close();
})();
