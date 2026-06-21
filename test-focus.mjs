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
  
  const checkFocus = async (step) => {
    for (let i = 0; i < 5; i++) {
      const classes = await wordBoxes[i].getAttribute('class');
      if (classes.includes('focused')) {
        const text = await wordBoxes[i].textContent();
        console.log(`${step}: Box ${i} is focused (text="${text}")`);
        return;
      }
    }
    console.log(`${step}: No focused box`);
  };
  
  console.log('Step-by-step with focus tracking:\n');
  
  // Step 1
  await wordBoxes[0].click();
  await checkFocus('After clicking box 0');
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await checkFocus('After typing A');
  await page.waitForTimeout(300);
  
  // Step 2
  await wordBoxes[1].click();
  await checkFocus('After clicking box 1');
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await checkFocus('After typing B');
  await page.waitForTimeout(300);
  
  // Step 3 - THIS IS THE PROBLEM STEP
  console.log('\n--- Problem step ---');
  await checkFocus('Before clicking box 2');
  await wordBoxes[2].click();
  await checkFocus('After clicking box 2');
  await page.waitForTimeout(100);
  await page.keyboard.press('C');
  await checkFocus('After typing C');
  await page.waitForTimeout(300);
  
  // Check contents
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nFinal word boxes: [${contents.join(', ')}]`);
  
  await browser.close();
})();
