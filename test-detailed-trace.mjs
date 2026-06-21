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
  
  const checkFocus = async () => {
    for (let i = 0; i < 5; i++) {
      const classes = await wordBoxes[i].getAttribute('class');
      if (classes.includes('focused')) {
        return i;
      }
    }
    return -1;
  };
  
  const getContents = async () => {
    let contents = [];
    for (let i = 0; i < 5; i++) {
      contents.push(await wordBoxes[i].textContent());
    }
    return contents;
  };
  
  console.log('Detailed trace:\n');
  
  // Step 1
  console.log('1. Click wordBoxes[0]');
  await wordBoxes[0].click();
  let focused = await checkFocus();
  console.log(`   Focused: box ${focused}`);
  await page.waitForTimeout(100);
  
  console.log('   Type A');
  await page.keyboard.press('A');
  await page.waitForTimeout(300);
  focused = await checkFocus();
  let contents = await getContents();
  console.log(`   After A: focused=${focused}, contents=[${contents.join(',')}]\n`);
  
  // Step 2
  console.log('2. Click wordBoxes[2]');
  await wordBoxes[2].click();
  focused = await checkFocus();
  console.log(`   Focused: box ${focused}`);
  await page.waitForTimeout(100);
  
  console.log('   Type B');
  await page.keyboard.press('B');
  await page.waitForTimeout(300);
  focused = await checkFocus();
  contents = await getContents();
  console.log(`   After B: focused=${focused}, contents=[${contents.join(',')}]\n`);
  
  await browser.close();
})();
