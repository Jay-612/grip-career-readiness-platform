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
  console.log('Launching Playwright Chromium for Student Guidance Simplification verification...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  const request = context.request;

  // 1. Authenticate as Aarav Sharma (Student)
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
    console.log(`\n======================================================`);
    console.log(`Testing Student Guidance in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
    console.log(`======================================================`);

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

    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    // Inject token & user into localStorage before navigating
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, authPayload);

    // Navigate to /student/guidance
    await page.goto(`${BASE_URL}/student/guidance`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Verify Page Header
    const pageTitle = await page.textContent('h1');
    console.log(`  1. Page Title: "${pageTitle?.trim()}"`);

    // Verify Active Plan Summary
    const hasActiveSummary = await page.locator('[data-testid="active-plan-summary"]').isVisible();
    console.log(`  2. Active Plan Summary Visible: ${hasActiveSummary}`);

    // Verify Task List
    const hasTaskList = await page.locator('[data-testid="remedial-task-list"]').isVisible();
    console.log(`  3. Remedial Task List Visible: ${hasTaskList}`);

    const taskItems = await page.locator('[data-testid="remedial-task-item"]').count();
    console.log(`  4. Rendered Task Items Count: ${taskItems}`);

    // Check Priority Order (Overdue -> Rework -> Due Soon -> In Progress)
    const taskTitles = await page.locator('[data-testid="remedial-task-item"] h3').allTextContents();
    console.log(`  5. Task Order (by priority):`, taskTitles.map(t => t.trim()));

    // Check Rework Feedback visibility
    const reworkBadge = await page.locator('text=Rework Requested').first().isVisible();
    console.log(`  6. "Rework Requested" Banner Visible: ${reworkBadge}`);

    // Test View Details Drawer
    console.log('  7. Testing "View Details" Drawer...');
    const viewDetailsBtn = page.locator('button:has-text("View Details")').first();
    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('[data-testid="task-details-drawer"]');
      const drawerVisible = await drawer.isVisible();
      console.log(`     ✓ Details Drawer Opened: ${drawerVisible}`);

      // Check instructions and expected deliverable
      const hasInstructions = await drawer.locator('text=Complete Instructions').isVisible();
      console.log(`     ✓ Complete Instructions Visible: ${hasInstructions}`);

      // Close drawer
      const closeBtn = drawer.locator('button:has-text("Close")').first();
      await closeBtn.click();
      await page.waitForTimeout(400);
      console.log(`     ✓ Details Drawer Closed: ${!(await drawer.isVisible())}`);
    }

    // Test Submit Work Modal
    console.log('  8. Testing "Submit Work" / "Update Submission" Modal...');
    const submitBtn = page.locator('button:has-text("Submit Work"), button:has-text("Update Submission")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);

      const modal = page.locator('div[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`     ✓ Submission Modal Opened: ${modalVisible}`);

      // Check submission form fields
      const hasLinkInput = await modal.locator('input[type="url"]').isVisible();
      const hasCommentInput = await modal.locator('textarea').isVisible();
      console.log(`     ✓ Submission Link Input: ${hasLinkInput}, Comment Note Area: ${hasCommentInput}`);

      // Cancel modal to keep deterministic state across iterations
      const cancelBtn = modal.locator('button:has-text("Cancel")').first();
      await cancelBtn.click();
      await page.waitForTimeout(400);
      console.log(`     ✓ Modal closed gracefully`);
    }

    // Test Filter Tabs (Active, Completed, All)
    console.log('  9. Testing Filter Tabs...');
    await page.click('button:has-text("Completed")');
    await page.waitForTimeout(400);
    console.log('     ✓ Completed Tab clicked');

    await page.click('button:has-text("All Tasks")');
    await page.waitForTimeout(400);
    console.log('     ✓ All Tasks Tab clicked');

    await page.click('button:has-text("Active Tasks")');
    await page.waitForTimeout(400);
    console.log('     ✓ Active Tasks Tab restored');

    // Test Archived Plans Accordion
    console.log('  10. Testing Archived Plans Accordion...');
    const accordionBtn = page.locator('[data-testid="completed-plans-accordion"] button').first();
    if (await accordionBtn.isVisible()) {
      const isInitiallyHidden = !(await page.locator('text=Completed & Cleared').isVisible());
      console.log(`     ✓ Historical plans hidden by default: ${isInitiallyHidden}`);

      await accordionBtn.click();
      await page.waitForTimeout(400);
      const isExpanded = await page.locator('text=Completed & Cleared').isVisible();
      console.log(`     ✓ Historical plans revealed on click: ${isExpanded}`);
    }

    // Scroll metrics & height calculation
    const metrics = await page.evaluate(() => {
      const totalCards = document.querySelectorAll('.rounded-2xl, .rounded-xl, [data-testid="remedial-task-item"]').length;
      const primaryButtons = document.querySelectorAll('button').length;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollWidth = document.documentElement.scrollWidth;
      const viewportWidth = window.innerWidth;
      const hasHorizontalOverflow = scrollWidth > viewportWidth;

      return {
        totalCards,
        primaryButtons,
        scrollHeight,
        viewportHeight,
        folds: parseFloat((scrollHeight / viewportHeight).toFixed(1)),
        hasHorizontalOverflow,
      };
    });

    console.log(`  11. Layout Metrics:`);
    console.log(`      • Page Height: ${metrics.scrollHeight}px (${metrics.folds} screen folds)`);
    console.log(`      • Horizontal Overflow: ${metrics.hasHorizontalOverflow}`);
    console.log(`      • Interactive Elements: ${metrics.primaryButtons} buttons, ${metrics.totalCards} cards`);
    console.log(`      • Console Errors: ${consoleErrors.length}`);
    console.log(`      • Failed Requests: ${failedRequests.length}`);

    // Take screenshot
    const screenshotPath = path.join(vp.dir, 'student-guidance-after.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  ✓ Captured ${vp.name}/student-guidance-after.png`);

    results[vp.name] = {
      viewport: `${vp.width}x${vp.height}`,
      metrics,
      consoleErrors: consoleErrors.length,
      failedRequests: failedRequests.length,
      taskTitles: taskTitles.map(t => t.trim()),
    };

    await vpContext.close();
  }

  // 12. Test Submit Flow with Actual Dispatch
  console.log(`\n======================================================`);
  console.log(`Testing Live Submission Flow Execution...`);
  console.log(`======================================================`);
  {
    const submitContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const subPage = await submitContext.newPage();
    await subPage.goto(`${BASE_URL}/login`);
    await subPage.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, authPayload);

    await subPage.goto(`${BASE_URL}/student/guidance`, { waitUntil: 'networkidle', timeout: 15000 });
    await subPage.waitForTimeout(1000);

    const submitBtn = subPage.locator('button:has-text("Submit Work")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await subPage.waitForTimeout(400);

      const modal = subPage.locator('div[role="dialog"]');
      await modal.locator('input[type="url"]').fill('https://github.com/aarav-sharma/campus-remedial-solution');
      await modal.locator('textarea').fill('Implemented idempotency validation and RFC 7807 specs.');

      await modal.locator('button:has-text("Submit for Review")').click();
      await subPage.waitForTimeout(1500);

      const toastVisible = await subPage.locator('text=has been submitted for faculty review').isVisible();
      console.log(`  ✓ Submission Toast Confirmed: ${toastVisible}`);
    }
    await submitContext.close();
  }

  // 13. Test Empty State Scenario (Using Meera Joshi who has zero assigned plans)
  console.log(`\n======================================================`);
  console.log(`Testing Empty State Scenario (Meera Joshi - No Active Plan)...`);
  console.log(`======================================================`);
  const meeraContext = await browser.newContext();
  const meeraReq = meeraContext.request;
  const meeraLogin = await meeraReq.post(`${API_URL}/auth/login`, {
    data: { email: 'meera.joshi@campus.edu', password: 'Password123!' },
  });
  const meeraData = await meeraLogin.json();
  await meeraContext.close();

  if (meeraData.success && meeraData.token) {
    const emptyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const emptyPage = await emptyContext.newPage();

    await emptyPage.goto(`${BASE_URL}/login`);
    await emptyPage.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: meeraData.token, user: meeraData.user });

    await emptyPage.goto(`${BASE_URL}/student/guidance`, { waitUntil: 'networkidle', timeout: 15000 });
    await emptyPage.waitForTimeout(800);

    const hasNoActiveState = await emptyPage.locator('text=No active remedial plan.').isVisible();
    const hasSupportingText = await emptyPage.locator('text=Any follow-up tasks assigned after your faculty evaluations will appear here.').isVisible();
    console.log(`  ✓ Empty State "No active remedial plan": ${hasNoActiveState}`);
    console.log(`  ✓ Supporting Explanation Text: ${hasSupportingText}`);

    await emptyPage.screenshot({ path: path.join(DESKTOP_DIR, 'student-guidance-empty-state.png') });
    console.log(`  ✓ Captured desktop/student-guidance-empty-state.png`);

    results.emptyState = {
      hasNoActiveState,
      hasSupportingText,
    };

    await emptyContext.close();
  }

  await browser.close();

  const auditPath = path.resolve('../.claude/audit/guidance-verification.json');
  fs.writeFileSync(auditPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Verification complete! Saved metrics to ${auditPath}`);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
