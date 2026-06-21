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
  
  console.log('Simple test: Just typing without clicking\n');
  
  // Click on box 0
  await wordBoxes[0].click();
  await page.waitForTimeout(200);
  
  // Type A, B, C, D, E (just typing, no more clicks)
  console.log('Typing A, B, C, D, E without clicking...');
  for (const letter of ['A', 'B', 'C', 'D', 'E']) {
    await page.keyboard.press(letter);
    await page.waitForTimeout(200);
  }
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(', ')}]`);
  
  if (contents.join('') === 'ABCDE') {
    console.log('✓ SUCCESS: Auto-advance is working!');
  } else {
    console.log('✗ FAILED: Auto-advance or typing is not working');
  }
  
  await browser.close();
})();
