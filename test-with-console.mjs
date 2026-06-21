import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  
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
  
  console.log('\nTest: Click box 2, wait 500ms, type F');
  await wordBoxes[2].click();
  console.log('Clicked box 2');
  await page.waitForTimeout(500);
  
  await page.keyboard.press('F');
  console.log('Pressed F');
  await page.waitForTimeout(500);
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  
  await browser.close();
})();
