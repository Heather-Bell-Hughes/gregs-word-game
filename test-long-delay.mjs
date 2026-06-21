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
  
  console.log('Test with long delays:\n');
  
  // Click box 0
  await wordBoxes[0].click();
  await page.waitForTimeout(500);
  await page.keyboard.press('A');
  await page.waitForTimeout(500);
  
  // Click box 2 with long wait
  await wordBoxes[2].click();
  console.log('Clicked box 2, waiting 1000ms before typing...');
  await page.waitForTimeout(1000);
  
  await page.keyboard.press('B');
  await page.waitForTimeout(500);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  
  if (contents[2] === 'B') {
    console.log('✓ SUCCESS: B is in box 2');
  } else {
    console.log(`✗ FAILED: B is in box ${contents.indexOf('B')} instead of box 2`);
  }
  
  await browser.close();
})();
