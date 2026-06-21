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
  
  console.log('Debug: Check what values handleLetterClick receives\n');
  
  // Click box 2
  await wordBoxes[2].click();
  await page.waitForTimeout(100);
  
  // Type F
  await page.keyboard.press('F');
  await page.waitForTimeout(300);
  
  // Read the debug message
  const message = await page.$eval('.message', el => el?.textContent || '');
  console.log(`Debug message: "${message}"`);
  
  // Also check for any error messages
  const containers = await page.$$('.container');
  if (containers.length > 0) {
    const html = await containers[0].innerHTML();
    // Look for debug text
    const debugMatch = html.match(/L:[A-Z]\s+WS:\d+\s+BI:\d+\s+WL:\d+/);
    if (debugMatch) {
      console.log(`Found in HTML: "${debugMatch[0]}"`);
    }
  }
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`Result: [${contents.join(',')}]`);
  
  await browser.close();
})();
