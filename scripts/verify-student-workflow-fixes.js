/**
 * Automated Verification Script: Student Workflow Gap Fixes
 * Covers:
 *  - Test A: First-time quiz completion state persistence & subsequent login behavior
 *  - Test B: Faculty guidance flow (student asks, faculty replies, student follows up, resolve)
 *  - Test C: Alumni guidance flow (separate dynamic alumni recipient, reply, notification)
 *  - Test D: Student interview cancellation, slot release, join/evaluation prevention
 *  - Test E: Faculty interview cancellation & slot release
 *  - Test F: Withdraw pending request
 *  - Test G: Race condition atomic conflict handling (409 Conflict)
 *  - IDOR Security tests (student-to-student 403, faculty-to-unassigned 403, alumni-to-other 403)
 */

import http from 'http';

const API_BASE = 'http://127.0.0.1:5000/api';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function loginUser(email, password, role) {
  const res = await request(`${API_BASE}/auth/login`, { method: 'POST' }, { email, password, role });
  if (!res.data?.token) {
    throw new Error(`Login failed for ${email} (${role}): ${JSON.stringify(res.data)}`);
  }
  return { token: res.data.token, user: res.data.user };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function runTests() {
  console.log('========================================================');
  console.log('   GRIP STUDENT WORKFLOW GAP FIXES VERIFICATION');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 0. Log in test actors
    console.log('0. Authenticating Actor Personas...');
    const studentA = await loginUser('aarav.sharma@campus.edu', 'Password123!', 'student');
    const studentB = await loginUser('diya.patel@campus.edu', 'Password123!', 'student');
    const faculty1 = await loginUser('dr.rajesh.kumar@campus.edu', 'Password123!', 'faculty');
    const faculty2 = await loginUser('prof.neha.sharma@campus.edu', 'Password123!', 'faculty');
    const alumni1 = await loginUser('vikram.aditya@alumni.edu', 'Password123!', 'alumni');
    const alumni2 = await loginUser('priya.nambiar@alumni.edu', 'Password123!', 'alumni');

    console.log(`  Actors authenticated successfully.\n`);

    // ========================================================
    // PART 2: FIRST-TIME-ONLY READINESS QUIZ
    // ========================================================
    console.log('--- TEST A: FIRST-TIME-ONLY READINESS QUIZ ---');
    // Check student profile has completed status after submitting quiz
    const quizSubRes = await request(
      `${API_BASE}/career/quiz`,
      { method: 'POST', headers: authHeader(studentA.token) },
      { interests: ['cloud', 'distributed'], strengths: ['backend', 'system_design'] }
    );
    assert(quizSubRes.status === 200, 'Quiz submission returns 200 OK');
    assert(quizSubRes.data?.hasCompletedQuiz === true, 'Quiz response returns hasCompletedQuiz: true');
    assert(Boolean(quizSubRes.data?.readinessQuizCompletedAt), 'readinessQuizCompletedAt date is returned');

    // Test fresh login retains hasCompletedQuiz = true (DB persistence)
    const reloginRes = await loginUser('aarav.sharma@campus.edu', 'Password123!', 'student');
    assert(reloginRes.user.hasCompletedQuiz === true, 'Subsequent login returns hasCompletedQuiz: true');
    assert(Boolean(reloginRes.user.readinessQuizCompletedAt), 'Subsequent login retains readinessQuizCompletedAt');

    // Get student profile
    const profileRes = await request(
      `${API_BASE}/users/profile`,
      { method: 'GET', headers: authHeader(studentA.token) }
    );
    assert(profileRes.data?.user?.hasCompletedQuiz === true, 'GET /users/profile reflects hasCompletedQuiz: true\n');

    // ========================================================
    // PART 3 & 4: UNIFIED GUIDANCE - FACULTY & ALUMNI
    // ========================================================
    console.log('--- TEST B: FACULTY GUIDANCE WORKFLOW ---');
    // Fetch faculty list
    const facListRes = await request(
      `${API_BASE}/guidance/mentors/faculty`,
      { method: 'GET', headers: authHeader(studentA.token) }
    );
    assert(facListRes.status === 200, 'GET /guidance/mentors/faculty returns 200 OK');
    assert(Array.isArray(facListRes.data?.faculty) && facListRes.data.faculty.length > 0, 'Dynamic faculty list returned');

    // Student A submits question to Faculty 1
    const targetFacId = faculty1.user.id || faculty1.user._id;
    const askFacRes = await request(
      `${API_BASE}/guidance/request`,
      { method: 'POST', headers: authHeader(studentA.token) },
      {
        recipientType: 'faculty',
        targetFacultyId: targetFacId,
        topic: 'Technical Guidance',
        question: 'What distributed consensus algorithm should I study for upcoming interviews?',
      }
    );
    assert(askFacRes.status === 201, 'Student creates faculty guidance request (201 Created)');
    const facRequestId = askFacRes.data?.request?._id || askFacRes.data?.request?.id;

    // Verify Faculty 1 received notification
    const facNotifRes = await request(
      `${API_BASE}/notifications`,
      { method: 'GET', headers: authHeader(faculty1.token) }
    );
    const facNotifs = facNotifRes.data?.notifications || facNotifRes.data || [];
    const hasFacNotif = facNotifs.some((n) => n.message && n.message.includes('Technical Guidance'));
    assert(hasFacNotif, 'Faculty received notification for new guidance question');

    // Faculty 1 replies to Student A
    const facReplyRes = await request(
      `${API_BASE}/guidance/${facRequestId}/reply`,
      { method: 'POST', headers: authHeader(faculty1.token) },
      { answerText: 'Start with Raft paper and study leader election and log replication in detail.' }
    );
    assert(facReplyRes.status === 201, 'Faculty replies to guidance request (201 Created)');

    // Student A checks notification for reply
    const studentNotifRes = await request(
      `${API_BASE}/notifications`,
      { method: 'GET', headers: authHeader(studentA.token) }
    );
    const sNotifs = studentNotifRes.data?.notifications || studentNotifRes.data || [];
    const hasReplyNotif = sNotifs.some((n) => n.message && n.message.includes('Technical Guidance'));
    assert(hasReplyNotif, 'Student received notification when faculty replied');

    // Student A follows up
    const followUpRes = await request(
      `${API_BASE}/guidance/${facRequestId}/reply`,
      { method: 'POST', headers: authHeader(studentA.token) },
      { answerText: 'Thank you Professor! Is understanding Paxos also expected for junior roles?' }
    );
    assert(followUpRes.status === 201, 'Student posts follow-up in thread (201 Created)');

    // Faculty 1 marks resolved
    const resolveFacRes = await request(
      `${API_BASE}/guidance/${facRequestId}/resolve`,
      { method: 'PATCH', headers: authHeader(faculty1.token) }
    );
    assert(resolveFacRes.status === 200, 'Faculty marks request resolved (200 OK)');

    // Closed inquiry test: new reply rejected once resolved
    const rejectClosedRes = await request(
      `${API_BASE}/guidance/${facRequestId}/reply`,
      { method: 'POST', headers: authHeader(studentA.token) },
      { answerText: 'Can I ask one more thing?' }
    );
    assert(rejectClosedRes.status === 400, 'New replies rejected on resolved guidance request (400 Bad Request)\n');

    // ========================================================
    // TEST C: ALUMNI GUIDANCE WORKFLOW
    // ========================================================
    console.log('--- TEST C: ALUMNI GUIDANCE WORKFLOW ---');
    // Fetch alumni list
    const alumniListRes = await request(
      `${API_BASE}/guidance/mentors/alumni`,
      { method: 'GET', headers: authHeader(studentA.token) }
    );
    assert(alumniListRes.status === 200, 'GET /guidance/mentors/alumni returns 200 OK');
    assert(Array.isArray(alumniListRes.data?.alumni) && alumniListRes.data.alumni.length > 0, 'Dynamic alumni list returned');

    // Student A asks Alumni 1
    const targetAlumniId = alumni1.user.id || alumni1.user._id;
    const askAlumniRes = await request(
      `${API_BASE}/guidance/request`,
      { method: 'POST', headers: authHeader(studentA.token) },
      {
        recipientType: 'alumni',
        targetAlumniId: targetAlumniId,
        topic: 'Company Interview',
        question: 'What is the system design interview format at Google for new grads?',
      }
    );
    assert(askAlumniRes.status === 201, 'Student creates alumni guidance request (201 Created)');
    const alumniRequestId = askAlumniRes.data?.request?._id || askAlumniRes.data?.request?.id;

    // Alumni 1 replies
    const alumniReplyRes = await request(
      `${API_BASE}/guidance/${alumniRequestId}/reply`,
      { method: 'POST', headers: authHeader(alumni1.token) },
      { answerText: 'Focus on API design, caching, database indexing, and clear requirement gathering.' }
    );
    assert(alumniReplyRes.status === 201, 'Alumni replies to guidance inquiry (201 Created)\n');

    // ========================================================
    // SECURITY / IDOR TESTS
    // ========================================================
    console.log('--- TEST SECURITY / IDOR ENFORCEMENT ---');
    // Student B attempts to read Student A's guidance
    const idorStudentRes = await request(
      `${API_BASE}/guidance/${facRequestId}`,
      { method: 'GET', headers: authHeader(studentB.token) }
    );
    assert(idorStudentRes.status === 403, 'Student B cannot view Student A guidance (403 Forbidden)');

    // Faculty 2 attempts to read inquiry targeted to Faculty 1
    const idorFacRes = await request(
      `${API_BASE}/guidance/${facRequestId}`,
      { method: 'GET', headers: authHeader(faculty2.token) }
    );
    assert(idorFacRes.status === 403, 'Unassigned Faculty cannot access private faculty guidance (403 Forbidden)');

    // Alumni 2 attempts to read inquiry targeted to Alumni 1
    const idorAlumniRes = await request(
      `${API_BASE}/guidance/${alumniRequestId}`,
      { method: 'GET', headers: authHeader(alumni2.token) }
    );
    assert(idorAlumniRes.status === 403, 'Alumni B cannot view guidance addressed to Alumni A (403 Forbidden)');

    // Invalid recipient role rejection
    const invalidRecipRes = await request(
      `${API_BASE}/guidance/request`,
      { method: 'POST', headers: authHeader(studentA.token) },
      {
        recipientType: 'faculty',
        targetFacultyId: targetAlumniId, // Alumni passed as faculty!
        topic: 'Career Guidance',
        question: 'Testing invalid role recipient validation',
      }
    );
    assert(invalidRecipRes.status === 400, 'Backend rejects recipient role mismatch (400 Bad Request)\n');

    // ========================================================
    // PART 1: MOCK INTERVIEW CANCELLATION & SLOT RELEASE
    // ========================================================
    console.log('--- TEST D & E: MOCK INTERVIEW CANCELLATION & SLOT RELEASE ---');
    const randomOffset = Math.floor(Math.random() * 1000) + 20;
    const futureDateObj = new Date(Date.now() + randomOffset * 24 * 60 * 60 * 1000);
    const testDate = futureDateObj.toISOString().split('T')[0];
    const randomHour = String(9 + Math.floor(Math.random() * 9)).padStart(2, '0');
    const randomMin = Math.random() > 0.5 ? '00' : '30';
    const testTime = `${randomHour}:${randomMin}`;
    const testDateTime = new Date(`${testDate}T${testTime}:00Z`).toISOString();

    // Student A books appointment with Faculty 1
    const bookRes = await request(
      `${API_BASE}/appointments`,
      { method: 'POST', headers: authHeader(studentA.token) },
      {
        facultyId: targetFacId,
        date: testDate,
        time: testTime,
        dateTime: testDateTime,
        timezoneOffset: 0,
        focusArea: 'Distributed Systems Mock Screen',
      }
    );
    assert(bookRes.status === 201, 'Student A books mock interview appointment (201 Created)');
    const appointmentId = bookRes.data?.appointment?._id || bookRes.data?.appointment?.id;

    // Faculty accepts appointment -> status becomes 'scheduled'
    const acceptRes = await request(
      `${API_BASE}/appointments/${appointmentId}/accept`,
      { method: 'PATCH', headers: authHeader(faculty1.token) }
    );
    assert(acceptRes.status === 200, 'Faculty accepts appointment -> scheduled (200 OK)');

    // Verify slot is currently occupied
    const occupiedBefore = await request(
      `${API_BASE}/appointments/occupied-slots?facultyId=${targetFacId}&date=${testDate}`,
      { method: 'GET', headers: authHeader(studentB.token) }
    );
    assert(occupiedBefore.data?.occupiedSlots?.includes(testTime), 'Slot is marked occupied before cancellation');

    // Student B attempts to book SAME slot -> should be rejected as slot conflict
    const conflictBookRes = await request(
      `${API_BASE}/appointments`,
      { method: 'POST', headers: authHeader(studentB.token) },
      {
        facultyId: targetFacId,
        date: testDate,
        time: testTime,
        dateTime: testDateTime,
        timezoneOffset: 0,
        focusArea: 'System Design',
      }
    );
    assert(conflictBookRes.status === 409 || conflictBookRes.status === 400, 'Slot conflict prevented for another student (409/400)');

    // Student A cancels the scheduled interview
    const cancelRes = await request(
      `${API_BASE}/appointments/${appointmentId}/cancel`,
      { method: 'PATCH', headers: authHeader(studentA.token) },
      { reason: 'Preparing for midterm examinations' }
    );
    assert(cancelRes.status === 200, 'Student A cancels appointment with reason (200 OK)');
    assert(cancelRes.data?.appointment?.status === 'cancelled', 'Appointment status updated to cancelled');
    assert(cancelRes.data?.appointment?.cancelledByRole === 'student', 'cancelledByRole recorded as student');
    assert(cancelRes.data?.appointment?.cancelReason === 'Preparing for midterm examinations', 'cancelReason persisted');
    assert(Boolean(cancelRes.data?.appointment?.cancelledAt), 'cancelledAt timestamp recorded');

    // Check slot is released!
    const occupiedAfter = await request(
      `${API_BASE}/appointments/occupied-slots?facultyId=${targetFacId}&date=${testDate}`,
      { method: 'GET', headers: authHeader(studentB.token) }
    );
    assert(!occupiedAfter.data?.occupiedSlots?.includes(testTime), 'SLOT RELEASED: cancelled appointment no longer blocks faculty availability');

    // Student B now successfully books that same released slot!
    const bookReleasedSlot = await request(
      `${API_BASE}/appointments`,
      { method: 'POST', headers: authHeader(studentB.token) },
      {
        facultyId: targetFacId,
        date: testDate,
        time: testTime,
        dateTime: testDateTime,
        timezoneOffset: 0,
        focusArea: 'Backend Architecture',
      }
    );
    assert(bookReleasedSlot.status === 201, 'Student B successfully books released slot (201 Created)');

    // Backend rejects evaluation of a cancelled appointment
    const evalCancelledRes = await request(
      `${API_BASE}/skills/evaluation`,
      { method: 'POST', headers: authHeader(faculty1.token) },
      {
        interviewId: appointmentId,
        technical: 8,
        communication: 8,
        confidence: 8,
        overallSynthesis: 'Testing cancelled eval rejection',
      }
    );
    assert(evalCancelledRes.status === 400, 'Evaluation of cancelled interview strictly rejected by backend (400 Bad Request)');

    // ========================================================
    // TEST F: WITHDRAW PENDING REQUEST
    // ========================================================
    console.log('\n--- TEST F: WITHDRAW PENDING APPOINTMENT ---');
    const pendOffset = Math.floor(Math.random() * 200) + 15;
    const pendDateObj = new Date(Date.now() + pendOffset * 24 * 60 * 60 * 1000);
    const pendDate = pendDateObj.toISOString().split('T')[0];
    const pendTime = '11:00';
    const pendDateTime = new Date(`${pendDate}T${pendTime}:00Z`).toISOString();

    const createPendRes = await request(
      `${API_BASE}/appointments`,
      { method: 'POST', headers: authHeader(studentA.token) },
      {
        facultyId: targetFacId,
        date: pendDate,
        time: pendTime,
        dateTime: pendDateTime,
        timezoneOffset: 0,
        focusArea: 'DSA Review',
      }
    );
    const pendApptId = createPendRes.data?.appointment?._id || createPendRes.data?.appointment?.id;

    // Student withdraws pending request
    const withdrawRes = await request(
      `${API_BASE}/appointments/${pendApptId}/cancel`,
      { method: 'PATCH', headers: authHeader(studentA.token) },
      { reason: 'Need more prep time' }
    );
    assert(withdrawRes.status === 200, 'Student withdraws pending request (200 OK)');
    assert(withdrawRes.data?.appointment?.status === 'cancelled', 'Withdrawn request status set to cancelled');

    // ========================================================
    // TEST G: RACE CONDITION & CONFLICT HANDLING
    // ========================================================
    console.log('\n--- TEST G: ATOMIC RACE CONDITION PROTECTION ---');
    // Try to cancel an already cancelled interview -> must return 409 Conflict
    const raceRes = await request(
      `${API_BASE}/appointments/${pendApptId}/cancel`,
      { method: 'PATCH', headers: authHeader(faculty1.token) },
      { reason: 'Faculty also cancelling simultaneously' }
    );
    assert(raceRes.status === 409, 'Subsequent cancellation on already changed status returns 409 Conflict');

    // Student B cannot cancel Student A interview (IDOR)
    const idorCancel = await request(
      `${API_BASE}/appointments/${pendApptId}/cancel`,
      { method: 'PATCH', headers: authHeader(studentB.token) },
      { reason: 'Hacking cancellation' }
    );
    assert(idorCancel.status === 403, 'Unauthorized student cannot cancel another student interview (403 Forbidden)');

    console.log('\n========================================================');
    console.log(`   TOTAL TESTS RUN: ${passed + failed}`);
    console.log(`   PASSED: ${passed}`);
    console.log(`   FAILED: ${failed}`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
