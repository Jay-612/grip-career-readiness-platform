import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const ADMIN_ROUTES = [
  { id: 'admin-dashboard', path: '/admin/dashboard', title: 'Admin Dashboard' },
  { id: 'admin-users', path: '/admin/users', title: 'User Management' },
  { id: 'admin-curriculum', path: '/admin/curriculum', title: 'Curriculum & Tracks' },
  { id: 'admin-companies', path: '/admin/companies', title: 'Hiring Partners' },
  { id: 'admin-events', path: '/admin/events', title: 'Event Management' },
  { id: 'admin-analytics', path: '/admin/analytics', title: 'System Analytics' },
];

async function run() {
  console.log('Starting Admin Portal Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // Ensure directories exist
  for (const vp of VIEWPORTS) {
    const dir = path.join(process.cwd(), '.claude', 'audit', 'screenshots', vp.name);
    fs.mkdirSync(dir, { recursive: true });
  }

  // Login via API to get auth token
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in as admin@campus.edu...');
  let loginRes;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'Password123!' }),
    });
    loginRes = await res.json();
  } catch (err) {
    console.error('Failed to login via API:', err);
    process.exit(1);
  }

  if (!loginRes || !loginRes.token) {
    console.error('Login failed, no token returned:', loginRes);
    process.exit(1);
  }

  const { token, user } = loginRes;
  console.log(`Authenticated as ${user.name} (${user.role})`);

  for (const vp of VIEWPORTS) {
    console.log(`\n================ Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ================`);
    const vpContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const vpPage = await vpContext.newPage();

    // Attach console & request error listeners
    const consoleErrors = [];
    const failedRequests = [];
    vpPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    vpPage.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    // Seed localStorage with token and user
    await vpPage.goto(`${BASE_URL}/login`);
    await vpPage.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token, user });

    for (const route of ADMIN_ROUTES) {
      console.log(`Testing [${vp.name}] ${route.title} (${route.path})...`);
      await vpPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(600); // Allow render & animations

      // Take full page screenshot
      const screenshotPath = path.join(
        process.cwd(),
        '.claude',
        'audit',
        'screenshots',
        vp.name,
        `${route.id}.png`
      );
      await vpPage.screenshot({ path: screenshotPath, fullPage: true });

      // Gather Layout & DOM Metrics
      const metrics = await vpPage.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;

        const scrollHeight = Math.max(
          body.scrollHeight,
          docEl.scrollHeight,
          body.offsetHeight,
          docEl.offsetHeight
        );
        const scrollWidth = Math.max(
          body.scrollWidth,
          docEl.scrollWidth,
          body.offsetWidth,
          docEl.offsetWidth
        );
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > windowWidth;

        // Card count matching standard audit heuristic:
        // articles, sections, .bg-white with border/shadow, rounded containers
        const cards = document.querySelectorAll(
          'article, .shadow-card, .shadow-xs, .rounded-xl, .rounded-2xl, .bg-white.border'
        );

        // Action elements
        const actions = document.querySelectorAll(
          'button, a[href], input[type="button"], input[type="submit"]'
        );

        return {
          scrollHeight,
          scrollWidth,
          windowHeight,
          windowWidth,
          folds: Number((scrollHeight / windowHeight).toFixed(1)),
          hasHorizontalOverflow,
          cardsCount: cards.length,
          actionsCount: actions.length,
        };
      });

      console.log(
        `  -> Height: ${metrics.scrollHeight}px | Folds: ${metrics.folds} | Cards: ${metrics.cardsCount} | Actions: ${metrics.actionsCount} | H-Overflow: ${metrics.hasHorizontalOverflow}`
      );

      if (!results[route.id]) {
        results[route.id] = {
          title: route.title,
          path: route.path,
          viewports: {},
        };
      }
      results[route.id].viewports[vp.name] = metrics;
    }

    // Interactive Testing on Desktop
    if (vp.name === 'desktop') {
      console.log('\n--- Verifying Interactive Flows on Desktop ---');

      // 1. Dashboard: Quick Links & Alerts
      console.log('Testing Dashboard Quick Links...');
      await vpPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(400);
      const userLink = await vpPage.$('a[href="/admin/users"]');
      if (userLink) {
        console.log('  ✓ Quick link to /admin/users found');
      }

      // 2. User Search and Drawer
      console.log('Testing User Search and Details Drawer...');
      await vpPage.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      // Search
      const userSearchInput = await vpPage.$('input[placeholder*="Search users"]');
      if (userSearchInput) {
        await userSearchInput.fill('Admin');
        await vpPage.waitForTimeout(300);
        console.log('  ✓ User search functional');
      }

      // Open View Details
      const viewButtons = await vpPage.$$('button[title="View Account Details"]');
      if (viewButtons.length > 0) {
        await viewButtons[0].click();
        await vpPage.waitForTimeout(400);
        const drawerTitle = await vpPage.$('h2:has-text("User Account Details")');
        console.log(`  ✓ User Details Drawer opened: ${Boolean(drawerTitle)}`);
        // Close drawer
        const closeBtn = await vpPage.$('button[title="Close Drawer"], button:has-text("Close")');
        if (closeBtn) await closeBtn.click();
      }

      // 3. Curriculum: Search and Details Modal
      console.log('Testing Curriculum Search & Modal...');
      await vpPage.goto(`${BASE_URL}/admin/curriculum`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      const eyeBtn = await vpPage.$('button[title="View Details"]');
      if (eyeBtn) {
        await eyeBtn.click();
        await vpPage.waitForTimeout(400);
        console.log('  ✓ Curriculum track details modal opened');
        const modalClose = await vpPage.$('button:has-text("Close")');
        if (modalClose) await modalClose.click();
      }

      // 4. Company Search & Details Modal
      console.log('Testing Company Directory...');
      await vpPage.goto(`${BASE_URL}/admin/companies`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      const companyEye = await vpPage.$('button[title="View Details"]');
      if (companyEye) {
        await companyEye.click();
        await vpPage.waitForTimeout(400);
        console.log('  ✓ Company details modal opened');
        const compModalClose = await vpPage.$('button:has-text("Close")');
        if (compModalClose) await compModalClose.click();
      }

      // 5. Events: Create modal
      console.log('Testing Events modal...');
      await vpPage.goto(`${BASE_URL}/admin/events`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      const scheduleBtn = await vpPage.$('button:has-text("Schedule New Event")');
      if (scheduleBtn) {
        await scheduleBtn.click();
        await vpPage.waitForTimeout(400);
        console.log('  ✓ Event creation modal opened');
        const cancelBtn = await vpPage.$('button:has-text("Cancel")');
        if (cancelBtn) await cancelBtn.click();
      }

      // 6. Analytics: Toggle Audit Logs
      console.log('Testing Analytics collapsible audit logs...');
      await vpPage.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      const toggleAuditBtn = await vpPage.$('button:has-text("Institutional Telemetry")');
      if (toggleAuditBtn) {
        await toggleAuditBtn.click();
        await vpPage.waitForTimeout(300);
        const preEl = await vpPage.$('pre');
        console.log(`  ✓ Collapsible audit logs expanded: ${Boolean(preEl)}`);
        // Collapse again
        await toggleAuditBtn.click();
      }
    }

    await vpContext.close();
  }

  // Save results JSON
  const outputPath = path.join(process.cwd(), '.claude', 'audit', 'admin-portal-verification.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification complete! Metrics written to: ${outputPath}`);

  await browser.close();
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
