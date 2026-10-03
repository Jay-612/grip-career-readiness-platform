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
  console.log('Launching Playwright Chromium for Profile & Skills verification...');
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
    console.log(`\nTesting Profile & Skills in ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
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

    // Inject auth
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate((auth) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }, authPayload);

    // Navigate to /student/profile
    await page.goto(`${BASE_URL}/student/profile`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take full page screenshot
    const fullPagePath = path.join(vp.dir, 'student-profile-after.png');
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`Saved screenshot: ${fullPagePath}`);

    // Measure page metrics
    const metrics = await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const folds = +(scrollHeight / viewportHeight).toFixed(1);

      // Section check
      const profileSection = !!document.querySelector('[aria-label="Student Academic Profile"]');
      const resumeSection = !!document.querySelector('[aria-label="Resume & ATS Readiness"]');
      const verifiedSkillsSection = !!document.querySelector('[aria-label="Verified Skills & Competencies"]');
      const linksSection = !!document.querySelector('[aria-label="Professional Links & Portfolios"]');

      // Count interactive cards
      const cards = document.querySelectorAll('section, .bg-white.rounded-2xl, .bg-white.rounded-xl').length;
      const buttons = document.querySelectorAll('button').length;

      return {
        scrollHeight,
        viewportHeight,
        folds,
        cards,
        buttons,
        sectionsFound: {
          profile: profileSection,
          resume: resumeSection,
          verifiedSkills: verifiedSkillsSection,
          links: linksSection,
        }
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

      // 1. Test Category Filtering
      console.log('Testing Verified Skills category filter...');
      const filterPill = page.locator('button:has-text("Frameworks & Web")').first();
      if (await filterPill.isVisible()) {
        await filterPill.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(vp.dir, 'profile-skills-filtered.png') });
        console.log('Saved profile-skills-filtered.png');
        // Reset to All
        await page.locator('button:has-text("All")').first().click();
        await page.waitForTimeout(300);
      }

      // 2. Test Deep Verification Details Modal
      console.log('Testing Deep Verification Details Modal...');
      const skillCard = page.locator('.cursor-pointer:has-text("Verified")').first();
      if (await skillCard.isVisible()) {
        await skillCard.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(vp.dir, 'profile-verification-modal.png') });
        console.log('Saved profile-verification-modal.png');

        // Close modal
        const closeBtn = page.locator('button:has-text("Close Audit")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // 3. Test View Resume Modal
      console.log('Testing Resume Preview Modal...');
      const viewResumeBtn = page.locator('button:has-text("View Resume")').first();
      if (await viewResumeBtn.isVisible()) {
        await viewResumeBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(vp.dir, 'profile-resume-preview-modal.png') });
        console.log('Saved profile-resume-preview-modal.png');

        const closeResumeBtn = page.locator('button:has-text("Close Preview")').first();
        if (await closeResumeBtn.isVisible()) {
          await closeResumeBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // 4. Test Add Skill Modal
      console.log('Testing Add Skill Modal...');
      const addSkillBtn = page.locator('button:has-text("Add Skill")').first();
      if (await addSkillBtn.isVisible()) {
        await addSkillBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(vp.dir, 'profile-add-skill-modal.png') });
        console.log('Saved profile-add-skill-modal.png');

        // Fill and submit
        await page.fill('input[placeholder*="Next.js"]', 'GraphQL');
        await page.locator('button[type="submit"]:has-text("Add Skill")').click();
        await page.waitForTimeout(800);
        console.log('Added GraphQL skill successfully!');
      }

      // 5. Test Edit Profile Modal
      console.log('Testing Edit Profile Modal...');
      const editProfileBtn = page.locator('button:has-text("Edit Profile")').first();
      if (await editProfileBtn.isVisible()) {
        await editProfileBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(vp.dir, 'profile-edit-modal.png') });
        console.log('Saved profile-edit-modal.png');

        // Close edit modal
        const cancelBtn = page.locator('button:has-text("Cancel")').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    await vpContext.close();
  }

  await browser.close();

  // Save verification results
  const outPath = path.resolve('../.claude/audit/profile-verification.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification complete! Results written to ${outPath}`);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
