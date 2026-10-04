import { chromium } from 'file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/node_modules/@playwright/test/index.mjs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

async function testMobileDrawer() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@campus.edu', password: 'Password123!' })
  });
  const data = await res.json();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('grip_token', token);
    localStorage.setItem('grip_user', JSON.stringify(user));
    localStorage.setItem('grip_auth', JSON.stringify({ token, user }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, data);

  await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle' });
  const menuBtn = page.locator('button[aria-label="Toggle navigation menu"]').first();
  console.log('Mobile menu button visible:', await menuBtn.isVisible());
  await menuBtn.click();
  await page.waitForTimeout(500);

  const links = await page.locator('nav a').allInnerTexts();
  console.log('Drawer nav links count:', links.length);
  console.log('Drawer nav links:', links);

  // Close drawer
  const closeBtn = page.locator('button[aria-label="Close navigation"]').first();
  console.log('Close button visible:', await closeBtn.isVisible());
  await closeBtn.click();
  await page.waitForTimeout(300);
  console.log('Drawer closed successfully, menu button visible again:', await menuBtn.isVisible());

  await browser.close();
}

testMobileDrawer().catch(console.error);
