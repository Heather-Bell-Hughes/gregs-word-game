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
  
  console.log('Test: Click on boxes and type valid letters\n');
  
  // Click on box 0, type A (not in GLITCH)
  console.log('Clicking box 0, typing A');
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  
  // Click on box 1, type B (not in GLITCH)
  console.log('Clicking box 1, typing B');
  await wordBoxes[1].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  
  // Click on box 2, type D (not in GLITCH)
  console.log('Clicking box 2, typing D');
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('D');
  await page.waitForTimeout(300);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(', ')}]`);
  
  if (contents[0] === 'A' && contents[1] === 'B' && contents[2] === 'D') {
    console.log('✓ SUCCESS: Each clicked box receives the typed letter!');
  } else {
    console.log('✗ FAILED: ' + contents.slice(0,3).join(' '));
  }
  
  await browser.close();
})();
