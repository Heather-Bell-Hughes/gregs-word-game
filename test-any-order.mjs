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
  
  console.log('Test: Select boxes in any order\n');
  
  // Select in order: 2, 0, 4, 1, 3 (non-sequential)
  const sequence = [
    { box: 2, letter: 'M' },
    { box: 0, letter: 'Y' },
    { box: 4, letter: 'S' },
    { box: 1, letter: 'P' },
    { box: 3, letter: 'U' }
  ];
  
  for (const step of sequence) {
    await wordBoxes[step.box].click();
    await page.waitForTimeout(100);
    await page.keyboard.press(step.letter);
    await page.waitForTimeout(200);
    console.log(`Selected box ${step.box}, typed ${step.letter}`);
  }
  
  let contents = [];
  for (let i = 0; i < 5; i++) {
    contents.push(await wordBoxes[i].textContent());
  }
  console.log(`\nResult: [${contents.join(',')}]`);
  console.log(`Expected: [Y,P,M,U,S]`);
  console.log(contents.join('') === 'YPMUS' ? '✓ SUCCESS' : '✗ FAILED');
  
  await browser.close();
})();
