import { chromium } from 'file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/node_modules/@playwright/test/index.mjs';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

const USERS = {
  student: { email: 'aarav.sharma@campus.edu', password: 'Password123!' },
  faculty: { email: 'dr.rajesh.kumar@campus.edu', password: 'Password123!' },
  alumni: { email: 'vikram.aditya@alumni.edu', password: 'Password123!' },
  recruiter: { email: 'alex.rivera@techcorp.com', password: 'Password123!' },
  admin: { email: 'admin@campus.edu', password: 'Password123!' }
};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

const ROUTES = [
  // Public
  { id: 'public-landing', role: null, path: '/' },
  { id: 'public-login', role: null, path: '/login' },
  { id: 'public-register', role: null, path: '/register' },
  // Student
  { id: 'student-dashboard', role: 'student', path: '/student/dashboard' },
  { id: 'student-profile', role: 'student', path: '/student/profile' },
  { id: 'student-career-compass', role: 'student', path: '/student/career-compass' },
  { id: 'student-goals', role: 'student', path: '/student/goals' },
  { id: 'student-guidance', role: 'student', path: '/student/guidance' },
  { id: 'student-interviews', role: 'student', path: '/student/interviews' },
  { id: 'student-alumni-posts', role: 'student', path: '/student/alumni-posts' },
  // Faculty
  { id: 'faculty-dashboard', role: 'faculty', path: '/faculty/dashboard' },
  { id: 'faculty-interviews', role: 'faculty', path: '/faculty/interviews' },
  { id: 'faculty-guidance', role: 'faculty', path: '/faculty/guidance' },
  { id: 'faculty-analytics', role: 'faculty', path: '/faculty/analytics' },
  // Alumni
  { id: 'alumni-dashboard', role: 'alumni', path: '/alumni/dashboard' },
  { id: 'alumni-experience', role: 'alumni', path: '/alumni/experience' },
  { id: 'alumni-mentorship', role: 'alumni', path: '/alumni/mentorship' },
  // Recruiter
  { id: 'recruiter-dashboard', role: 'recruiter', path: '/recruiter/dashboard' },
  { id: 'recruiter-company', role: 'recruiter', path: '/recruiter/company' },
  { id: 'recruiter-feedback', role: 'recruiter', path: '/recruiter/feedback' },
  // Admin
  { id: 'admin-dashboard', role: 'admin', path: '/admin/dashboard' },
  { id: 'admin-users', role: 'admin', path: '/admin/users' },
  { id: 'admin-curriculum', role: 'admin', path: '/admin/curriculum' },
  { id: 'admin-companies', role: 'admin', path: '/admin/companies' },
  { id: 'admin-events', role: 'admin', path: '/admin/events' },
  { id: 'admin-analytics', role: 'admin', path: '/admin/analytics' }
];

async function getTokens() {
  const tokens = {};
  for (const [role, creds] of Object.entries(USERS)) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      const data = await res.json();
      if (data.token) {
        tokens[role] = { token: data.token, user: data.user };
      } else {
        console.error(`Login failed for ${role}:`, data);
      }
    } catch (err) {
      console.error(`Login error for ${role}:`, err.message);
    }
  }
  return tokens;
}

async function run() {
  console.log('=== STARTING COMPLETE AUDIT SUITE ===');
  const tokens = await getTokens();
  console.log('Obtained tokens for roles:', Object.keys(tokens));

  const browser = await chromium.launch({ headless: true });
  const auditResults = {
    timestamp: new Date().toISOString(),
    routesTested: [],
    consoleErrors: [],
    networkErrors: [],
    metrics: {}
  };

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });

    for (const r of ROUTES) {
      const page = await context.newPage();
      const pageErrors = [];
      const pageNetworkFails = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
          auditResults.consoleErrors.push({
            viewport: vp.name,
            route: r.path,
            text: msg.text()
          });
        }
      });

      page.on('requestfailed', req => {
        pageNetworkFails.push({
          url: req.url(),
          failure: req.failure()?.errorText
        });
        auditResults.networkErrors.push({
          viewport: vp.name,
          route: r.path,
          url: req.url(),
          error: req.failure()?.errorText
        });
      });

      page.on('response', resp => {
        if (resp.status() >= 400) {
          auditResults.networkErrors.push({
            viewport: vp.name,
            route: r.path,
            url: resp.url(),
            status: resp.status()
          });
        }
      });

      try {
        if (r.role && tokens[r.role]) {
          const authData = tokens[r.role];
          await page.addInitScript(({ token, user }) => {
            localStorage.setItem('grip_token', token);
            localStorage.setItem('grip_user', JSON.stringify(user));
            localStorage.setItem('grip_auth', JSON.stringify({ token, user }));
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }, authData);
        } else {
          await page.addInitScript(() => {
            localStorage.clear();
          });
        }

        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

        // Take screenshot
        const screenshotPath = path.join(
          process.cwd(),
          '.claude',
          'audit',
          'final',
          vp.name,
          `${r.id}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Collect metrics
        const metrics = await page.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          const height = Math.max(
            body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight
          );
          const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth);
          const clientWidth = html.clientWidth;
          const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

          // Count cards and buttons
          const cards = document.querySelectorAll(
            '[class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"][class*="border"], [class*="shadow-card"], [class*="bg-white"][class*="border"]'
          ).length;
          const buttons = document.querySelectorAll('button, a[role="button"], input[type="submit"]').length;
          const headings = document.querySelectorAll('h1, h2, h3, h4').length;

          return {
            height,
            scrollWidth,
            clientWidth,
            hasHorizontalOverflow,
            cards,
            buttons,
            headings
          };
        });

        if (!auditResults.metrics[r.id]) {
          auditResults.metrics[r.id] = {};
        }
        auditResults.metrics[r.id][vp.name] = {
          ...metrics,
          folds: Number((metrics.height / vp.height).toFixed(1))
        };

        console.log(`  ✓ [${vp.name}] ${r.path} - ${metrics.height}px (${(metrics.height / vp.height).toFixed(1)} folds), overflow: ${metrics.hasHorizontalOverflow}`);
      } catch (err) {
        console.error(`  ✗ [${vp.name}] ${r.path} failed:`, err.message);
      } finally {
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();

  // Save audit results json
  fs.writeFileSync(
    path.join(process.cwd(), '.claude', 'audit', 'final', 'audit-summary.json'),
    JSON.stringify(auditResults, null, 2)
  );

  console.log('\nAudit completed. Summary written to .claude/audit/final/audit-summary.json');
}

run().catch(console.error);
