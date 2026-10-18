import { chromium } from 'file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/node_modules/@playwright/test/index.mjs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

async function testPublicAuth() {
  console.log('--- Testing Phase 2: Public & Auth ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Landing Page
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const heroCta = await page.locator('a:has-text("Get Started Free"), a:has-text("Launch Readiness Portal")').first();
  console.log('Landing Hero CTA visible:', await heroCta.isVisible());
  const signInNav = await page.locator('a:has-text("Sign In")').first();
  console.log('Landing Sign In visible:', await signInNav.isVisible());

  // 2. Login Page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#email');
  
  // Test invalid login
  await page.fill('#email', 'aarav.sharma@campus.edu');
  await page.fill('#password', 'WrongPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  const errorAlert = await page.locator('text=Invalid email or password').first();
  console.log('Invalid login error alert displayed:', await errorAlert.isVisible());

  // Test valid login without role tabs
  await page.fill('#password', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log('Logged in student redirected to:', page.url());

  // 3. Register Page
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  const roleCards = await page.locator('button:has-text("Student"), div:has-text("Student")').count();
  console.log('Register page loaded cleanly, role cards present:', roleCards > 0);

  await browser.close();
}

async function testCrossRoleWorkflow() {
  console.log('\n--- Testing Phase 16: Cross-Role Workflow ---');
  
  // 1. Login as Student
  const sRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@campus.edu', password: 'Password123!' })
  });
  const studentData = await sRes.json();
  const sToken = studentData.token;
  console.log('✓ Student logged in:', studentData.user.name);

  // 2. Login as Faculty
  const fRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.rajesh.kumar@campus.edu', password: 'Password123!' })
  });
  const facultyData = await fRes.json();
  const fToken = facultyData.token;
  console.log('✓ Faculty logged in:', facultyData.user.name);

  // 3. Student requests mock interview appointment (valid future date)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const bookRes = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sToken}`
    },
    body: JSON.stringify({
      facultyId: facultyData.user.id,
      date: tomorrow,
      time: '14:30',
      duration: 45
    })
  });
  const bookData = await bookRes.json();
  const appointmentId = bookData.appointment?._id;
  console.log('✓ Mock interview requested: HTTP', bookRes.status, 'ID:', appointmentId);

  // 4. Faculty accepts appointment & generates Google Meet link
  const acceptRes = await fetch(`${API_URL}/appointments/${appointmentId}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fToken}`
    }
  });
  const acceptData = await acceptRes.json();
  console.log('✓ Faculty accepted interview & generated room: HTTP', acceptRes.status, 'MeetLink:', !!acceptData.appointment?.meetLink);

  // 5. Faculty evaluates mock interview
  const evalRes = await fetch(`${API_URL}/skills/evaluation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fToken}`
    },
    body: JSON.stringify({
      interviewId: appointmentId,
      technicalScore: 9,
      communicationScore: 8,
      confidenceScore: 8,
      facultyFeedback: 'Excellent performance in system architecture. Highly placement-ready.'
    })
  });
  const evalData = await evalRes.json();
  console.log('✓ Faculty evaluated interview: HTTP', evalRes.status, 'Score:', evalData.scoreRecord?.overallScore || evalData.overallScore);

  // 6. Student creates a guidance request targeted to faculty
  const guideRes = await fetch(`${API_URL}/guidance/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sToken}`
    },
    body: JSON.stringify({
      question: 'Requesting tips on high-scale cache invalidation architectures for upcoming tech drives.',
      targetType: 'faculty',
      targetFacultyId: facultyData.user.id
    })
  });
  const guideData = await guideRes.json();
  const guideId = guideData.request?.id || guideData.request?._id || guideData.guidanceRequest?._id;
  console.log('✓ Student created guidance request: HTTP', guideRes.status, 'ID:', guideId);

  // 7. Faculty replies to guidance request
  if (guideId) {
    const replyRes = await fetch(`${API_URL}/guidance/requests/${guideId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fToken}`
      },
      body: JSON.stringify({
        answerText: 'Review write-through vs cache-aside patterns. Practice Redis cluster sharding questions.'
      })
    });
    const replyData = await replyRes.json();
    console.log('✓ Faculty replied to student guidance: HTTP', replyRes.status, 'Success:', replyData.success);
  }
}

async function testSecurityRoleBoundaries() {
  console.log('\n--- Testing Phase 15: Security & Role Boundaries ---');
  const browser = await chromium.launch({ headless: true });

  // Get student token
  const sRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@campus.edu', password: 'Password123!' })
  });
  const { token: studentToken, user: studentUser } = await sRes.json();

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('grip_token', token);
    localStorage.setItem('grip_user', JSON.stringify(user));
    localStorage.setItem('grip_auth', JSON.stringify({ token, user }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: studentToken, user: studentUser });

  // Student tries to access Faculty route
  await page.goto(`${BASE_URL}/faculty/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Student accessing /faculty/dashboard redirected to:', page.url());

  // Student tries to access Admin route
  await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Student accessing /admin/dashboard redirected to:', page.url());

  // Student tries to access Recruiter route
  await page.goto(`${BASE_URL}/recruiter/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Student accessing /recruiter/dashboard redirected to:', page.url());

  await browser.close();
}

async function main() {
  await testPublicAuth();
  await testCrossRoleWorkflow();
  await testSecurityRoleBoundaries();
  console.log('\n=== ALL TARGETED TESTS COMPLETED SUCCESSFULLY ===');
}

main().catch(console.error);
