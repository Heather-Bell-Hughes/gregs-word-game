import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[LOG] ${msg.text()}`));
  
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
  
  console.log('Sequential test:\n');
  
  // Click box 0
  console.log('1. Click box 0, type A');
  await wordBoxes[0].click();
  await page.waitForTimeout(200);
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  
  // Click box 1
  console.log('2. Click box 1, type B');
  await wordBoxes[1].click();
  await page.waitForTimeout(200);
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  
  // Click box 2
  console.log('3. Click box 2, type C');
  await wordBoxes[2].click();
  await page.waitForTimeout(200);
  await page.keyboard.press('C');
  await page.waitForTimeout(300);
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  console.log(contents[0]==='A' && contents[1]==='B' && contents[2]==='C' ? '✓ SUCCESS' : '✗ FAILED');
  
  await browser.close();
})();
