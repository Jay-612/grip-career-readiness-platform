import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import {
  User,
  StudentProfile,
  FacultyProfile,
  AlumniProfile,
  RecruiterProfile,
  CareerRoadmap,
  SemesterPlan,
  WeeklyGoal,
  GuidanceRequest,
  GuidanceReply,
  ExperiencePost,
  MockInterview,
  EvaluationScore,
  ActionPlan,
  Company,
  RecruiterFeedback,
  DepartmentEvent,
} from '../model/index.js';

/**
 * Clean up all development collections in dependency-safe order.
 * Strictly guards against execution in production environments.
 */
export async function cleanupData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ ABORTED: Database cleanup cannot be executed in PRODUCTION mode!');
  }

  console.log('\n🧹 Clearing existing development database records...');

  // Delete in reverse dependency order
  const results = await Promise.all([
    EvaluationScore.deleteMany({}),
    MockInterview.deleteMany({}),
    GuidanceReply.deleteMany({}),
    GuidanceRequest.deleteMany({}),
    ExperiencePost.deleteMany({}),
    WeeklyGoal.deleteMany({}),
    ActionPlan.deleteMany({}),
    DepartmentEvent.deleteMany({}),
    RecruiterFeedback.deleteMany({}),
    Company.deleteMany({}),
    SemesterPlan.deleteMany({}),
    CareerRoadmap.deleteMany({}),
    StudentProfile.deleteMany({}),
    FacultyProfile.deleteMany({}),
    AlumniProfile.deleteMany({}),
    RecruiterProfile.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('✅ All collections successfully reset to clean state.\n');
  return results;
}

// Support direct CLI execution: node seed/cleanup.js
if (process.argv[1] && process.argv[1].endsWith('cleanup.js')) {
  (async () => {
    try {
      await connectDB();
      await cleanupData();
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during cleanup:', err.message);
      process.exit(1);
    }
  })();
}
