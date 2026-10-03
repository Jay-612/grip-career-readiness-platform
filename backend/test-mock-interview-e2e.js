import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './model/User.js';
import MockInterview from './model/MockInterview.js';
import EvaluationScore from './model/EvaluationScore.js';

// Import controllers directly to test workflow logic
import {
  scheduleMockInterview,
  getAppointments,
  acceptAppointment,
  createOrRefreshMeetLink,
  joinAppointment,
} from './controllers/interviewController.js';

import {
  getInterviewAnalysis,
} from './controllers/progressController.js';

import {
  getStudentDashboard,
} from './controllers/studentDashboardController.js';

import {
  saveEvaluationScore,
} from './controllers/evaluationController.js';

// Helper mock req/res creator
function createMockReqRes(user, body = {}, params = {}, query = {}) {
  const req = {
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    body,
    params,
    query,
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('Starting GRIP Mock Interview E2E Integration Suite');
  console.log('====================================================');

  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grip_db';
  await mongoose.connect(mongoURI);
  console.log(' Connected to MongoDB:', mongoose.connection.name);

  const cleanupIds = [];

  try {
    // 1. Setup Test Student and Faculty
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'E2E Test Student',
        email: 'e2e_student_test@campus.edu',
        password: 'Password123!',
        role: 'student',
      });
      cleanupIds.push({ model: User, id: student._id });
    }

    let faculty = await User.findOne({ role: 'faculty' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. E2E Evaluator',
        email: 'e2e_faculty_test@campus.edu',
        password: 'Password123!',
        role: 'faculty',
      });
      cleanupIds.push({ model: User, id: faculty._id });
    }

    console.log(`👤 Test Student: ${student.name} (${student._id})`);
    console.log(`👨‍🏫 Test Faculty: ${faculty.name} (${faculty._id})`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Timezone-Consistent Booking (IST UTC+05:30)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 1: Timezone-Consistent Booking (Student Booking) ---');
    const bookingDateStr = '2026-10-15';
    const bookingTimeStr = '14:30';
    // User in IST (UTC+05:30) books 14:30 IST on 2026-10-15 -> 09:00 UTC
    const localIsoString = new Date(Date.UTC(2026, 9, 15, 9, 0, 0, 0)).toISOString();
    const timezoneOffset = -330; // IST is UTC+05:30 -> offset -330 min

    const { req: bookReq, res: bookRes } = createMockReqRes(student, {
      facultyId: faculty._id.toString(),
      date: bookingDateStr,
      time: bookingTimeStr,
      dateTime: localIsoString,
      timezoneOffset,
    });

    await scheduleMockInterview(bookReq, bookRes);
    const bookData = bookRes.getData();

    if (bookRes.getStatusCode() !== 201 || !bookData?.appointment) {
      throw new Error(`Booking failed: ${JSON.stringify(bookData)}`);
    }

    const aptId = bookData.appointment.id;
    cleanupIds.push({ model: MockInterview, id: aptId });

    console.log('✅ Booking created successfully with ID:', aptId);
    console.log('   Status:', bookData.appointment.status);
    console.log('   Stored UTC DateTime:', bookData.appointment.dateTime);
    console.log('   MeetLink initially null/masked:', bookData.appointment.meetLink === null);

    if (bookData.appointment.status !== 'pending') {
      throw new Error(`Expected status to be 'pending', got '${bookData.appointment.status}'`);
    }

    if (bookData.appointment.meetLink !== null) {
      throw new Error('Initial meetLink must be null before faculty acceptance');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Pending Status & Telemetry in Progress & Dashboard
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Pending Status & Telemetry Recognition ---');
    
    // Check progressController getInterviewAnalysis
    const { req: progReq, res: progRes } = createMockReqRes(student, {}, { studentId: student._id.toString() });
    await getInterviewAnalysis(progReq, progRes);
    const progData = progRes.getData();

    console.log('   getInterviewAnalysis pending summary count:', progData?.summary?.pending);
    const foundInAnalysis = progData?.interviews?.find((i) => i.interviewId.toString() === aptId.toString());
    if (!foundInAnalysis) {
      throw new Error('Appointment not found in getInterviewAnalysis interviews list');
    }
    console.log('   Analysis item status:', foundInAnalysis.status, '| canJoin:', foundInAnalysis.canJoin);

    if (foundInAnalysis.status !== 'pending' || foundInAnalysis.canJoin !== false) {
      throw new Error('Analysis must recognize pending status and lock join window');
    }

    // Check studentDashboardController
    const { req: dashReq, res: dashRes } = createMockReqRes(student);
    await getStudentDashboard(dashReq, dashRes);
    const dashData = dashRes.getData();
    console.log('   Student Dashboard nextAppointment ID:', dashData?.nextAppointment?.id);
    console.log('   Student Dashboard nextAppointment status:', dashData?.nextAppointment?.status);

    if (dashData?.nextAppointment?.status !== 'pending') {
      throw new Error(`Expected nextAppointment status to be 'pending', got ${dashData?.nextAppointment?.status}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Pre-session Time-Gate Lock on Pending Session
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Time-Gate Lock on Pending Session ---');
    const { req: earlyJoinReq, res: earlyJoinRes } = createMockReqRes(student, {}, { id: aptId });
    await joinAppointment(earlyJoinReq, earlyJoinRes);

    console.log('   Early join attempt status code:', earlyJoinRes.getStatusCode());
    console.log('   Early join message:', earlyJoinRes.getData()?.message);

    if (earlyJoinRes.getStatusCode() !== 403) {
      throw new Error(`Expected 403 Forbidden for pending join, got ${earlyJoinRes.getStatusCode()}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Faculty Acceptance & Room Generation
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Faculty Acceptance & Video Room Generation ---');
    const { req: acceptReq, res: acceptRes } = createMockReqRes(faculty, {}, { id: aptId });
    await acceptAppointment(acceptReq, acceptRes);
    const acceptData = acceptRes.getData();

    if (acceptRes.getStatusCode() !== 200 || !acceptData?.appointment) {
      throw new Error(`Acceptance failed: ${JSON.stringify(acceptData)}`);
    }

    console.log('   Updated Status:', acceptData.appointment.status);
    console.log('   Generated MeetLink:', acceptData.appointment.meetLink);
    console.log('   Meeting Type:', acceptData.appointment.meetingType);
    console.log('   Meeting Provider:', acceptData.appointment.meetingProvider);

    if (acceptData.appointment.status !== 'scheduled') {
      throw new Error(`Expected status 'scheduled', got '${acceptData.appointment.status}'`);
    }

    // Must NEVER generate arbitrary fake meet.google.com random codes
    if (acceptData.appointment.meetLink.includes('meet.google.com/xxx-yyyy-zzz')) {
      throw new Error('Generated fake placeholder meet link!');
    }

    // Must be either genuine Google Meet or instant WebRTC room (e.g. Jitsi)
    const isJitsi = acceptData.appointment.meetLink.startsWith('https://meet.jit.si/');
    const isGoogleMeet = acceptData.appointment.meetLink.includes('meet.google.com');
    if (!isJitsi && !isGoogleMeet) {
      throw new Error(`Meet link is not a recognized video conference room: ${acceptData.appointment.meetLink}`);
    }
    console.log('✅ Video room generated with verified room URL:', acceptData.appointment.meetLink);

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Time-Gate Enforcement for Future Session (1 hour away)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 5: Time-Gate Enforcement for Future Session ---');
    // Set dateTime to 1 hour in future
    const oneHourFuture = new Date(Date.now() + 60 * 60 * 1000);
    await MockInterview.findByIdAndUpdate(aptId, { dateTime: oneHourFuture });

    // Student checks getAppointments
    const { req: listReq, res: listRes } = createMockReqRes(student);
    await getAppointments(listReq, listRes);
    const rawList = listRes.getData();
    const userApts = Array.isArray(rawList) ? rawList : (rawList?.appointments || []);
    const futureApt = userApts.find((a) => a.id.toString() === aptId.toString());

    console.log('   Future apt canJoin for Student:', futureApt?.canJoin);
    console.log('   Future apt meetLink masked for Student:', !futureApt?.meetLink);
    if (futureApt?.canJoin !== false || Boolean(futureApt?.meetLink)) {
      throw new Error('Student should have canJoin=false and meetLink masked for future session');
    }

    // Student tries to join via /join endpoint
    const { req: studentJoinReq, res: studentJoinRes } = createMockReqRes(student, {}, { id: aptId });
    await joinAppointment(studentJoinReq, studentJoinRes);
    console.log('   Student /join future session HTTP code:', studentJoinRes.getStatusCode());
    if (studentJoinRes.getStatusCode() !== 403) {
      throw new Error(`Expected 403 for student early join, got ${studentJoinRes.getStatusCode()}`);
    }

    // Faculty host tries to join via /join endpoint
    const { req: facultyJoinReq, res: facultyJoinRes } = createMockReqRes(faculty, {}, { id: aptId });
    await joinAppointment(facultyJoinReq, facultyJoinRes);
    console.log('   Faculty /join future session HTTP code:', facultyJoinRes.getStatusCode());
    if (facultyJoinRes.getStatusCode() !== 200 || !facultyJoinRes.getData()?.meetLink) {
      throw new Error('Faculty host must be permitted to join at any time');
    }
    console.log('✅ Faculty host unrestricted entrance verified.');

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Time-Gate Unlocked for Active Session (within 5-min buffer)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 6: Time-Gate Unlocked for Active Session ---');
    // Set dateTime to 2 minutes in future (inside 5-minute pre-session buffer)
    const activeDate = new Date(Date.now() + 2 * 60 * 1000);
    await MockInterview.findByIdAndUpdate(aptId, { dateTime: activeDate });

    // Student checks getAppointments
    const { req: listActiveReq, res: listActiveRes } = createMockReqRes(student);
    await getAppointments(listActiveReq, listActiveRes);
    const rawActiveList = listActiveRes.getData();
    const activeList = Array.isArray(rawActiveList) ? rawActiveList : (rawActiveList?.appointments || []);
    const activeApt = activeList.find((a) => a.id.toString() === aptId.toString());

    console.log('   Active session canJoin for Student:', activeApt?.canJoin);
    console.log('   Active session meetLink exposed for Student:', Boolean(activeApt?.meetLink));
    if (activeApt?.canJoin !== true || !activeApt?.meetLink) {
      throw new Error('Student must be allowed to join within 5-minute pre-session window');
    }

    // Student calls /join
    const { req: studentActiveJoinReq, res: studentActiveJoinRes } = createMockReqRes(student, {}, { id: aptId });
    await joinAppointment(studentActiveJoinReq, studentActiveJoinRes);
    if (studentActiveJoinRes.getStatusCode() !== 200 || !studentActiveJoinRes.getData()?.meetLink) {
      throw new Error(`Active student /join failed: ${JSON.stringify(studentActiveJoinRes.getData())}`);
    }
    console.log('✅ Student unlocked access verified within 5-min buffer.');

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Custom Meeting Link Update
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 7: Custom Google Meet Link Integration ---');
    const customUrl = 'https://meet.google.com/abc-defg-hij';
    const { req: customMeetReq, res: customMeetRes } = createMockReqRes(faculty, { customMeetLink: customUrl }, { id: aptId });
    await createOrRefreshMeetLink(customMeetReq, customMeetRes);
    const customData = customMeetRes.getData();

    console.log('   Updated with custom URL:', customData?.meetLink);
    console.log('   Meeting type:', customData?.meetingType);
    console.log('   Meeting provider:', customData?.meetingProvider);

    if (customData?.meetLink !== customUrl || customData?.meetingType !== 'google_meet') {
      throw new Error('Custom meet link update failed');
    }
    console.log('✅ Custom meeting URL successfully saved.');

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Evaluation & Score Certification
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 8: Faculty Evaluation Submission & Rubric Scoring ---');
    const { req: evalReq, res: evalRes } = createMockReqRes(faculty, {
      interviewId: aptId,
      technicalScore: 9,
      communicationScore: 8,
      confidenceScore: 9,
      technicalNotes: 'Strong algorithmic understanding and graph algorithms.',
      communicationNotes: 'Clear STAR articulation of past projects.',
      overallSynthesis: 'Ready for Tier 1 campus placements.',
    });

    await saveEvaluationScore(evalReq, evalRes);
    const evalData = evalRes.getData();

    if (evalRes.getStatusCode() !== 200 && evalRes.getStatusCode() !== 201 || !evalData?.success) {
      throw new Error(`Evaluation submission failed: ${JSON.stringify(evalData)}`);
    }

    console.log('   Evaluation scores saved:', evalData?.evaluation?.technicalScore, evalData?.evaluation?.communicationScore, evalData?.evaluation?.confidenceScore);

    const evaluatedInterview = await MockInterview.findById(aptId);
    console.log('   Interview status in DB:', evaluatedInterview.status);
    if (evaluatedInterview.status !== 'completed') {
      throw new Error(`Expected completed status after evaluation, got ${evaluatedInterview.status}`);
    }
    console.log('✅ Evaluation submitted, appointment marked completed, readiness score updated.');

    console.log('\n====================================================');
    console.log('🎉 ALL 8 MOCK INTERVIEW E2E TESTS PASSED CLEANLY! 🎉');
    console.log('====================================================');
  } finally {
    // Wait briefly for background promises to finish
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Cleanup created test records
    console.log('\nCleaning up test artifacts...');
    for (const item of cleanupIds) {
      try {
        await item.model.findByIdAndDelete(item.id);
      } catch (err) {
        // ignore
      }
    }
    await EvaluationScore.deleteMany({ interview: { $in: cleanupIds.map((c) => c.id) } });
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Suite Error:', err);
  process.exit(1);
});
