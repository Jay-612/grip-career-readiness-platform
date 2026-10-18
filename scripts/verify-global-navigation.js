import { chromium } from 'file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/node_modules/@playwright/test/index.mjs';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const ROLES_TO_TEST = [
  {
    role: 'student',
    email: 'aarav.sharma@campus.edu',
    password: 'Password123!',
    routes: [
      { id: 'student-dashboard', path: '/student/dashboard', title: 'Dashboard' },
      { id: 'student-compass', path: '/student/career-compass', title: 'Career Compass' },
      { id: 'student-goals', path: '/student/goals', title: 'Goals' },
    ],
  },
  {
    role: 'faculty',
    email: 'dr.rajesh.kumar@campus.edu',
    password: 'Password123!',
    routes: [
      { id: 'faculty-dashboard', path: '/faculty/dashboard', title: 'Dashboard' },
      { id: 'faculty-interviews', path: '/faculty/interviews', title: 'Interviews' },
      { id: 'faculty-analytics', path: '/faculty/analytics', title: 'Analytics' },
    ],
  },
  {
    role: 'alumni',
    email: 'vikram.aditya@alumni.edu',
    password: 'Password123!',
    routes: [
      { id: 'alumni-dashboard', path: '/alumni/dashboard', title: 'Dashboard' },
    ],
  },
  {
    role: 'recruiter',
    email: 'alex.rivera@techcorp.com',
    password: 'Password123!',
    routes: [
      { id: 'recruiter-dashboard', path: '/recruiter/dashboard', title: 'Dashboard' },
    ],
  },
  {
    role: 'admin',
    email: 'admin@campus.edu',
    password: 'Password123!',
    routes: [
      { id: 'admin-dashboard', path: '/admin/dashboard', title: 'Dashboard' },
    ],
  },
];

async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
}

