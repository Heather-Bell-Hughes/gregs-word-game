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
  
  console.log('Step-by-step test:\n');
  
  // Step 1
  console.log('1. Click box 0, type A');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`   Word boxes: [${contents.join(', ')}]\n`);
  
  // Step 2
  console.log('2. Click box 1, type B');
  await wordBoxes[1].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`   Word boxes: [${contents.join(', ')}]\n`);
  
  // Step 3
  console.log('3. Click box 2, type C');
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('C');
  await page.waitForTimeout(300);
  contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`   Word boxes: [${contents.join(', ')}]\n`);
  
  await browser.close();
})();
