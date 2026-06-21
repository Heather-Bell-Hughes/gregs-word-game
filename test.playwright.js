import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 500, height: 900 } });

  const screenshotDir = './test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('🧪 Loading game...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Screenshot 1: Menu/Puzzle Selection
    console.log('📸 Taking screenshot: Menu');
    await page.screenshot({ path: './test-screenshots/1-menu.png' });
    console.log('   ✓ Saved to test-screenshots/1-menu.png');

    // Check for menu elements
    const menuTitle = await page.locator('h1').innerText();
    console.log(`   Menu title: "${menuTitle}"`);

    const puzzleItems = await page.locator('.puzzle-item').count();
    console.log(`   Puzzle items found: ${puzzleItems}`);

    if (puzzleItems === 0) {
      console.error('❌ ERROR: No puzzle items found!');
      return false;
    }

    // Click first puzzle
    console.log('\n🎮 Clicking first puzzle...');
    await page.locator('.puzzle-item').first().click();
    await page.waitForTimeout(500);

    // Screenshot 2: Game Screen
    console.log('📸 Taking screenshot: Game Screen');
    await page.screenshot({ path: './test-screenshots/2-game-initial.png' });
    console.log('   ✓ Saved to test-screenshots/2-game-initial.png');

    // Check for game elements
    const letterBoxes = await page.locator('.six-letter-row .letter-box').count();
    console.log(`   Given word boxes: ${letterBoxes}`);

    const keyboardKeys = await page.locator('.keyboard-key').count();
    console.log(`   Keyboard keys found: ${keyboardKeys}`);

    const wordBoxes = await page.locator('.word-box').count();
    console.log(`   Word boxes found: ${wordBoxes}`);

    if (keyboardKeys === 0) {
      console.error('❌ ERROR: Keyboard not rendering!');
      return false;
    }

    // Test clicking a letter
    console.log('\n⌨️ Testing letter selection...');
    const firstKey = await page.locator('.keyboard-key').first();
    const letterText = await firstKey.innerText();
    console.log(`   Clicking letter: ${letterText}`);
    await firstKey.click();
    await page.waitForTimeout(300);

    // Screenshot 3: After letter selected
    console.log('📸 Taking screenshot: After letter selected');
    await page.screenshot({ path: './test-screenshots/3-game-after-letter.png' });
    console.log('   ✓ Saved to test-screenshots/3-game-after-letter.png');

    // Check if letter shows in first word box
    const firstWordBox = await page.locator('.word-box').first().innerText();
    console.log(`   First word box now contains: "${firstWordBox}"`);

    // Test clicking the info button
    console.log('\n📖 Testing info button...');
    const infoBtn = await page.locator('.info-btn');
    if (await infoBtn.count() > 0) {
      await infoBtn.click();
      await page.waitForTimeout(300);

      // Screenshot 4: Rules modal
      console.log('📸 Taking screenshot: Rules Modal');
      await page.screenshot({ path: './test-screenshots/4-rules-modal.png' });
      console.log('   ✓ Saved to test-screenshots/4-rules-modal.png');

      const rulesText = await page.locator('.rules-content h2').innerText();
      console.log(`   Rules modal title: "${rulesText}"`);

      // Close rules
      await page.locator('.rules-content .btn').click();
      await page.waitForTimeout(300);
    } else {
      console.error('❌ ERROR: Info button not found!');
      return false;
    }

    // Test back button
    console.log('\n← Testing back button...');
    await page.locator('.back-btn').click();
    await page.waitForTimeout(500);

    // Screenshot 5: Back to menu
    console.log('📸 Taking screenshot: Back to Menu');
    await page.screenshot({ path: './test-screenshots/5-back-to-menu.png' });
    console.log('   ✓ Saved to test-screenshots/5-back-to-menu.png');

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nScreenshots saved to: ./test-screenshots/');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

test().then(success => {
  process.exit(success ? 0 : 1);
});
