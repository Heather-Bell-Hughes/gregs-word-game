import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runTests(viewportName, viewport) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  const screenshotDir = `./test-screenshots/${viewportName}`;
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📱 Testing ${viewportName} (${viewport.width}x${viewport.height})`);
    console.log(`${'='.repeat(50)}`);

    console.log('🧪 Loading game...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Screenshot 1: Menu
    console.log('📸 Taking screenshot: Menu');
    await page.screenshot({ path: `${screenshotDir}/1-menu.png` });
    console.log(`   ✓ Saved to ${screenshotDir}/1-menu.png`);

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
    await page.screenshot({ path: `${screenshotDir}/2-game-initial.png` });
    console.log(`   ✓ Saved to ${screenshotDir}/2-game-initial.png`);

    const keyboardKeys = await page.locator('.keyboard-key').count();
    console.log(`   Keyboard keys found: ${keyboardKeys}`);

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
    await page.screenshot({ path: `${screenshotDir}/3-game-after-letter.png` });
    console.log(`   ✓ Saved to ${screenshotDir}/3-game-after-letter.png`);

    // Test info button
    console.log('\n📖 Testing info button...');
    const infoBtn = await page.locator('.info-btn');
    if (await infoBtn.count() > 0) {
      await infoBtn.click();
      await page.waitForTimeout(300);

      // Screenshot 4: Rules modal
      console.log('📸 Taking screenshot: Rules Modal');
      await page.screenshot({ path: `${screenshotDir}/4-rules-modal.png` });
      console.log(`   ✓ Saved to ${screenshotDir}/4-rules-modal.png`);

      await page.locator('.rules-content .btn').click();
      await page.waitForTimeout(300);
    }

    // Test back button
    console.log('\n← Testing back button...');
    await page.locator('.back-btn').click();
    await page.waitForTimeout(500);

    // Screenshot 5: Back to menu
    console.log('📸 Taking screenshot: Back to Menu');
    await page.screenshot({ path: `${screenshotDir}/5-back-to-menu.png` });
    console.log(`   ✓ Saved to ${screenshotDir}/5-back-to-menu.png`);

    console.log(`\n✅ ${viewportName} tests PASSED!`);
    return true;

  } catch (error) {
    console.error(`❌ ${viewportName} test failed:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function test() {
  const results = [];

  // Test desktop
  results.push(await runTests('desktop', { width: 1024, height: 768 }));

  // Test mobile
  results.push(await runTests('mobile', { width: 375, height: 812 }));

  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ All screenshots saved to: ./test-screenshots/`);
  console.log(`   - desktop/1-5.png`);
  console.log(`   - mobile/1-5.png`);
  console.log(`\n📱 Inspect the screenshots to verify layout looks good!`);

  return results.every(r => r);
}

test().then(success => {
  process.exit(success ? 0 : 1);
});
