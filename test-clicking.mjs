import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  // Start a game
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
  
  console.log('Test: Click each box and type\n');
  
  // Click box 0, type A
  console.log('Clicking box 0, typing A');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  
  // Click box 1, type B
  console.log('Clicking box 1, typing B');
  await wordBoxes[1].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  
  // Click box 2, type C
  console.log('Clicking box 2, typing C');
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('C');
  await page.waitForTimeout(300);
  
  // Click box 3, type D
  console.log('Clicking box 3, typing D');
  await wordBoxes[3].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('D');
  await page.waitForTimeout(300);
  
  // Check results
  const box0 = await wordBoxes[0].textContent();
  const box1 = await wordBoxes[1].textContent();
  const box2 = await wordBoxes[2].textContent();
  const box3 = await wordBoxes[3].textContent();
  
  console.log(`\nResult: box0="${box0}", box1="${box1}", box2="${box2}", box3="${box3}"`);
  
  if (box0 === 'A' && box1 === 'B' && box2 === 'C' && box3 === 'D') {
    console.log('✓ SUCCESS: Each box receives the letter when clicked and typed!');
  } else {
    console.log('✗ Issue - not all boxes filled correctly');
  }
  
  await browser.close();
})();
