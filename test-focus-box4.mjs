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
  
  const checkAllFocus = async () => {
    let result = [];
    for (let i = 0; i < 15; i++) {
      const classes = await wordBoxes[i].getAttribute('class');
      result.push({
        index: i,
        hasFocus: classes.includes('focused'),
        classes: classes
      });
    }
    return result.filter(r => r.hasFocus);
  };
  
  // Click wordBoxes[4]
  console.log('Clicking wordBoxes[4]...');
  await wordBoxes[4].click();
  await page.waitForTimeout(300);
  
  let focused = await checkAllFocus();
  console.log(`Focused boxes: ${focused.map(f => f.index).join(', ')}`);
  
  if (focused.length > 0 && focused[0].index === 4) {
    console.log('✓ wordBoxes[4] is correctly focused');
  } else {
    console.log(`✗ wordBoxes[4] is NOT focused. Focused: ${focused.map(f => f.index).join(', ')}`);
  }
  
  await browser.close();
})();
