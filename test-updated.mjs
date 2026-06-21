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
  
  // Click box 0 and type A
  await wordBoxes[0].click();
  await page.waitForTimeout(150);
  await page.keyboard.press('A');
  await page.waitForTimeout(500);
  
  // Type B
  await page.keyboard.press('B');
  await page.waitForTimeout(500);
  
  // Type C
  await page.keyboard.press('C');
  await page.waitForTimeout(500);
  
  // Check results
  const box0 = await wordBoxes[0].textContent();
  const box1 = await wordBoxes[1].textContent();
  const box2 = await wordBoxes[2].textContent();
  
  console.log(`Result: box0="${box0}", box1="${box1}", box2="${box2}"`);
  
  if (box0 === 'A' && box1 === 'B' && box2 === 'C') {
    console.log('✓ SUCCESS: Text is entering boxes correctly with auto-advance!');
  } else {
    console.log('✗ Issue');
  }
  
  await browser.close();
})();
