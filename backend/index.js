import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
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
} from './model/index.js';

console.log('🚀 Starting GRIP 17-Entity Mongoose Models & MongoDB Integration Test...\n');

async function runLiveDatabaseTest() {
  let conn;
  try {
    conn = await connectDB();
  } catch (err) {
    console.error('❌ Unable to establish database connection:', err.message);
    return;
  }

  console.log('\n--- 🧪 Executing Schema Validation & Live CRUD Operations ---');

  try {
    // 1. Users
    const sampleUser = await User.create({
      name: 'Test Student',
      email: `student_${Date.now()}@example.com`,
      password: 'securepassword123',
      role: 'student',
    });
    console.log(`  ✓ 1. Users collection: Saved user with ID ${sampleUser._id}`);

    const sampleFaculty = await User.create({
      name: 'Dr. Alan Turing',
      email: `faculty_${Date.now()}@example.com`,
      password: 'faculty_password',
      role: 'faculty',
    });

    const sampleAlumni = await User.create({
      name: 'Grace Hopper',
      email: `alumni_${Date.now()}@example.com`,
      password: 'alumni_password',
      role: 'alumni',
    });

    const sampleRecruiter = await User.create({
      name: 'Recruiter Bob',
      email: `recruiter_${Date.now()}@example.com`,
      password: 'recruiter_password',
      role: 'recruiter',
    });

    // 2. Student_Profiles
    const studentProfile = await StudentProfile.create({
      studentId: sampleUser._id,
      semester: 6,
      selectedCareer: 'Backend Developer',
      readinessScore: 88,
    });
    console.log(`  ✓ 2. Student_Profiles collection: Saved profile for student ${studentProfile.studentId}`);

    // 3. Faculty_Profiles
    const facultyProfile = await FacultyProfile.create({
      facultyId: sampleFaculty._id,
      employeeId: 'FAC-7001',
      department: 'Computer Science & Engineering',
      isHOD: true,
    });
    console.log(`  ✓ 3. Faculty_Profiles collection: Saved profile for HOD ${facultyProfile.employeeId}`);

    // 4. Alumni_Profiles
    const alumniProfile = await AlumniProfile.create({
      alumniId: sampleAlumni._id,
      graduationYear: 2023,
      currentCompany: 'Google',
      jobRole: 'Software Engineer II',
    });
    console.log(`  ✓ 4. Alumni_Profiles collection: Saved alumni profile for year ${alumniProfile.graduationYear}`);

    // 5. Recruiter_Profiles
    const recruiterProfile = await RecruiterProfile.create({
      recruiterId: sampleRecruiter._id,
      companyName: 'Meta',
      designation: 'Senior Talent Partner',
    });
    console.log(`  ✓ 5. Recruiter_Profiles collection: Saved recruiter profile for ${recruiterProfile.companyName}`);

    // 6. Career_Roadmaps
    const careerRoadmap = await CareerRoadmap.create({
      careerName: 'Backend Engineering Roadmap',
      description: 'Master Node.js, Express, MongoDB, and Distributed Systems',
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'System Design'],
    });
    console.log(`  ✓ 6. Career_Roadmaps collection: Saved roadmap "${careerRoadmap.careerName}"`);

    // 7. Semester_Plans
    const semesterPlan = await SemesterPlan.create({
      roadmapId: careerRoadmap._id,
      semesterNumber: 5,
      subjects: ['Database Management Systems', 'Web Security', 'Algorithms'],
    });
    console.log(`  ✓ 7. Semester_Plans collection: Saved semester ${semesterPlan.semesterNumber} plan`);

    // 8. Weekly_Goals
    const weeklyGoal = await WeeklyGoal.create({
      studentId: sampleUser._id,
      title: 'Complete MongoDB Schema and Mongoose Models',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    console.log(`  ✓ 8. Weekly_Goals collection: Saved goal "${weeklyGoal.title}"`);

    // 9. Guidance_Requests
    const guidanceRequest = await GuidanceRequest.create({
      studentId: sampleUser._id,
      question: 'What are the key technical concepts to master for backend interviews?',
      date: new Date(),
    });
    console.log(`  ✓ 9. Guidance_Requests collection: Saved request ID ${guidanceRequest._id}`);

    // 10. Guidance_Replies
    const guidanceReply = await GuidanceReply.create({
      requestId: guidanceRequest._id,
      mentorId: sampleAlumni._id,
      answerText: 'Focus on database indexes, RESTful design principles, and async programming.',
    });
    console.log(`  ✓ 10. Guidance_Replies collection: Saved reply ID ${guidanceReply._id}`);

    // 11. Experience_Posts
    const experiencePost = await ExperiencePost.create({
      alumniId: sampleAlumni._id,
      title: 'Cracking the Technical Screening at Google',
      content: 'Here is a breakdown of how I prepared data structures and system design...',
      tags: ['Interview Prep', 'Google', 'Career Guidance'],
      date: new Date(),
    });
    console.log(`  ✓ 11. Experience_Posts collection: Saved post "${experiencePost.title}"`);

    // 12. Mock_Interviews
    const mockInterview = await MockInterview.create({
      studentId: sampleUser._id,
      interviewerId: sampleFaculty._id,
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      meetLink: 'https://meet.google.com/grip-mock-test',
      status: 'scheduled',
    });
    console.log(`  ✓ 12. Mock_Interviews collection: Scheduled interview ID ${mockInterview._id}`);

    // 13. Evaluation_Scores
    const evaluationScore = await EvaluationScore.create({
      interviewId: mockInterview._id,
      technicalScore: 9,
      communicationScore: 8.5,
      confidenceScore: 9,
    });
    console.log(`  ✓ 13. Evaluation_Scores collection: Saved scores for interview ${evaluationScore.interviewId}`);

    // 14. Action_Plans
    const actionPlan = await ActionPlan.create({
      studentId: sampleUser._id,
      weakSkill: 'System Design Scaling',
      recommendedTask: 'Study microservices architecture and load balancing techniques.',
    });
    console.log(`  ✓ 14. Action_Plans collection: Saved action plan for skill "${actionPlan.weakSkill}"`);

    // 15. Companies
    const company = await Company.create({
      companyName: 'TechCorp Solutions',
      requiredSkills: ['Node.js', 'MongoDB', 'React', 'Docker'],
      minimumMatchScore: 80,
    });
    console.log(`  ✓ 15. Companies collection: Saved company "${company.companyName}"`);

    // 16. Recruiter_Feedback
    const recruiterFeedback = await RecruiterFeedback.create({
      studentId: sampleUser._id,
      recruiterId: sampleRecruiter._id,
      comments: 'Excellent core computer science knowledge and clear communication.',
      date: new Date(),
    });
    console.log(`  ✓ 16. Recruiter_Feedback collection: Saved feedback ID ${recruiterFeedback._id}`);

    // 17. Department_Events
    const departmentEvent = await DepartmentEvent.create({
      hodId: sampleFaculty._id,
      title: 'GRIP Placement Readiness Hackathon 2026',
      targetSkill: 'Full Stack Development',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    console.log(`  ✓ 17. Department_Events collection: Saved event "${departmentEvent.title}"`);

    console.log('\n-----------------------------------------------------------');
    console.log('🎉 SUCCESS: All 17 collections connected, inserted, and verified on MongoDB!');
    console.log('-----------------------------------------------------------\n');
  } catch (dbError) {
    console.error('\n❌ Database operation failed:', dbError.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runLiveDatabaseTest();
