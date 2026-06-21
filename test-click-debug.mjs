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
  
  console.log('Debug: Which box is selected after each click\n');
  
  await wordBoxes[0].click();
  let focused = await checkFocus();
  console.log(`After clicking wordBoxes[0]: focused box = ${focused}`);
  
  await page.waitForTimeout(200);
  
  await wordBoxes[2].click();
  focused = await checkFocus();
  console.log(`After clicking wordBoxes[2]: focused box = ${focused}`);
  
  await page.waitForTimeout(200);
  
  await wordBoxes[1].click();
  focused = await checkFocus();
  console.log(`After clicking wordBoxes[1]: focused box = ${focused}`);
  
  await browser.close();
})();