async function run() {
  console.log('=== Starting Global TopBar & Navigation Cleanup Verification ===\n');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const dir = path.join(process.cwd(), '.claude', 'audit', 'screenshots', 'global-shell', vp.name);
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const roleConfig of ROLES_TO_TEST) {
    console.log(`\n--- Authenticating as [${roleConfig.role}] (${roleConfig.email}) ---`);
    const authData = await loginUser(roleConfig.email, roleConfig.password);
    if (!authData?.token) {
      console.error(`Failed to login as ${roleConfig.role}:`, authData);
      continue;
    }
    const { token, user } = authData;

    for (const vp of VIEWPORTS) {
      console.log(`\nTesting ${roleConfig.role} on ${vp.name} (${vp.width}x${vp.height})...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Inject token into localStorage
      await page.goto(`${BASE_URL}/login`);
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('grip_token', token);
        localStorage.setItem('grip_user', JSON.stringify(user));
      }, { token, user });

      for (const route of roleConfig.routes) {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Verification checks
        const checkResult = await page.evaluate((expectedRole) => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(body.scrollWidth, docEl.scrollWidth, body.offsetWidth, docEl.offsetWidth);
          const windowWidth = window.innerWidth;
          const hasHorizontalOverflow = scrollWidth > windowWidth;

          // Check TopBar presence
          const header = document.querySelector('header');
          const hasHeader = !!header;

          // Check if outdated institutional tags exist
          const hasNaacTag = header ? header.textContent.includes('NAAC') : false;
          const hasAutonomousTag = header ? header.textContent.includes('Autonomous') : false;

          // Check Notification Bell
          const notifButton = document.querySelector('button[aria-label*="notification" i], button[aria-label*="Notification" i]');
          const hasNotif = !!notifButton;

          // Check Profile Menu Trigger
          const profileButton = document.querySelector('button[aria-label*="account" i], button[aria-label*="Account" i], button[aria-label*="User" i]');
          const hasProfile = !!profileButton;

          // Check active route indicator in sidebar
          const activeNavLinks = Array.from(document.querySelectorAll('nav a, aside a')).filter(el => {
            return el.classList.contains('bg-blue-50') || el.classList.contains('text-blue-700');
          });
          const hasActiveNav = activeNavLinks.length > 0;

          // Check mobile menu button if mobile/tablet
          const menuButton = document.querySelector('button[aria-label*="menu" i], button[aria-label*="Toggle navigation" i]');
          const hasMobileMenu = !!menuButton;

          return {
            hasHorizontalOverflow,
            scrollWidth,
            windowWidth,
            hasHeader,
            hasNaacTag,
            hasAutonomousTag,
            hasNotif,
            hasProfile,
            hasActiveNav,
            hasMobileMenu,
          };
        }, roleConfig.role);

        // Capture screenshot
        const screenshotPath = path.join(
          process.cwd(),
          '.claude',
          'audit',
          'screenshots',
          'global-shell',
          vp.name,
          `${route.id}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Test Profile dropdown click
        let profileDropdownWorked = false;
        try {
          const profileBtn = page.locator('button[aria-label*="account" i], button[aria-label*="Account" i]').first();
          if (await profileBtn.isVisible()) {
            await profileBtn.click();
            await page.waitForTimeout(200);
            const signOutBtn = page.locator('button:has-text("Sign Out")').first();
            profileDropdownWorked = await signOutBtn.isVisible();
            // Close by clicking away
            await page.keyboard.press('Escape');
          }
        } catch (e) {
          profileDropdownWorked = false;
        }

        // Test Notification dropdown click
        let notifDropdownWorked = false;
        try {
          const notifBtn = page.locator('button[aria-label*="notification" i]').first();
          if (await notifBtn.isVisible()) {
            await notifBtn.click();
            await page.waitForTimeout(200);
            const notifHeader = page.locator('text=Notifications').first();
            notifDropdownWorked = await notifHeader.isVisible();
            // Close by pressing Escape or clicking
            await page.keyboard.press('Escape');
          }
        } catch (e) {
          notifDropdownWorked = false;
        }

        // Test Mobile Drawer toggle if mobile or tablet
        let mobileDrawerWorked = false;
        if (vp.name !== 'desktop') {
          try {
            const menuBtn = page.locator('button[aria-label*="menu" i]').first();
            if (await menuBtn.isVisible()) {
              await menuBtn.click();
              await page.waitForTimeout(300);
              const closeBtn = page.locator('button[aria-label="Close navigation"]').first();
              mobileDrawerWorked = await closeBtn.isVisible();
              if (mobileDrawerWorked) {
                await closeBtn.click();
                await page.waitForTimeout(200);
              }
            }
          } catch (e) {
            mobileDrawerWorked = false;
          }
        } else {
          mobileDrawerWorked = true; // Not applicable on desktop
        }

        const routeResult = {
          role: roleConfig.role,
          viewport: vp.name,
          route: route.path,
          ...checkResult,
          profileDropdownWorked,
          notifDropdownWorked,
          mobileDrawerWorked,
          consoleErrorsCount: consoleErrors.length,
          consoleErrors,
        };

        results.push(routeResult);
        console.log(`  [${vp.name}] ${route.path} -> Overflow: ${checkResult.hasHorizontalOverflow ? 'FAIL' : 'PASS'}, ActiveNav: ${checkResult.hasActiveNav}, Profile: ${profileDropdownWorked}, Notif: ${notifDropdownWorked}, MobileDrawer: ${mobileDrawerWorked}`);
      }

      await context.close();
    }
  }

  // Final summary
  console.log('\n================ VERIFICATION SUMMARY ================');
  const allPassOverflow = results.every(r => !r.hasHorizontalOverflow);
  const noNaacFound = results.every(r => !r.hasNaacTag && !r.hasAutonomousTag);
  const allProfilesWorked = results.every(r => r.profileDropdownWorked);
  const allNotifsWorked = results.every(r => r.notifDropdownWorked);
  const allDrawersWorked = results.every(r => r.mobileDrawerWorked);

  console.log(`1. Zero Horizontal Overflow: ${allPassOverflow ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`2. Institutional Tag Clutter Removed: ${noNaacFound ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`3. Profile Account Menu Operational: ${allProfilesWorked ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`4. Notification System Functional: ${allNotifsWorked ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`5. Mobile Navigation Drawer Functional: ${allDrawersWorked ? 'PASS ✅' : 'FAIL ❌'}`);

  const resultsSummaryPath = path.join(process.cwd(), '.claude', 'plans', 'global-verification-results.json');
  fs.writeFileSync(resultsSummaryPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${resultsSummaryPath}`);

  await browser.close();
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
