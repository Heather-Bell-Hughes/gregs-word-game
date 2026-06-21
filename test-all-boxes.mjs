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
  
  console.log('Test: Click on each box and type\n');
  
  for (const boxNum of [0, 1, 3, 4]) {
    // Clear previous
    const clearBtn = await page.$('.buttons-row');
    if (clearBtn && boxNum > 0) {
      const buttons2 = await clearBtn.$$('button');
      if (buttons2.length > 0) await buttons2[0].click();
      await page.waitForTimeout(200);
    }
    
    const letter = String.fromCharCode(65 + boxNum);  // A, B, D, E
    await wordBoxes[boxNum].click();
    await page.keyboard.press(letter);
    await page.waitForTimeout(200);
    
    let contents = [];
    for (let i = 0; i < 5; i++) {
      contents.push(await wordBoxes[i].textContent());
    }
    console.log(`Box ${boxNum}: Typed ${letter}, result: [${contents.join(',')}]`);
  }
  
  await browser.close();
})();
