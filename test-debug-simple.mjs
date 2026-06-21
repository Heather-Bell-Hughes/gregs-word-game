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
  
  console.log('Test sequence:');
  console.log('1. Click box 2');
  await wordBoxes[2].click();
  await page.waitForTimeout(200);
  
  console.log('2. Type F');
  await page.keyboard.press('F');
  await page.waitForTimeout(300);
  
  console.log('3. Check result');
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  console.log(`F is in box ${contents.indexOf('F')}`);
  
  await browser.close();
})();
