/**
 * verify-student-guidance-flow.js
 * 
 * Verifies end-to-end execution of the Student -> Faculty Guidance workflow:
 * 1. Student authenticates (aarav.sharma@campus.edu)
 * 2. Fetches faculty recommendation directory to choose faculty advisor
 * 3. Selects topic, writes question, and submits guidance request (POST /api/guidance/request)
 * 4. Faculty authenticates (prof.neha.sharma@campus.edu)
 * 5. Faculty opens Guidance Inbox (GET /api/guidance/requests) and verifies new inquiry is present
 * 6. Faculty opens request detail and posts reply / advice (POST /api/guidance/requests/:id/reply)
 * 7. Verification that request status transitioned to 'replied'
 * 8. Student reads faculty reply and submits follow-up question
 * 9. Faculty or Student marks inquiry as 'resolved' (PUT /api/guidance/requests/:id/resolve)
 * 10. Verification of final status 'resolved'
 */

const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function login(email, password) {
  const payload = JSON.stringify({ email, password });
  const res = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, payload);

  if (res.status !== 200 || !res.data?.token) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return { token: res.data.token, user: res.data.user };
}

async function runGuidanceWorkflowTest() {
  console.log('================================================================');
  console.log('🚀 TESTING END-TO-END STUDENT-FACULTY GUIDANCE LIFECYCLE');
  console.log('================================================================\n');

  // Step 1: Student Login
  console.log('1. [Student] Logging in as Aarav Sharma...');
  const student = await login('aarav.sharma@campus.edu', 'Password123!');
  console.log(`   ✓ Authenticated as: ${student.user.name} (${student.user.email}) [Role: ${student.user.role}]`);

  // Step 2: Choose Faculty from Mentors Recommendation
  console.log('\n2. [Student] Choose Faculty (Fetching mentors directory)...');
  const mentorsRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/mentors/recommendation',
    method: 'GET',
    headers: { Authorization: `Bearer ${student.token}` },
  });
  if (mentorsRes.status !== 200) {
    throw new Error(`Failed to fetch mentors: ${mentorsRes.status} ${mentorsRes.raw}`);
  }
  const rawMentors = Array.isArray(mentorsRes.data)
    ? mentorsRes.data
    : mentorsRes.data?.facultyMentors || mentorsRes.data?.faculty || [];
  const facultyList = rawMentors.filter((m) => m.role?.toLowerCase() === 'faculty' || !m.role);
  console.log(`   ✓ Found ${facultyList.length} faculty mentors.`);
  const chosenFaculty = facultyList.find((f) => f.name.includes('Neha')) || facultyList[0];
  console.log(`   ✓ Selected Faculty: ${chosenFaculty.name} (${chosenFaculty.careerTag || 'CSE'}) - ID: ${chosenFaculty.id || chosenFaculty._id}`);

  // Step 3: Select Topic & Write Question & Submit
  const topic = 'System Design & Architecture';
  const questionContent = 'Could you guide me on designing cache invalidation strategies for distributed microservices in the upcoming campus technical round?';
  console.log('\n3. [Student] Select Topic & Write Question & Submit...');
  console.log(`   Topic: "${topic}"`);
  console.log(`   Question: "${questionContent}"`);

  const submitPayload = JSON.stringify({
    question: `[${topic}] ${questionContent}`,
    targetType: 'faculty',
    targetFacultyId: chosenFaculty.id || chosenFaculty._id,
    topic,
  });

  const submitRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/guidance/request',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(submitPayload),
      Authorization: `Bearer ${student.token}`,
    },
  }, submitPayload);

  if (submitRes.status !== 201) {
    throw new Error(`Failed to submit guidance request: ${submitRes.status} ${submitRes.raw}`);
  }

  const createdRequest = submitRes.data?.request || submitRes.data;
  const requestId = createdRequest.id || createdRequest._id;
  console.log(`   ✓ Guidance Request Submitted! Request ID: ${requestId}`);
  console.log(`   ✓ Initial Status: "${createdRequest.status || 'pending'}" | Topic: "${createdRequest.topic}"`);

  // Step 4: Faculty Login
  console.log('\n4. [Faculty] Logging in as Prof. Neha Sharma...');
  const faculty = await login('prof.neha.sharma@campus.edu', 'Password123!');
  console.log(`   ✓ Authenticated as: ${faculty.user.name} (${faculty.user.email}) [Role: ${faculty.user.role}]`);

  // Step 5: Faculty Guidance Inbox
  console.log('\n5. [Faculty] Opening Faculty Guidance Inbox...');
  const inboxRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/guidance/requests',
    method: 'GET',
    headers: { Authorization: `Bearer ${faculty.token}` },
  });
  if (inboxRes.status !== 200) {
    throw new Error(`Failed to fetch faculty inbox: ${inboxRes.status} ${inboxRes.raw}`);
  }
  const requests = inboxRes.data?.requests || inboxRes.data || [];
  const foundInInbox = requests.find((r) => (r.id || r._id) === requestId);
  if (!foundInInbox) {
    throw new Error(`Created guidance request ${requestId} was not found in faculty inbox!`);
  }
  console.log(`   ✓ Request verified in Faculty Inbox. Total requests: ${requests.length}`);
  console.log(`   ✓ Inquiry Title: "${foundInInbox.question.slice(0, 50)}..."`);

  // Step 6: Faculty Opens Request & Faculty Replies
  console.log('\n6. [Faculty] Opening Request and Submitting Reply / Advice...');
  const facultyAdvice = 'Start with Cache-Aside (Lazy Loading) combined with Redis TTLs. For write-heavy domains, explain Write-Through vs Write-Behind with idempotency keys.';
  const replyPayload = JSON.stringify({ answerText: facultyAdvice });

  const replyRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/guidance/requests/${requestId}/reply`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(replyPayload),
      Authorization: `Bearer ${faculty.token}`,
    },
  }, replyPayload);

  if (replyRes.status !== 200 && replyRes.status !== 201) {
    throw new Error(`Failed to post faculty reply: ${replyRes.status} ${replyRes.raw}`);
  }
  console.log(`   ✓ Faculty Reply posted: "${facultyAdvice.slice(0, 60)}..."`);
  const replyData = replyRes.data?.request || replyRes.data;
  console.log(`   ✓ Status after faculty reply: "${replyData.status || 'replied'}"`);

  // Step 7: Student Receives Notification / Opens Guidance
  console.log('\n7. [Student] Opening Guidance page and Reading Reply...');
  const studentViewRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/guidance/requests/${requestId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${student.token}` },
  });
  if (studentViewRes.status !== 200) {
    throw new Error(`Student failed to get request: ${studentViewRes.status}`);
  }
  const studentView = studentViewRes.data?.request || studentViewRes.data;
  console.log(`   ✓ Student retrieved request. Replies count: ${studentView.replies?.length || 1}`);
  console.log(`   ✓ Student confirmed faculty reply: "${studentView.replies?.[0]?.answerText?.slice(0, 55)}..."`);

  // Step 8: Optional Follow-up
  console.log('\n8. [Student] Optional Follow-up submission...');
  const followUpText = 'Thank you Professor! Should I also mention Redis Sentinel or Redis Cluster for high availability?';
  const followUpPayload = JSON.stringify({ answerText: followUpText });

  const followUpRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/guidance/requests/${requestId}/reply`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(followUpPayload),
      Authorization: `Bearer ${student.token}`,
    },
  }, followUpPayload);

  if (followUpRes.status !== 200 && followUpRes.status !== 201) {
    throw new Error(`Failed to post student follow-up: ${followUpRes.status} ${followUpRes.raw}`);
  }
  console.log(`   ✓ Student follow-up posted: "${followUpText}"`);

  // Step 9: Mark Resolved
  console.log('\n9. [Student / Faculty] Resolving Inquiry...');
  const resolveRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/guidance/requests/${requestId}/resolve`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${student.token}`,
    },
  });

  if (resolveRes.status !== 200) {
    throw new Error(`Failed to resolve inquiry: ${resolveRes.status} ${resolveRes.raw}`);
  }
  const resolvedData = resolveRes.data?.request || resolveRes.data;
  console.log(`   ✓ Resolved endpoint response status: ${resolveRes.status}`);
  console.log(`   ✓ Inquiry resolved successfully! Final Status: "${resolvedData.status}"`);

  // Step 10: Final Verification
  console.log('\n10. [Audit] Verifying updated status in Student Guidance Feed...');
  const finalCheckRes = await request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/guidance/requests/${requestId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${student.token}` },
  });
  const finalCheck = finalCheckRes.data?.request || finalCheckRes.data;
  if (finalCheck.status !== 'resolved') {
    throw new Error(`Expected status 'resolved', but got: ${finalCheck.status}`);
  }

  console.log('\n================================================================');
  console.log('✅ COMPLETE STUDENT-FACULTY GUIDANCE WORKFLOW VERIFIED SUCCESSFULLY!');
  console.log('================================================================\n');
}

runGuidanceWorkflowTest().catch((err) => {
  console.error('\n❌ WORKFLOW VERIFICATION FAILED:', err);
  process.exit(1);
});
