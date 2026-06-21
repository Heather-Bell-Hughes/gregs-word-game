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
  
  console.log('Final test: Complete box selection and typing behavior\n');
  
  // Test 1: Click and type
  console.log('1. Click box 0, type A');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await page.waitForTimeout(200);
  
  // Test 2: Click different box
  console.log('2. Click box 2, type B');
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await page.waitForTimeout(200);
  
  // Test 3: Overwrite by clicking on filled box
  console.log('3. Click box 0 (has A), type D to overwrite');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('D');
  await page.waitForTimeout(200);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nFinal state: [${contents.join(', ')}]`);
  
  if (contents[0] === 'D' && contents[2] === 'B') {
    console.log('✓ SUCCESS: Box selection working correctly!');
    console.log('  - Click selects a box (filled or empty)');
    console.log('  - Typing overwrites the selected position');
  } else {
    console.log('✗ FAILED');
  }
  
  await browser.close();
})();
