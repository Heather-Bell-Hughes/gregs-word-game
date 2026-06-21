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
  
  // Type A, B, C
  await wordBoxes[0].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('A');
  await page.waitForTimeout(100);
  
  await wordBoxes[1].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('B');
  await page.waitForTimeout(100);
  
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  await page.keyboard.press('C');
  await page.waitForTimeout(300);
  
  // Check which box is focused
  let focusedIndex = -1;
  for (let i = 0; i < 5; i++) {
    const classes = await wordBoxes[i].getAttribute('class');
    if (classes.includes('focused')) {
      focusedIndex = i;
      console.log(`Box ${i} is focused: ${classes}`);
    }
  }
  
  console.log(`Currently focused box: ${focusedIndex}`);
  
  // Now click box 3
  console.log('\nClicking box 3...');
  await wordBoxes[3].click();
  await page.waitForTimeout(200);
  
  // Check which box is focused now
  focusedIndex = -1;
  for (let i = 0; i < 5; i++) {
    const classes = await wordBoxes[i].getAttribute('class');
    if (classes.includes('focused')) {
      focusedIndex = i;
      console.log(`Box ${i} is focused: ${classes}`);
    }
  }
  
  console.log(`Currently focused box after clicking box 3: ${focusedIndex}`);
  
  // Type D
  console.log('\nTyping D...');
  await page.keyboard.press('D');
  await page.waitForTimeout(300);
  
  // Check result
  for (let i = 0; i < 5; i++) {
    const text = await wordBoxes[i].textContent();
    console.log(`Box ${i}: "${text}"`);
  }
  
  await browser.close();
})();
