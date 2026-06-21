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
    if (text && !text.includes('Back') && !text.includes('?') && !text.includes('Clear') && !text.includes('Check') && !text.includes('Reveal')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(1500);
  
  const wordBoxes = await page.$$('.word-box');
  
  console.log('Quick test: Click and type immediately\n');
  
  // Click box 2 and type immediately (simulating fast user input)
  console.log('Clicking box 2...');
  await wordBoxes[2].click();
  
  console.log('Typing F immediately after click (no delay)...');
  await page.keyboard.press('F');
  await page.waitForTimeout(300);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  
  if (contents[2] === 'F') {
    console.log('✓ F is in box 2');
  } else {
    const fIndex = contents.indexOf('F');
    if (fIndex >= 0) {
      console.log(`✗ F is in box ${fIndex} instead of box 2`);
    } else {
      console.log('✗ F was not added anywhere');
    }
  }
  
  await browser.close();
})();
