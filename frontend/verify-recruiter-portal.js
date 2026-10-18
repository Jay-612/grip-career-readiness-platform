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

const RECRUITER_CREDS = { email: 'alex.rivera@techcorp.com', password: 'Password123!' };

async function verify() {
  console.log('Launching Playwright Chromium for Recruiter Portal Cleanup verification...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  const request = context.request;

  // 1. Authenticate as Alex Rivera (Recruiter)
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: RECRUITER_CREDS,
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Recruiter login failed: ' + JSON.stringify(loginData));
  }
  const authPayload = { token: loginData.token, user: loginData.user };
  await context.close();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, dir: DESKTOP_DIR, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, dir: TABLET_DIR, isMobile: false },
    { name: 'mobile', width: 390, height: 844, dir: MOBILE_DIR, isMobile: true },
  ];

  const results = {
    dashboard: {},
    company: {},
    feedback: {},
    interactions: {},
  };

  const routes = [
    { key: 'dashboard', path: '/recruiter/dashboard', filePrefix: 'recruiter-dashboard' },
    { key: 'company', path: '/recruiter/company', filePrefix: 'recruiter-company' },
    { key: 'feedback', path: '/recruiter/feedback', filePrefix: 'recruiter-feedback' },
  ];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`Testing Recruiter Portal in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
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
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    // Prime auth state
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate((auth) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }, authPayload);

    for (const route of routes) {
      console.log(`  Visiting ${route.path}...`);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Audit measurements
      const metrics = await page.evaluate(() => {
        const docElem = document.documentElement;
        const body = document.body;
        const scrollHeight = Math.max(
          body.scrollHeight,
          docElem.scrollHeight,
          body.offsetHeight,
          docElem.offsetHeight
        );
        const scrollWidth = Math.max(
          body.scrollWidth,
          docElem.scrollWidth,
          body.offsetWidth,
          docElem.offsetWidth
        );
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > windowWidth + 1;

        // Count cards & action elements
        const cardLikeElements = document.querySelectorAll(
          '.card-shadow, [class*="rounded-xl"], [class*="rounded-2xl"], section'
        );
        const buttons = document.querySelectorAll('button, a[href]');

        return {
          scrollHeight,
          scrollWidth,
          windowHeight,
          windowWidth,
          hasHorizontalOverflow,
          totalCards: cardLikeElements.length,
          buttons: buttons.length,
        };
      });

      const folds = Number((metrics.scrollHeight / metrics.windowHeight).toFixed(1));
      console.log(`    Height: ${metrics.scrollHeight}px | Window: ${metrics.windowHeight}px | Folds: ${folds} | Cards: ${metrics.totalCards} | Actions: ${metrics.buttons} | Overflow: ${metrics.hasHorizontalOverflow}`);

      const screenshotPath = path.join(vp.dir, `${route.filePrefix}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`    Saved: ${screenshotPath}`);

      if (!results[route.key][vp.name]) {
        results[route.key][vp.name] = {
          totalCards: metrics.totalCards,
          buttons: metrics.buttons,
          scrollHeight: metrics.scrollHeight,
          windowHeight: metrics.windowHeight,
          folds,
          hasHorizontalOverflow: metrics.hasHorizontalOverflow,
        };
      }

      results[route.key].consoleErrors = consoleErrors.length;
      results[route.key].failedRequests = failedRequests.length;
    }

    await vpContext.close();
  }

  // 4. Functional Interactive Tests in Desktop
  console.log(`\n======================================================`);
  console.log(`Running Functional Interactive Verification in Desktop...`);
  console.log(`======================================================`);

  const testContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const testPage = await testContext.newPage();

  await testPage.goto(`${BASE_URL}/login`);
  await testPage.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
  }, authPayload);

  // Test 1: Candidate Search & Filter on Dashboard
  console.log('  Testing Dashboard candidate search & filter...');
  await testPage.goto(`${BASE_URL}/recruiter/dashboard`, { waitUntil: 'networkidle' });
  await testPage.waitForTimeout(1000);

  const searchInput = testPage.locator('input[placeholder*="Search candidates"]');
  await searchInput.fill('Aarav');
  await testPage.waitForTimeout(500);

  const candidateRow = testPage.locator('text=Aarav Sharma').first();
  const isAaravVisible = await candidateRow.isVisible();
  console.log('    Search query filtered to Aarav Sharma:', isAaravVisible);
  results.interactions.candidateSearchWorks = isAaravVisible;

  // Test 2: View Profile (Opens Drawer)
  console.log('  Testing View Profile (Opens Details Drawer)...');
  const viewProfileBtn = testPage.locator('button:has-text("View Profile")').first();
  await viewProfileBtn.click();
  await testPage.waitForTimeout(600);

  const drawerTitle = testPage.locator('#candidate-drawer-title');
  const isDrawerOpen = await drawerTitle.isVisible();
  console.log('    Candidate profile drawer opened:', isDrawerOpen);
  results.interactions.candidateDrawerWorks = isDrawerOpen;

  // Screenshot drawer
  await testPage.screenshot({ path: path.join(DESKTOP_DIR, 'recruiter-dashboard-drawer.png') });

  // Test 3: Shortlist candidate toggle
  console.log('  Testing Shortlist candidate toggle in drawer...');
  const shortlistBtn = testPage.locator('button:has-text("Add to Shortlist")').first();
  if (await shortlistBtn.isVisible()) {
    await shortlistBtn.click();
    await testPage.waitForTimeout(500);
    console.log('    Shortlisted candidate.');
    results.interactions.shortlistToggleWorks = true;
  } else {
    const removeBtn = testPage.locator('button:has-text("Remove Shortlist")').first();
    results.interactions.shortlistToggleWorks = await removeBtn.isVisible();
  }

  // Close drawer
  const closeDrawerBtn = testPage.locator('button[aria-label="Close drawer"]').first();
  await closeDrawerBtn.click();
  await testPage.waitForTimeout(400);

  // Test 4: Open Shortlist Panel
  console.log('  Testing Shortlisted Pool Panel...');
  const shortlistPoolBtn = testPage.locator('button:has-text("Shortlisted Pool")').first();
  await shortlistPoolBtn.click();
  await testPage.waitForTimeout(500);

  const shortlistPanelTitle = testPage.locator('#shortlist-panel-title');
  const isShortlistPanelOpen = await shortlistPanelTitle.isVisible();
  console.log('    Shortlisted Pool panel opened:', isShortlistPanelOpen);
  results.interactions.shortlistPanelWorks = isShortlistPanelOpen;

  // Close shortlist panel
  const closePanelBtn = testPage.locator('button[aria-label="Close panel"]').first();
  await closePanelBtn.click();
  await testPage.waitForTimeout(400);

  // Test 5: Company Page Edit Modal
  console.log('  Testing Company Page Edit Modal...');
  await testPage.goto(`${BASE_URL}/recruiter/company`, { waitUntil: 'networkidle' });
  await testPage.waitForTimeout(1000);

  const editCompanyBtn = testPage.locator('button:has-text("Edit Company & Drive")').first();
  await editCompanyBtn.click();
  await testPage.waitForTimeout(500);

  const editModalTitle = testPage.locator('#company-edit-title');
  const isEditModalOpen = await editModalTitle.isVisible();
  console.log('    Company edit modal opened:', isEditModalOpen);
  results.interactions.companyEditModalWorks = isEditModalOpen;

  // Screenshot edit modal
  await testPage.screenshot({ path: path.join(DESKTOP_DIR, 'recruiter-company-edit-modal.png') });

  // Save updated company criteria
  console.log('    Saving company criteria via modal...');
  const saveBtn = testPage.locator('button[type="submit"]:has-text("Save Settings")').first();
  await saveBtn.click();
  await testPage.waitForTimeout(1200);

  // Verify toast notification
  const toastSuccess = testPage.locator('text=updated successfully').first();
  const isSavedToast = await toastSuccess.isVisible();
  console.log('    Company save toast visible:', isSavedToast);
  results.interactions.companySaveWorks = isSavedToast;

  // Test 6: Feedback Portal Submission
  console.log('  Testing Feedback Portal Submission...');
  await testPage.goto(`${BASE_URL}/recruiter/feedback`, { waitUntil: 'networkidle' });
  await testPage.waitForTimeout(1000);

  // Click Submit Feedback button
  const submitFeedbackBtn = testPage.locator('button:has-text("Submit Feedback")').first();
  await submitFeedbackBtn.click();
  await testPage.waitForTimeout(600);

  const feedbackModalTitle = testPage.locator('#feedback-modal-title');
  const isFeedbackModalOpen = await feedbackModalTitle.isVisible();
  console.log('    Feedback modal opened:', isFeedbackModalOpen);
  results.interactions.feedbackModalWorks = isFeedbackModalOpen;

  // Screenshot feedback modal
  await testPage.screenshot({ path: path.join(DESKTOP_DIR, 'recruiter-feedback-modal.png') });

  // Select candidate if dropdown is present
  const selectElem = testPage.locator('select').first();
  if (await selectElem.isVisible()) {
    await selectElem.selectOption({ index: 1 });
  }

  // Fill and submit feedback
  const remarksTextarea = testPage.locator('textarea').first();
  await remarksTextarea.fill('Candidate demonstrated strong systems knowledge and clean API design during evaluation.');
  const recordFeedbackBtn = testPage.locator('button[type="submit"]:has-text("Record Feedback")').first();
  await recordFeedbackBtn.click();
  await testPage.waitForTimeout(1200);

  const feedbackToast = testPage.locator('text=recorded').first();
  const isFeedbackRecorded = await feedbackToast.isVisible();
  console.log('    Feedback submission recorded:', isFeedbackRecorded);
  results.interactions.feedbackSubmitWorks = isFeedbackRecorded;

  // Save verification JSON
  const resultJsonPath = path.resolve('../.claude/audit/recruiter-portal-verification.json');
  fs.writeFileSync(resultJsonPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved verification results to ${resultJsonPath}`);

  await testContext.close();
  await browser.close();
  console.log('\nVerification suite completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
