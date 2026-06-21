import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[LOG] ${msg.text()}`));
  
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
  
  console.log('Test with valid letters (not in GLITCH):\n');
  
  // Use letters: M, Y, S, P, U (not in GLITCH)
  const testSequence = [
    { box: 0, letter: 'M' },
    { box: 1, letter: 'Y' },
    { box: 2, letter: 'S' },
    { box: 3, letter: 'P' },
    { box: 4, letter: 'U' }
  ];
  
  for (const step of testSequence) {
    await wordBoxes[step.box].click();
    await page.waitForTimeout(100);
    await page.keyboard.press(step.letter);
    await page.waitForTimeout(200);
    console.log(`Box ${step.box}: ${step.letter}`);
  }
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  console.log(contents.join('') === 'MYSPU' ? '✓ SUCCESS - Box selection working!' : '✗ FAILED');
  
  await browser.close();
})();
