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
  
  console.log('Test different positions:');
  
  // Type at position 0
  console.log('\n1. Click box 0, type A');
  await wordBoxes[0].click();
  await page.waitForTimeout(500);
  await page.keyboard.press('A');
  await page.waitForTimeout(500);
  
  // Type at position 4 (last box)
  console.log('2. Click box 4 (last 5-letter box), type E');
  await wordBoxes[4].click();
  await page.waitForTimeout(500);
  await page.keyboard.press('E');
  await page.waitForTimeout(500);
  
  // Type at position 2
  console.log('3. Click box 2 (middle box), type B');
  await wordBoxes[2].click();
  await page.waitForTimeout(500);
  await page.keyboard.press('B');
  await page.waitForTimeout(500);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  
  console.log(`Box 0 (expected A): ${contents[0]}`);
  console.log(`Box 2 (expected B): ${contents[2]}`);
  console.log(`Box 4 (expected E): ${contents[4]}`);
  
  await browser.close();
})();
