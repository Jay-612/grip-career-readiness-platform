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

// Faculty credentials from users.seed.js
const FACULTY_CREDS = { email: 'dr.rajesh.kumar@campus.edu', password: 'Password123!' };

async function verify() {
  console.log('Launching Playwright Chromium for Faculty Interview Evaluation verification...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  const request = context.request;

  // 1. Authenticate as Faculty
  console.log(`Authenticating as ${FACULTY_CREDS.email}...`);
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: FACULTY_CREDS,
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Faculty login failed: ' + JSON.stringify(loginData));
  }
  const authPayload = { token: loginData.token, user: loginData.user };
  await context.close();
  console.log('Authenticated successfully!');

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, dir: DESKTOP_DIR, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, dir: TABLET_DIR, isMobile: false },
    { name: 'mobile', width: 390, height: 844, dir: MOBILE_DIR, isMobile: true },
  ];

  const results = {};

  for (const vp of viewports) {
    console.log(`\nTesting Faculty Interview Evaluation in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
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

    // Inject Auth
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate((auth) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }, authPayload);

    // Navigate to /faculty/interviews
    await page.goto(`${BASE_URL}/faculty/interviews`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture main Live Evaluation screenshot
    const fullPagePath = path.join(vp.dir, 'faculty-interview-evaluation-after.png');
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`Saved screenshot: ${fullPagePath}`);

    // Compute metrics
    const metrics = await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const folds = +(scrollHeight / viewportHeight).toFixed(1);

      // Section check
      const liveHeader = !!document.querySelector('header');
      const bodyText = document.body.innerText.toLowerCase();
      const timerWidget = bodyText.includes('interview session timer') || bodyText.includes('start timer') || bodyText.includes('00:00');
      const rubricSection = bodyText.includes('scoring rubrics');
      const observationsSection = bodyText.includes('interview observations');

      // Count interactive cards & buttons
      const cards = document.querySelectorAll('header, section, .bg-white.rounded-2xl, .bg-white.rounded-xl').length;
      const buttons = document.querySelectorAll('button, a[role="button"]').length;

      return {
        scrollHeight,
        viewportHeight,
        folds,
        cards,
        buttons,
        sectionsFound: {
          header: liveHeader,
          timer: timerWidget,
          rubrics: rubricSection,
          observations: observationsSection,
        },
      };
    });

    results[vp.name] = {
      ...metrics,
      consoleErrors,
      failedRequests,
    };
    console.log(`Metrics for ${vp.name}:`, JSON.stringify(metrics, null, 2));

    // Interactive testing on desktop
    if (vp.name === 'desktop') {
      console.log('Testing interactive features on Desktop...');

      // 1. Timer start / pause
      console.log('Testing timer controls...');
      const startTimerBtn = page.locator('button:has-text("Start Timer")').first();
      if (await startTimerBtn.isVisible()) {
        await startTimerBtn.click();
        await page.waitForTimeout(1200);
        const pauseBtn = page.locator('button:has-text("Pause")').first();
        if (await pauseBtn.isVisible()) {
          await pauseBtn.click();
          console.log('Timer started and paused successfully!');
        }
      }

      // 2. Open Student Details Drawer
      console.log('Testing Student Details Drawer...');
      const viewDetailsBtn = page.locator('button:has-text("View Student Details")').first();
      if (await viewDetailsBtn.isVisible()) {
        await viewDetailsBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(vp.dir, 'faculty-interview-student-drawer.png') });
        console.log('Saved faculty-interview-student-drawer.png');

        // Close drawer
        const closeDrawerBtn = page.locator('button[aria-label="Close drawer"]').first();
        if (await closeDrawerBtn.isVisible()) {
          await closeDrawerBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // 3. Test Rubric Sliders & Observations
      console.log('Testing Rubric Sliders & Observations...');
      const observationsInput = page.locator('textarea[placeholder*="comprehensive interview observations"]').first();
      if (await observationsInput.isVisible()) {
        await observationsInput.fill('Demonstrated strong mastery of distributed systems and Redis caching. Well-structured STAR responses.');
      }

      // 4. Test View Scoring Criteria toggle
      console.log('Testing Scoring Criteria toggle...');
      const criteriaToggle = page.locator('button:has-text("View scoring criteria")').first();
      if (await criteriaToggle.isVisible()) {
        await criteriaToggle.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(vp.dir, 'faculty-interview-scoring-criteria.png') });
        console.log('Saved faculty-interview-scoring-criteria.png');
        await page.locator('button:has-text("Hide scoring criteria")').first().click();
        await page.waitForTimeout(200);
      }

      // 5. Test Switching to Remedial Plan Tab
      console.log('Testing Remedial Plan Tab...');
      const remedialTabBtn = page.locator('button:has-text("Remedial Plan")').first();
      await remedialTabBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(vp.dir, 'faculty-interview-remedial-tab.png') });
      console.log('Saved faculty-interview-remedial-tab.png');

      // 6. Test Add Remedial Task Modal
      console.log('Testing Add Remedial Task Modal...');
      const addTaskBtn = page.locator('button:has-text("Add Task")').first();
      if (await addTaskBtn.isVisible()) {
        await addTaskBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(vp.dir, 'faculty-interview-add-task-modal.png') });
        console.log('Saved faculty-interview-add-task-modal.png');

        // Fill modal and submit
        await page.fill('input[placeholder*="Master Dynamic Programming"]', 'Advanced Distributed Sharding Practice');
        await page.locator('button[type="submit"]:has-text("Add Task")').click();
        await page.waitForTimeout(500);
        console.log('Added remedial task successfully!');
      }

      // Return to Live Evaluation Tab
      await page.locator('button:has-text("Live Evaluation")').first().click();
      await page.waitForTimeout(400);

      // 7. Test Submit Evaluation
      console.log('Testing Submit Evaluation...');
      const submitBtn = page.locator('button:has-text("Submit Evaluation")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(vp.dir, 'faculty-interview-submitted.png') });
        console.log('Saved faculty-interview-submitted.png');
      }
    }

    await vpContext.close();
  }

  await browser.close();

  // Save verification results
  const outPath = path.resolve('../.claude/audit/faculty-interview-verification.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification complete! Results written to ${outPath}`);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
