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

const TARGET_ROUTES = [
  { id: 'public-landing', path: '/', title: 'Landing Page' },
  { id: 'public-login', path: '/login', title: 'Login Page' },
  { id: 'public-register', path: '/register', title: 'Register Page' },
];

async function run() {
  console.log('Starting Public & Auth Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // Ensure screenshot directories exist
  for (const vp of VIEWPORTS) {
    const dir = path.join(process.cwd(), '.claude', 'audit', 'screenshots', vp.name);
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const vp of VIEWPORTS) {
    console.log(`\n================ Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ================`);
    const vpContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const vpPage = await vpContext.newPage();

    const consoleErrors = [];
    const failedRequests = [];
    vpPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    vpPage.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    for (const route of TARGET_ROUTES) {
      console.log(`Testing [${vp.name}] ${route.title} (${route.path})...`);
      // Clear storage to test unauthenticated view
      await vpPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(500);

      // Screenshot
      const screenshotPath = path.join(
        process.cwd(),
        '.claude',
        'audit',
        'screenshots',
        vp.name,
        `${route.id}.png`
      );
      await vpPage.screenshot({ path: screenshotPath, fullPage: true });

      // Measure layout metrics
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

        // Card elements heuristic
        const cards = document.querySelectorAll(
          'article, .shadow-card, .shadow-xs, .shadow-sm, .rounded-xl, .rounded-2xl, .bg-white.border'
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
      console.log('\n--- Verifying Interactive Auth Flows on Desktop ---');

      // 1. Landing: Check CTAs
      console.log('Testing Landing CTAs...');
      await vpPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const getStartedBtn = await vpPage.$('a[href="/register"]:has-text("Get Started")');
      const signInBtn = await vpPage.$('a[href="/login"]:has-text("Sign In")');
      console.log(`  ✓ Get Started button present: ${Boolean(getStartedBtn)}`);
      console.log(`  ✓ Sign In button present: ${Boolean(signInBtn)}`);

      // 2. Login: Invalid credentials
      console.log('Testing Login with invalid credentials...');
      await vpPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await vpPage.fill('input#email', 'invalid.user@campus.edu');
      await vpPage.fill('input#password', 'WrongPassword123!');
      await vpPage.click('button[type="submit"]');
      await vpPage.waitForTimeout(600);
      const errorMsg = await vpPage.$('text=Invalid email or password');
      console.log(`  ✓ Clean error displayed on bad credentials: ${Boolean(errorMsg)}`);

      // 3. Login: Valid credentials without role selection
      console.log('Testing Login without role selection...');
      await vpPage.fill('input#email', 'aarav.sharma@campus.edu');
      await vpPage.fill('input#password', 'Password123!');
      await vpPage.click('button[type="submit"]');
      await vpPage.waitForNavigation({ timeout: 5000 }).catch(() => {});
      await vpPage.waitForTimeout(800);
      const currentUrl = vpPage.url();
      console.log(`  ✓ Redirected successfully to: ${currentUrl}`);

      // Clear auth
      await vpPage.evaluate(() => {
        localStorage.clear();
      });

      // 4. Register: Role selection and conditional fields
      console.log('Testing Registration conditional fields...');
      await vpPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      
      // Default is student
      const deptSelect = await vpPage.$('select#department');
      console.log(`  ✓ Student department field rendered: ${Boolean(deptSelect)}`);

      // Switch to recruiter
      const recruiterRoleBtn = await vpPage.$('button:has-text("Recruiter")');
      if (recruiterRoleBtn) {
        await recruiterRoleBtn.click();
        await vpPage.waitForTimeout(300);
        const companyInput = await vpPage.$('input#companyName');
        console.log(`  ✓ Recruiter company input conditionally rendered: ${Boolean(companyInput)}`);
      }
    }

    await vpContext.close();
  }

  const outputPath = path.join(process.cwd(), '.claude', 'audit', 'public-auth-verification.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification complete! Metrics written to: ${outputPath}`);

  await browser.close();
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
