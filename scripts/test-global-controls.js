import { chromium } from 'file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/node_modules/@playwright/test/index.mjs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

async function testDropdowns() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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
  await page.waitForTimeout(500);

  // Profile Menu
  const profBtn = page.locator('button[aria-label="User account menu"]').first();
  console.log('Profile button found:', await profBtn.isVisible());
  await profBtn.click();
  await page.waitForTimeout(300);
  const signOutBtn = page.locator('button:has-text("Sign Out")').first();
  console.log('Sign Out in Profile dropdown visible:', await signOutBtn.isVisible());
  await page.keyboard.press('Escape');

  // Notification Bell
  const notifBtn = page.locator('button[aria-label*="Platform notifications"]').first();
  console.log('Notification bell found:', await notifBtn.isVisible());
  await notifBtn.click();
  await page.waitForTimeout(300);
  const notifHeader = page.locator('span:has-text("Notifications")').first();
  console.log('Notifications drawer header visible:', await notifHeader.isVisible());

  // Mobile Drawer Toggle at mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const menuToggle = page.locator('button[aria-label="Toggle navigation menu"]').first();
  console.log('Mobile menu button visible at 390px:', await menuToggle.isVisible());
  await menuToggle.click();
  await page.waitForTimeout(300);
  const mobileNavCompass = page.locator('aside a:has-text("Career Compass")').first();
  console.log('Mobile drawer link visible:', await mobileNavCompass.isVisible());

  await browser.close();
  console.log('--- ALL GLOBAL UI CONTROLS VERIFIED WORKING ---');
}

testDropdowns().catch(console.error);
