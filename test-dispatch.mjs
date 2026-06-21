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
  
  console.log('Test: Click box 2, then dispatch keyboard event\n');
  
  // Click box 2
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  
  // Try using page.evaluate to trigger a keyboard event
  await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'F',
      code: 'KeyF',
      keyCode: 70,
      bubbles: true
    });
    window.dispatchEvent(event);
  });
  await page.waitForTimeout(300);
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  
  if (contents[2] === 'F') {
    console.log('✓ F is in box 2');
  } else {
    console.log(`✗ F is in box ${contents.indexOf('F') >= 0 ? contents.indexOf('F') : 'nowhere'}`);
  }
  
  await browser.close();
})();
