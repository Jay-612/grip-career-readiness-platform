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

// Faculty credentials
const FACULTY_CREDS = { email: 'dr.rajesh.kumar@campus.edu', password: 'Password123!' };

async function verify() {
  console.log('Launching Playwright Chromium for Faculty Dashboard verification...');
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
    console.log(`\n========================================`);
    console.log(`Testing Faculty Dashboard in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
    console.log(`========================================`);

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
      if (msg.type() === 'error') {
        console.warn(`[${vp.name} console.error]:`, msg.text());
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      const failure = req.failure();
      const errText = `${req.method()} ${req.url()} - ${failure?.errorText || 'failed'}`;
      console.warn(`[${vp.name} requestfailed]:`, errText);
      failedRequests.push(errText);
    });

    // Seed localStorage with faculty auth
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((auth) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }, authPayload);

    // Navigate to Faculty Dashboard
    console.log(`Navigating to ${BASE_URL}/faculty/dashboard...`);
    await page.goto(`${BASE_URL}/faculty/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Take full page screenshot
    const dashboardScreenshot = path.join(vp.dir, 'faculty-dashboard.png');
    await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${dashboardScreenshot}`);

    // Measure page baseline metrics
    const metrics = await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const cards = document.querySelectorAll(
        '.bg-white.rounded-2xl, .bg-white.rounded-xl, [class*="rounded-2xl border"], [class*="rounded-xl border"]'
      ).length;
      const buttons = document.querySelectorAll('button:not([disabled])').length;
      const hasHorizontalOverflow = scrollWidth > clientWidth;

      return {
        scrollHeight,
        clientWidth,
        scrollWidth,
        cards,
        buttons,
        hasHorizontalOverflow,
      };
    });

    console.log(`Metrics: Height=${metrics.scrollHeight}px, Cards=${metrics.cards}, Buttons=${metrics.buttons}, HorizOverflow=${metrics.hasHorizontalOverflow}`);

    // Check Section 1: Header
    const headerVisible = await page.locator('[data-purpose="faculty-header"]').isVisible();
    console.log(`Section 1 (Header) visible: ${headerVisible}`);

    // Check Section 2: Today's Interviews
    const interviewsVisible = await page.locator('[data-purpose="today-interviews-section"]').isVisible();
    console.log(`Section 2 (Today's Interviews) visible: ${interviewsVisible}`);

    // Check Section 3: Pending Requests
    const pendingVisible = await page.locator('[data-purpose="pending-requests-section"]').isVisible();
    console.log(`Section 3 (Pending Requests) visible: ${pendingVisible}`);

    // Check Section 4: Students Needing Attention
    const attentionVisible = await page.locator('[data-purpose="attention-students-section"]').isVisible();
    console.log(`Section 4 (Attention Students) visible: ${attentionVisible}`);

    // Check Section 5: Summary Metrics
    const metricsVisible = await page.locator('[data-purpose="faculty-summary-metrics"]').isVisible();
    console.log(`Section 5 (Summary Metrics) visible: ${metricsVisible}`);

    // Check Section 6: Quick Links
    const quickLinksVisible = await page.locator('[data-purpose="faculty-quick-links"]').isVisible();
    console.log(`Section 6 (Quick Links) visible: ${quickLinksVisible}`);

    // Test Request Details Modal
    console.log('Testing Request Details modal...');
    const detailsBtn = page.locator('button:has-text("Details")').first();
    let modalOpened = false;
    if (await detailsBtn.isVisible()) {
      await detailsBtn.click();
      await page.waitForTimeout(600);
      const modal = page.locator('text=Request Details');
      modalOpened = await modal.isVisible();
      console.log(`Request details modal opened: ${modalOpened}`);

      const modalScreenshot = path.join(vp.dir, 'faculty-dashboard-request-modal.png');
      await page.screenshot({ path: modalScreenshot });
      console.log(`Saved screenshot: ${modalScreenshot}`);

      // Close modal
      await page.locator('button:has-text("Close")').click();
      await page.waitForTimeout(400);
      console.log('Request details modal closed.');
    } else {
      console.log('No pending requests with Details button; skipping modal interaction.');
      modalOpened = true;
    }

    // Verify links: Start Evaluation / View All Interviews
    const viewAllLink = page.locator('a:has-text("View All Interviews")');
    console.log(`"View All Interviews" link present: ${await viewAllLink.isVisible()}`);

    results[vp.name] = {
      viewport: `${vp.width}x${vp.height}`,
      pageHeight: metrics.scrollHeight,
      mobileFolds: (metrics.scrollHeight / vp.height).toFixed(1),
      cardsCount: metrics.cards,
      actionButtonsCount: metrics.buttons,
      horizontalOverflow: metrics.hasHorizontalOverflow,
      headerVisible,
      interviewsVisible,
      pendingVisible,
      attentionVisible,
      metricsVisible,
      quickLinksVisible,
      modalOpened,
      consoleErrorsCount: consoleErrors.length,
      failedRequestsCount: failedRequests.length,
      consoleErrors,
      failedRequests,
    };

    await vpContext.close();
  }

  await browser.close();

  // Save JSON report
  const reportPath = path.resolve('../.claude/audit/faculty-dashboard-verification.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification finished! Results written to ${reportPath}`);
  console.log(JSON.stringify(results, null, 2));
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
