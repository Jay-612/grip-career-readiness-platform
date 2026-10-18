import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { cleanupData } from './cleanup.js';
import { seedUsers, DEV_DEFAULT_PASSWORD } from './users.seed.js';
import { seedRoadmaps } from './roadmaps.seed.js';
import { seedCompanies } from './companies.seed.js';
import { seedProfiles } from './profiles.seed.js';
import { seedGoals } from './goals.seed.js';
import { seedGuidance } from './guidance.seed.js';
import { seedInterviews } from './interviews.seed.js';
import { seedAlumniContent } from './alumni.seed.js';
import { seedRecruiterFeedback } from './recruiter.seed.js';
import { seedEvents } from './events.seed.js';
import { syncReadinessScores } from './readiness.sync.js';

import {
  User,
  StudentProfile,
  FacultyProfile,
  AlumniProfile,
  RecruiterProfile,
  CareerRoadmap,
  SemesterPlan,
  WeeklyGoal,
  ActionPlan,
  GuidanceRequest,
  GuidanceReply,
  ExperiencePost,
  MockInterview,
  EvaluationScore,
  Company,
  RecruiterFeedback,
  DepartmentEvent,
} from '../model/index.js';

/**
 * Master Development Database Seeding Runner.
 * Orchestrates modular seeding in dependency-safe order.
 */
