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
  
  console.log('Typing sequence with class inspection:\n');
  
  // Click box 0
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  
  // Type A
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  let classes0 = await wordBoxes[0].getAttribute('class');
  let classes1 = await wordBoxes[1].getAttribute('class');
  console.log('After typing A:');
  console.log(`  Box 0 classes: ${classes0}`);
  console.log(`  Box 1 classes: ${classes1}`);
  
  // Type B (should auto-advance)
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  classes0 = await wordBoxes[0].getAttribute('class');
  classes1 = await wordBoxes[1].getAttribute('class');
  let classes2 = await wordBoxes[2].getAttribute('class');
  console.log('\nAfter typing B:');
  console.log(`  Box 0 classes: ${classes0}`);
  console.log(`  Box 1 classes: ${classes1}`);
  console.log(`  Box 2 classes: ${classes2}`);
  console.log(`  Box texts: 0="${await wordBoxes[0].textContent()}", 1="${await wordBoxes[1].textContent()}", 2="${await wordBoxes[2].textContent()}"`);
  
  await browser.close();
})();
