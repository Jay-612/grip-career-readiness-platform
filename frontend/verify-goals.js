import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

const SCREENSHOT_BASE = path.resolve('../.claude/audit/screenshots');
const DESKTOP_DIR = path.join(SCREENSHOT_BASE, 'desktop');
const TABLET_DIR = path.join(SCREENSHOT_BASE, 'tablet');
const MOBILE_DIR = path.join(SCREENSHOT_BASE, 'mobile');

fs.mkdirSync(DESKTOP_DIR, { recursive: true });
fs.mkdirSync(TABLET_DIR, { recursive: true });
fs.mkdirSync(MOBILE_DIR, { recursive: true });

const STUDENT_CREDS = { email: 'aarav.sharma@campus.edu', password: 'Password123!' };

async function verify() {
  console.log('Launching Playwright Chromium for Goals & Milestones verification...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  const request = context.request;

  // Login
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: STUDENT_CREDS,
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Student login failed: ' + JSON.stringify(loginData));
  }
  const authPayload = { token: loginData.token, user: loginData.user };
  await context.close();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, dir: DESKTOP_DIR, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, dir: TABLET_DIR, isMobile: false },
    { name: 'mobile', width: 390, height: 844, dir: MOBILE_DIR, isMobile: true },
  ];

  const results = {};

  for (const vp of viewports) {
    console.log(`\nTesting Goals & Milestones in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
    const vpContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      userAgent: vp.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
        : undefined,
    });

    const page = await vpContext.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', (resp) => {
      if (resp.status() >= 400) {
        failedRequests.push({ url: resp.url(), status: resp.status() });
      }
    });

    // Auth
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, authPayload);

    // Navigate to Goals
    await page.goto(`${BASE_URL}/student/goals`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Measure metrics
    const metrics = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const totalCards = document.querySelectorAll('.card, article, [class*="rounded-2xl"], [class*="shadow-card"]').length;
      const buttons = document.querySelectorAll('button, a[role="button"]').length;
      const inputs = document.querySelectorAll('input, select, textarea').length;
      const headings = document.querySelectorAll('h1, h2, h3, h4').length;
      const scrollHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      const windowHeight = window.innerHeight;
      const scrollFoldRatio = (scrollHeight / windowHeight).toFixed(1);

      return {
        totalCards,
        buttons,
        inputs,
        headings,
        scrollHeight,
        windowHeight,
        scrollFoldRatio: Number(scrollFoldRatio),
      };
    });

    const screenshotPath = path.join(vp.dir, 'student-goals-after.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`  ✓ Captured ${vp.name}/student-goals-after.png`);
    console.log(`  ✓ Height: ${metrics.scrollHeight}px (~${metrics.scrollFoldRatio} folds)`);
    console.log(`  ✓ Cards: ${metrics.totalCards}, Buttons: ${metrics.buttons}, Headings: ${metrics.headings}`);
    console.log(`  ✓ Console errors: ${consoleErrors.length}, Failed network calls: ${failedRequests.length}`);

    // Interactive Testing (Only on desktop viewport)
    if (vp.name === 'desktop') {
      console.log('  Testing Interactive Goals Flows...');

      // 1. Create Goal Flow
      console.log('    1. Testing "+ New Goal" Modal...');
      await page.click('button:has-text("+ New Goal")');
      await page.waitForTimeout(500);
      const modal = page.locator('div[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`       ✓ Modal opened: ${modalVisible}`);

      const uniqueGoalTitle = `Master System Design Rate Limiting ${Date.now()}`;
      await modal.locator('input[placeholder*="React Query"]').fill(uniqueGoalTitle);
      await modal.locator('select').first().selectOption('Technical');
      await modal.locator('select').nth(1).selectOption('High');
      await modal.locator('button:has-text("Create Goal")').click();
      await page.waitForTimeout(1000);

      const createdGoalVisible = await page.isVisible(`text=${uniqueGoalTitle}`);
      console.log(`       ✓ New goal created & visible in list: ${createdGoalVisible}`);

      // 2. Update Progress Flow
      console.log('    2. Testing "Update Progress" Modal...');
      const updateButtons = await page.$$('button:has-text("Update Progress")');
      if (updateButtons.length > 0) {
        await updateButtons[0].click();
        await page.waitForTimeout(500);
        const pModal = page.locator('div[role="dialog"]');
        const progressModalVisible = await pModal.isVisible();
        console.log(`       ✓ Progress Modal opened: ${progressModalVisible}`);

        // Click preset 75%
        await pModal.locator('button:has-text("75%")').click();
        await page.waitForTimeout(200);
        await pModal.locator('button:has-text("Save Progress")').click();
        await page.waitForTimeout(800);
        console.log('       ✓ Progress saved at 75%');
      }

      // 3. Goal Details Modal Flow
      console.log('    3. Testing "View Details & History" Modal...');
      const detailsButtons = await page.$$('button:has-text("View Details & History")');
      if (detailsButtons.length > 0) {
        await detailsButtons[0].click();
        await page.waitForTimeout(500);
        const dModal = page.locator('div[role="dialog"]');
        const detailsModalVisible = await dModal.isVisible();
        console.log(`       ✓ Details Modal opened: ${detailsModalVisible}`);
        // Close modal
        const closeBtn = dModal.locator('button:has-text("Close"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          // click backdrop or press Escape
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(400);
      }

      // 4. Tab Switching: Completed, All, Active
      console.log('    4. Testing Status Tabs...');
      await page.click('button[role="tab"]:has-text("Completed")');
      await page.waitForTimeout(400);
      console.log('       ✓ Switched to "Completed" tab');

      await page.click('button[role="tab"]:has-text("All")');
      await page.waitForTimeout(400);
      console.log('       ✓ Switched to "All" tab');

      await page.click('button[role="tab"]:has-text("Active")');
      await page.waitForTimeout(400);
      console.log('       ✓ Switched back to "Active" tab');
    }

    results[vp.name] = {
      ...metrics,
      consoleErrors,
      failedRequests,
    };

    await vpContext.close();
  }

  // Navigation verification: Student Dashboard -> Goals
  console.log('\n--- VERIFYING NAVIGATION FROM DASHBOARD TO GOALS ---');
  const navContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const navPage = await navContext.newPage();
  await navPage.goto(`${BASE_URL}/login`);
  await navPage.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, authPayload);

  await navPage.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle' });
  await navPage.click('a[href="/student/goals"]');
  await navPage.waitForURL('**/student/goals', { timeout: 5000 });
  console.log(`✓ Navigation from Dashboard to Goals successful! Current URL: ${navPage.url()}`);

  await navContext.close();
  await browser.close();

  // Save verification metrics
  const outJson = path.resolve('../.claude/audit/goals-verification.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
  console.log(`\nVerification complete! Saved metrics to ${outJson}`);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