async function runSeed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: Database seeding cannot be executed in PRODUCTION mode.');
    process.exit(1);
  }

  const startTime = Date.now();
  console.log('====================================================');
  console.log('🚀 GRIP PLATFORM — DEVELOPMENT DATABASE SEEDING');
  console.log('====================================================');

  try {
    await connectDB();

    // 1. Reset / Teardown existing records in safe order
    await cleanupData();

    // 2. Core Independent Models
    const users = await seedUsers();
    const roadmaps = await seedRoadmaps();
    const companies = await seedCompanies();

    // 3. Profiles (Depends on Users)
    const profiles = await seedProfiles(users);

    // 4. Student Goals & Action Plans (Depends on Students)
    const goals = await seedGoals(users);

    // 5. Guidance Requests & Replies (Depends on Students, Faculty, Alumni)
    const guidance = await seedGuidance(users);

    // 6. Mock Interviews & Evaluations (Depends on Students, Faculty, Recruiters)
    const interviews = await seedInterviews(users);

    // 7. Alumni Experience Posts (Depends on Alumni)
    const alumniContent = await seedAlumniContent(users);

    // 8. Recruiter Feedback (Depends on Students, Recruiters)
    const recruiterFeedback = await seedRecruiterFeedback(users);

    // 9. Department Events (Depends on Faculty HOD)
    const events = await seedEvents(users);

    // 10. Synchronize Placement Readiness Scores
    await syncReadinessScores(users.students);

    // 11. Query Collection Statistics for Final Verification
    const [
      userCount,
      studentProfileCount,
      facultyProfileCount,
      alumniProfileCount,
      recruiterProfileCount,
      roadmapCount,
      semesterPlanCount,
      goalCount,
      actionPlanCount,
      guidanceRequestCount,
      guidanceReplyCount,
      mockInterviewCount,
      evaluationScoreCount,
      companyCount,
      recruiterFeedbackCount,
      experiencePostCount,
      departmentEventCount,
    ] = await Promise.all([
      User.countDocuments(),
      StudentProfile.countDocuments(),
      FacultyProfile.countDocuments(),
      AlumniProfile.countDocuments(),
      RecruiterProfile.countDocuments(),
      CareerRoadmap.countDocuments(),
      SemesterPlan.countDocuments(),
      WeeklyGoal.countDocuments(),
      ActionPlan.countDocuments(),
      GuidanceRequest.countDocuments(),
      GuidanceReply.countDocuments(),
      MockInterview.countDocuments(),
      EvaluationScore.countDocuments(),
      Company.countDocuments(),
      RecruiterFeedback.countDocuments(),
      ExperiencePost.countDocuments(),
      DepartmentEvent.countDocuments(),
    ]);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY (' + elapsed + 's)');
    console.log('====================================================');
    console.log('📊 INSERTED RECORD COUNTS:');
    console.log(`   • Users:                  ${userCount}`);
    console.log(`   • Student Profiles:       ${studentProfileCount}`);
    console.log(`   • Faculty Profiles:       ${facultyProfileCount} (including HOD)`);
    console.log(`   • Alumni Profiles:        ${alumniProfileCount}`);
    console.log(`   • Recruiter Profiles:     ${recruiterProfileCount}`);
    console.log(`   • Career Roadmaps:        ${roadmapCount}`);
    console.log(`   • Semester Plans:         ${semesterPlanCount}`);
    console.log(`   • Weekly Goals:           ${goalCount}`);
    console.log(`   • Action Plans:           ${actionPlanCount}`);
    console.log(`   • Guidance Requests:      ${guidanceRequestCount}`);
    console.log(`   • Guidance Replies:       ${guidanceReplyCount}`);
    console.log(`   • Mock Interviews:        ${mockInterviewCount}`);
    console.log(`   • Evaluation Scores:      ${evaluationScoreCount}`);
    console.log(`   • Companies:              ${companyCount}`);
    console.log(`   • Recruiter Feedback:     ${recruiterFeedbackCount}`);
    console.log(`   • Alumni Experience Posts:${experiencePostCount}`);
    console.log(`   • Department Events:      ${departmentEventCount}`);
    console.log('----------------------------------------------------');
    console.log(`   TOTAL RECORDS INSERTED:   ${
      userCount +
      studentProfileCount +
      facultyProfileCount +
      alumniProfileCount +
      recruiterProfileCount +
      roadmapCount +
      semesterPlanCount +
      goalCount +
      actionPlanCount +
      guidanceRequestCount +
      guidanceReplyCount +
      mockInterviewCount +
      evaluationScoreCount +
      companyCount +
      recruiterFeedbackCount +
      experiencePostCount +
      departmentEventCount
    }`);
    console.log('====================================================\n');

    console.log('🔑 DETERMINISTIC DEVELOPMENT LOGIN CREDENTIALS:');
    console.log('   All accounts use password: ' + DEV_DEFAULT_PASSWORD);
    console.log('----------------------------------------------------');
    console.log('   STUDENTS (8):');
    console.log('   1. aarav.sharma@campus.edu     (High Achiever, Sem 6, Top Readiness)');
    console.log('   2. diya.patel@campus.edu       (Product Eng, Sem 5, Active Goals)');
    console.log('   3. rohan.gupta@campus.edu      (Backend Eng, Sem 6, Evaluated)');
    console.log('   4. ananya.reddy@campus.edu     (Full-Stack, Sem 5, Scheduled Interview)');
    console.log('   5. kabir.verma@campus.edu      (DevOps, Sem 3, Early Stage)');
    console.log('   6. ishaan.nair@campus.edu      (AI Systems, Sem 6, Overdue Goals)');
    console.log('   7. meera.joshi@campus.edu      (Incomplete Profile / Empty State)');
    console.log('   8. tanvi.deshmukh@campus.edu   (Tier-1 Readiness, Top on Leaderboard)');
    console.log('----------------------------------------------------');
    console.log('   FACULTY & HOD (3):');
    console.log('   1. dr.rajesh.kumar@campus.edu  (Faculty & HOD, CSE Department)');
    console.log('   2. prof.neha.sharma@campus.edu (Faculty Member, CSE Department)');
    console.log('   3. dr.arun.pandey@campus.edu   (Faculty Member, IT Department)');
    console.log('----------------------------------------------------');
    console.log('   ALUMNI MENTORS (2):');
    console.log('   1. vikram.aditya@alumni.edu    (Senior Software Eng @ TechCorp, 2022)');
    console.log('   2. priya.nambiar@alumni.edu    (Staff Cloud Architect @ CloudSys, 2020)');
    console.log('----------------------------------------------------');
    console.log('   CAMPUS RECRUITERS (2):');
    console.log('   1. alex.rivera@techcorp.com    (Lead University Recruiter, TechCorp)');
    console.log('   2. sarah.chen@fintechapex.com  (Director Campus Talent, FinTech Apex)');
    console.log('----------------------------------------------------');
    console.log('   ADMINISTRATOR (1):');
    console.log('   1. admin@campus.edu            (Platform Institutional Admin)');
    console.log('====================================================\n');

    await mongoose.disconnect();
    console.log('🔌 Database disconnected cleanly. Seed workflow complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED WITH ERROR:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runSeed();
