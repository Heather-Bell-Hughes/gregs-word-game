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
  
  console.log('Test: Just click wordBoxes[4] and type E\n');
  
  // Click wordBoxes[4]
  console.log('Clicking wordBoxes[4]...');
  await wordBoxes[4].click();
  await page.waitForTimeout(500);
  
  // Type E
  console.log('Typing E...');
  await page.keyboard.press('E');
  await page.waitForTimeout(500);
  
  // Check result
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  
  if (contents[4] === 'E') {
    console.log('✓ E is in box 4');
  } else {
    const eIndex = contents.indexOf('E');
    console.log(`✗ E is in box ${eIndex} instead of box 4`);
  }
  
  await browser.close();
})();
