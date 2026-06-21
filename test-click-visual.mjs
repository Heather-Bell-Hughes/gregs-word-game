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
  
  console.log('Check: Does clicking change the visual selection?\n');
  
  // Click on box 2
  console.log('Before click:');
  let box2Classes = await wordBoxes[2].getAttribute('class');
  console.log(`Box 2 classes: ${box2Classes}`);
  
  console.log('\nClicking box 2...');
  await wordBoxes[2].click();
  await page.waitForTimeout(300);
  
  console.log('After click:');
  box2Classes = await wordBoxes[2].getAttribute('class');
  console.log(`Box 2 classes: ${box2Classes}`);
  
  if (box2Classes.includes('focused')) {
    console.log('✓ Box 2 is focused after click');
  } else if (box2Classes.includes('selected')) {
    console.log('⚠ Box 2 is selected but not focused');
  } else {
    console.log('✗ Box 2 is not focused or selected');
  }
  
  await browser.close();
})();
