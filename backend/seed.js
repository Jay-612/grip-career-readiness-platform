import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

// ─── Production Safety Check ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seeding is disabled in production.');
  process.exit(1);
}

const DEFAULT_PASSWORD = 'Grip@123';

/**
 * Reusable helper to upsert a User document idempotently.
 */
async function seedUser({ name, email, role, hashedPassword }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name,
        email: normalizedEmail,
        role,
        password: hashedPassword,
      },
    },
    {
      returnDocument: 'after',
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
  return user;
}

/**
 * Helper to generate deterministic dates offset by days/hours from execution.
 */
const now = new Date();
const addDays = (days, base = now) => new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
const subDays = (days, base = now) => new Date(base.getTime() - days * 24 * 60 * 60 * 1000);

/**
 * Main seeding function
 */
async function runSeed() {
  let conn;
  try {
    conn = await connectDB();

    console.log('Generating bcrypt password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    // ─────────────────────────────────────────────
    // PART 1: SEED USERS & PROFILES
    // ─────────────────────────────────────────────

    // 1. Students
    console.log('\nSeeding Students...');
    const studentData = [
      {
        name: 'Tanish Y Mistry',
        email: 'tanish@gmail.com',
        semester: 5,
        selectedCareer: 'Software Engineer',
        readinessScore: 78,
      },
      {
        name: 'Jay P Patel',
        email: 'jay@gmail.com',
        semester: 5,
        selectedCareer: 'Backend Engineer',
        readinessScore: 85,
      },
      {
        name: 'Preet S Dhodia',
        email: 'preet@gmail.com',
        semester: 5,
        selectedCareer: 'Full Stack Developer',
        readinessScore: 72,
      },
    ];

    const studentMap = new Map();
    for (const item of studentData) {
      const user = await seedUser({
        name: item.name,
        email: item.email,
        role: 'student',
        hashedPassword,
      });

      await StudentProfile.findOneAndUpdate(
        { studentId: user._id },
        {
          $set: {
            studentId: user._id,
            semester: item.semester,
            selectedCareer: item.selectedCareer,
            readinessScore: item.readinessScore,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`[student] ${user.name} (${user.email})`);
      studentMap.set(item.email, user);
    }

    // 2. Faculty
    console.log('\nSeeding Faculty...');
    const facultyData = [
      {
        name: 'Ankit P Vaishanav',
        email: 'ankit@gmail.com',
        employeeId: 'FAC001',
        department: 'Computer Engineering',
        isHOD: false,
      },
      {
        name: 'Hariom A Pandya',
        email: 'hariom@gmail.com',
        employeeId: 'FAC002',
        department: 'Computer Engineering',
        isHOD: false,
      },
      {
        name: 'Apurav A Mehta',
        email: 'apurav@gmail.com',
        employeeId: 'FAC003',
        department: 'Computer Engineering',
        isHOD: false,
      },
    ];

    const facultyMap = new Map();
    for (const item of facultyData) {
      const user = await seedUser({
        name: item.name,
        email: item.email,
        role: 'faculty',
        hashedPassword,
      });

      await FacultyProfile.findOneAndUpdate(
        { facultyId: user._id },
        {
          $set: {
            facultyId: user._id,
            employeeId: item.employeeId,
            department: item.department,
            isHOD: item.isHOD,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`[faculty] ${user.name} (${user.email})`);
      facultyMap.set(item.email, user);
    }

    // 3. HOD
    console.log('\nSeeding HOD...');
    const hodItem = {
      name: 'CKB',
      email: 'ckb@gmail.com',
      employeeId: 'HOD001',
      department: 'Computer Engineering',
      isHOD: true,
    };

    const hodUser = await seedUser({
      name: hodItem.name,
      email: hodItem.email,
      role: 'faculty', // Handled via isHOD: true in FacultyProfile
      hashedPassword,
    });

    await FacultyProfile.findOneAndUpdate(
      { facultyId: hodUser._id },
      {
        $set: {
          facultyId: hodUser._id,
          employeeId: hodItem.employeeId,
          department: hodItem.department,
          isHOD: hodItem.isHOD,
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(`[faculty - HOD] ${hodUser.name} (${hodUser.email})`);

    // 4. Alumni
    console.log('\nSeeding Alumni...');
    const alumniData = [
      {
        name: 'Murtaza Mister',
        email: 'murtaza@gmail.com',
        graduationYear: 2022,
        currentCompany: 'Amazon',
        jobRole: 'Software Development Engineer',
      },
      {
        name: 'Om Soni',
        email: 'om@gmail.com',
        graduationYear: 2023,
        currentCompany: 'Microsoft',
        jobRole: 'Backend Engineer',
      },
      {
        name: 'Manav Mistry',
        email: 'manav@gmail.com',
        graduationYear: 2023,
        currentCompany: 'Atlassian',
        jobRole: 'Full Stack Engineer',
      },
    ];

    const alumniMap = new Map();
    for (const item of alumniData) {
      const user = await seedUser({
        name: item.name,
        email: item.email,
        role: 'alumni',
        hashedPassword,
      });

      await AlumniProfile.findOneAndUpdate(
        { alumniId: user._id },
        {
          $set: {
            alumniId: user._id,
            graduationYear: item.graduationYear,
            currentCompany: item.currentCompany,
            jobRole: item.jobRole,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`[alumni] ${user.name} (${user.email})`);
      alumniMap.set(item.email, user);
    }

    // 5. Recruiters
    console.log('\nSeeding Recruiters...');
    const recruiterData = [
      {
        name: 'Elon Musk',
        email: 'elon@gmail.com',
        companyName: 'Tesla',
        designation: 'Recruiter',
      },
      {
        name: 'Mukesh Ambani',
        email: 'mukesh@gmail.com',
        companyName: 'Reliance Industries',
        designation: 'Recruiter',
      },
    ];

    const recruiterMap = new Map();
    for (const item of recruiterData) {
      const user = await seedUser({
        name: item.name,
        email: item.email,
        role: 'recruiter',
        hashedPassword,
      });

      await RecruiterProfile.findOneAndUpdate(
        { recruiterId: user._id },
        {
          $set: {
            recruiterId: user._id,
            companyName: item.companyName,
            designation: item.designation,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`[recruiter] ${user.name} (${user.email})`);
      recruiterMap.set(item.email, user);
    }

    // ─────────────────────────────────────────────
    // PART 4: CAREER ROADMAPS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Career Roadmaps...');
    const roadmapsData = [
      {
        careerName: 'Backend Engineer',
        description:
          'Roadmap for building strong backend, database, API and system design skills.',
        requiredSkills: [
          'Node.js',
          'Express.js',
          'MongoDB',
          'SQL',
          'System Design',
          'Docker',
        ],
      },
      {
        careerName: 'Full Stack Developer',
        description:
          'Roadmap covering frontend, backend, databases and deployment.',
        requiredSkills: [
          'React',
          'JavaScript',
          'Node.js',
          'Express.js',
          'MongoDB',
          'Git',
        ],
      },
      {
        careerName: 'Software Engineer',
        description:
          'General software engineering roadmap focused on programming, algorithms, backend development and engineering fundamentals.',
        requiredSkills: [
          'DSA',
          'JavaScript',
          'Node.js',
          'Databases',
          'Operating Systems',
          'Git',
        ],
      },
    ];

    const roadmapMap = new Map();
    for (const item of roadmapsData) {
      const roadmap = await CareerRoadmap.findOneAndUpdate(
        { careerName: item.careerName },
        {
          $set: {
            careerName: item.careerName,
            description: item.description,
            requiredSkills: item.requiredSkills,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      roadmapMap.set(item.careerName, roadmap);
      console.log(`[roadmap] ${roadmap.careerName}`);
    }

    // ─────────────────────────────────────────────
    // PART 5: SEMESTER PLANS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Semester Plans...');
    const backendRoadmap = roadmapMap.get('Backend Engineer');
    const fullstackRoadmap = roadmapMap.get('Full Stack Developer');

    const semesterPlansData = [
      // Backend Engineer plans
      {
        roadmapId: backendRoadmap._id,
        semesterNumber: 5,
        subjects: ['Node.js', 'MongoDB', 'REST APIs', 'Operating Systems'],
      },
      {
        roadmapId: backendRoadmap._id,
        semesterNumber: 6,
        subjects: ['System Design', 'Docker', 'Redis', 'Cloud Fundamentals'],
      },
      // Full Stack plans
      {
        roadmapId: fullstackRoadmap._id,
        semesterNumber: 5,
        subjects: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
      },
      {
        roadmapId: fullstackRoadmap._id,
        semesterNumber: 6,
        subjects: ['System Design', 'Deployment', 'Testing', 'DevOps Basics'],
      },
    ];

    const seededSemesterPlans = [];
    for (const item of semesterPlansData) {
      const plan = await SemesterPlan.findOneAndUpdate(
        { roadmapId: item.roadmapId, semesterNumber: item.semesterNumber },
        {
          $set: {
            roadmapId: item.roadmapId,
            semesterNumber: item.semesterNumber,
            subjects: item.subjects,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededSemesterPlans.push(plan);
      console.log(`[semester-plan] Roadmap ${plan.roadmapId} - Sem ${plan.semesterNumber}`);
    }

    // ─────────────────────────────────────────────
    // PART 6: WEEKLY GOALS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Weekly Goals...');
    const jayUser = studentMap.get('jay@gmail.com');
    const tanishUser = studentMap.get('tanish@gmail.com');
    const preetUser = studentMap.get('preet@gmail.com');

    const goalsData = [
      // JAY
      {
        studentId: jayUser._id,
        title: 'Complete Redis caching module',
        status: 'in-progress',
        dueDate: addDays(5),
      },
      {
        studentId: jayUser._id,
        title: 'Practice 10 DSA graph problems',
        status: 'pending',
        dueDate: addDays(7),
      },
      {
        studentId: jayUser._id,
        title: 'Complete Node.js API assignment',
        status: 'completed',
        dueDate: subDays(2),
      },
      // TANISH
      {
        studentId: tanishUser._id,
        title: 'Complete system design notes',
        status: 'in-progress',
        dueDate: addDays(4),
      },
      {
        studentId: tanishUser._id,
        title: 'Revise operating system concepts',
        status: 'pending',
        dueDate: addDays(6),
      },
      {
        studentId: tanishUser._id,
        title: 'Finish database mini project',
        status: 'completed',
        dueDate: subDays(1),
      },
      // PREET
      {
        studentId: preetUser._id,
        title: 'Build React dashboard module',
        status: 'in-progress',
        dueDate: addDays(3),
      },
      {
        studentId: preetUser._id,
        title: 'Practice JavaScript interview questions',
        status: 'pending',
        dueDate: addDays(8),
      },
      {
        studentId: preetUser._id,
        title: 'Complete Git and GitHub exercises',
        status: 'completed',
        dueDate: subDays(3),
      },
    ];

    const seededGoals = [];
    for (const item of goalsData) {
      const goal = await WeeklyGoal.findOneAndUpdate(
        { studentId: item.studentId, title: item.title },
        {
          $set: {
            studentId: item.studentId,
            title: item.title,
            status: item.status,
            dueDate: item.dueDate,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededGoals.push(goal);
      console.log(`[goal] (${item.status}) ${item.title}`);
    }

    // ─────────────────────────────────────────────
    // PART 7: GUIDANCE REQUESTS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Guidance Requests...');
    const ankitFaculty = facultyMap.get('ankit@gmail.com');
    const hariomFaculty = facultyMap.get('hariom@gmail.com');
    const apuravFaculty = facultyMap.get('apurav@gmail.com');

    const guidanceRequestsData = [
      {
        studentId: jayUser._id,
        question: 'How should I start learning system design for backend placements?',
        targetType: 'faculty',
        targetFacultyId: ankitFaculty._id,
        topic: 'System Design',
        status: 'replied',
        date: subDays(3),
      },
      {
        studentId: tanishUser._id,
        question: 'Which topics should I focus on to improve my software engineering readiness?',
        targetType: 'faculty',
        targetFacultyId: hariomFaculty._id,
        topic: 'Career Guidance',
        status: 'replied',
        date: subDays(2),
      },
      {
        studentId: preetUser._id,
        question: 'How can I improve my React and JavaScript interview preparation?',
        targetType: 'faculty',
        targetFacultyId: apuravFaculty._id,
        topic: 'Frontend Interview',
        status: 'replied',
        date: subDays(2),
      },
      // Additional unanswered question for Jay to demonstrate pending inbox
      {
        studentId: jayUser._id,
        question: 'I am weak in Redis and caching. What should I practice first?',
        targetType: 'faculty',
        targetFacultyId: ankitFaculty._id,
        topic: 'Backend & Caching',
        status: 'pending',
        date: subDays(1),
      },
    ];

    const guidanceRequestMap = new Map();
    for (const item of guidanceRequestsData) {
      const reqDoc = await GuidanceRequest.findOneAndUpdate(
        { studentId: item.studentId, question: item.question },
        {
          $set: {
            studentId: item.studentId,
            question: item.question,
            targetType: item.targetType,
            targetFacultyId: item.targetFacultyId,
            topic: item.topic,
            status: item.status,
            date: item.date,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      guidanceRequestMap.set(item.question, reqDoc);
      console.log(`[guidance-request] (${item.status}) ${item.question.slice(0, 50)}...`);
    }

    // ─────────────────────────────────────────────
    // PART 8: GUIDANCE REPLIES
    // ─────────────────────────────────────────────
    console.log('\nSeeding Guidance Replies...');
    const jaySysDesignReq = guidanceRequestMap.get(
      'How should I start learning system design for backend placements?'
    );
    const tanishReq = guidanceRequestMap.get(
      'Which topics should I focus on to improve my software engineering readiness?'
    );
    const preetReq = guidanceRequestMap.get(
      'How can I improve my React and JavaScript interview preparation?'
    );

    const guidanceRepliesData = [
      {
        requestId: jaySysDesignReq._id,
        mentorId: ankitFaculty._id,
        answerText:
          'Start with scalability basics, load balancing, caching, databases and then practice small system design problems.',
      },
      {
        requestId: tanishReq._id,
        mentorId: hariomFaculty._id,
        answerText:
          'Focus on DSA, operating systems, databases and one strong development stack.',
      },
      {
        requestId: preetReq._id,
        mentorId: apuravFaculty._id,
        answerText:
          'Strengthen JavaScript fundamentals first, then React patterns and practical projects.',
      },
    ];

    const seededReplies = [];
    for (const item of guidanceRepliesData) {
      const reply = await GuidanceReply.findOneAndUpdate(
        { requestId: item.requestId, mentorId: item.mentorId },
        {
          $set: {
            requestId: item.requestId,
            mentorId: item.mentorId,
            answerText: item.answerText,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededReplies.push(reply);
      console.log(`[guidance-reply] Mentor ${item.mentorId} -> Request ${item.requestId}`);
    }

    // ─────────────────────────────────────────────
    // PART 9: ALUMNI EXPERIENCE POSTS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Alumni Experience Posts...');
    const murtazaAlumni = alumniMap.get('murtaza@gmail.com');
    const omAlumni = alumniMap.get('om@gmail.com');
    const manavAlumni = alumniMap.get('manav@gmail.com');

    const postsData = [
      // MURTAZA
      {
        alumniId: murtazaAlumni._id,
        title: 'How I Prepared for My First Software Engineering Interview',
        content:
          'Share practical preparation advice covering DSA, projects, interview practice and consistency. Focus on core algorithms and clean coding conventions.',
        tags: ['Interview', 'DSA', 'Career'],
        date: subDays(10),
      },
      {
        alumniId: murtazaAlumni._id,
        title: 'What I Wish I Knew Before Placements',
        content:
          'Advice about resumes, projects, technical fundamentals and mock interviews. Keep projects well-documented on GitHub and practice behavioral stories.',
        tags: ['Placements', 'Career', 'Resume'],
        date: subDays(8),
      },
      // OM
      {
        alumniId: omAlumni._id,
        title: 'My Journey Into Backend Engineering',
        content:
          'Explain learning Node.js, APIs, databases, caching and system design. Deep dive into asynchronous architecture and database schema optimization.',
        tags: ['Backend', 'Node.js', 'System Design'],
        date: subDays(6),
      },
      {
        alumniId: omAlumni._id,
        title: 'Why Projects Matter More Than Tutorials',
        content:
          'Explain how practical projects helped during interviews. Building end-to-end applications gives you real debugging stories that interviewers value.',
        tags: ['Projects', 'Career', 'Backend'],
        date: subDays(4),
      },
      // MANAV
      {
        alumniId: manavAlumni._id,
        title: 'Building a Strong Full Stack Portfolio',
        content:
          'Advice on selecting React, Node.js and database projects for a portfolio. Demonstrate real full-stack integrations, responsive UIs, and automated deployments.',
        tags: ['React', 'Full Stack', 'Portfolio'],
        date: subDays(2),
      },
    ];

    const seededPosts = [];
    for (const item of postsData) {
      const post = await ExperiencePost.findOneAndUpdate(
        { alumniId: item.alumniId, title: item.title },
        {
          $set: {
            alumniId: item.alumniId,
            title: item.title,
            content: item.content,
            tags: item.tags,
            date: item.date,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededPosts.push(post);
      console.log(`[experience-post] ${post.title}`);
    }

    // ─────────────────────────────────────────────
    // PART 10: MOCK INTERVIEWS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Mock Interviews...');
    const interviewsData = [
      {
        studentId: jayUser._id,
        interviewerId: ankitFaculty._id,
        dateTime: addDays(2),
        status: 'scheduled',
        meetLink: 'https://meet.google.com/demo-jay-an',
        duration: 45,
      },
      {
        studentId: tanishUser._id,
        interviewerId: hariomFaculty._id,
        dateTime: subDays(3),
        status: 'completed',
        meetLink: 'https://meet.google.com/demo-tanish-ha',
        duration: 45,
      },
      {
        studentId: preetUser._id,
        interviewerId: apuravFaculty._id,
        dateTime: addDays(1),
        status: 'scheduled',
        meetLink: 'https://meet.google.com/demo-preet-ap',
        duration: 45,
      },
      {
        studentId: jayUser._id,
        interviewerId: apuravFaculty._id,
        dateTime: subDays(10),
        status: 'cancelled',
        meetLink: 'https://meet.google.com/demo-jay-cancelled',
        duration: 45,
        cancelReason: 'Rescheduled upon candidate request',
      },
    ];

    const interviewMap = new Map();
    for (const item of interviewsData) {
      const interview = await MockInterview.findOneAndUpdate(
        {
          studentId: item.studentId,
          interviewerId: item.interviewerId,
          meetLink: item.meetLink,
        },
        {
          $set: {
            studentId: item.studentId,
            interviewerId: item.interviewerId,
            dateTime: item.dateTime,
            status: item.status,
            meetLink: item.meetLink,
            duration: item.duration,
            cancelReason: item.cancelReason || '',
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      interviewMap.set(item.meetLink, interview);
      console.log(`[mock-interview] (${item.status}) Student ${item.studentId} with ${item.interviewerId}`);
    }

    // ─────────────────────────────────────────────
    // PART 11: EVALUATION SCORES
    // ─────────────────────────────────────────────
    console.log('\nSeeding Evaluation Scores...');
    const tanishCompletedInterview = interviewMap.get(
      'https://meet.google.com/demo-tanish-ha'
    );

    const evaluationScoresData = [
      {
        interviewId: tanishCompletedInterview._id,
        technicalScore: 8,
        communicationScore: 7,
        confidenceScore: 8,
      },
    ];

    const seededEvaluationScores = [];
    for (const item of evaluationScoresData) {
      const score = await EvaluationScore.findOneAndUpdate(
        { interviewId: item.interviewId },
        {
          $set: {
            interviewId: item.interviewId,
            technicalScore: item.technicalScore,
            communicationScore: item.communicationScore,
            confidenceScore: item.confidenceScore,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededEvaluationScores.push(score);
      console.log(`[evaluation-score] Interview ${score.interviewId} -> Tech: ${score.technicalScore}, Comm: ${score.communicationScore}, Conf: ${score.confidenceScore}`);
    }

    // ─────────────────────────────────────────────
    // PART 12: ACTION PLANS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Action Plans...');
    const actionPlansData = [
      {
        studentId: jayUser._id,
        weakSkill: 'System Design',
        recommendedTask:
          'Complete two system design case studies and revise caching/load balancing.',
        facultyFeedback:
          'Strong API skills, focus on horizontal scaling, Redis caching, and rate limiting patterns.',
        evaluatorId: ankitFaculty._id,
        status: 'assigned',
      },
      {
        studentId: tanishUser._id,
        weakSkill: 'Database Optimization',
        recommendedTask:
          'Practice indexing, query optimization and transaction concepts.',
        facultyFeedback:
          'Revise indexing trade-offs, explain plans, and ACID transaction guarantees.',
        evaluatorId: hariomFaculty._id,
        status: 'assigned',
      },
      {
        studentId: preetUser._id,
        weakSkill: 'JavaScript',
        recommendedTask:
          'Practice closures, promises, async/await and event loop questions.',
        facultyFeedback:
          'Solid React styling, practice event-loop microtasks and closure mechanics.',
        evaluatorId: apuravFaculty._id,
        status: 'assigned',
      },
    ];

    const seededActionPlans = [];
    for (const item of actionPlansData) {
      // Find existing or create via model to trigger schema hooks
      let plan = await ActionPlan.findOne({
        studentId: item.studentId,
        weakSkill: item.weakSkill,
      });

      if (!plan) {
        plan = new ActionPlan({
          studentId: item.studentId,
          weakSkill: item.weakSkill,
          weakSkills: [item.weakSkill],
          recommendedTask: item.recommendedTask,
          facultyFeedback: item.facultyFeedback,
          evaluatorNotes: item.facultyFeedback,
          evaluatorId: item.evaluatorId,
          status: item.status,
          tasks: [
            {
              title: item.recommendedTask,
              category: 'technical',
              estimatedHours: 5,
              targetDate: addDays(7),
              task: item.recommendedTask,
              domain: 'technical',
              priority: 'high',
            },
          ],
        });
        await plan.save();
      } else {
        plan.recommendedTask = item.recommendedTask;
        plan.facultyFeedback = item.facultyFeedback;
        plan.evaluatorNotes = item.facultyFeedback;
        plan.evaluatorId = item.evaluatorId;
        plan.status = item.status;
        await plan.save();
      }
      seededActionPlans.push(plan);
      console.log(`[action-plan] Student ${item.studentId} -> Weak Skill: ${item.weakSkill}`);
    }

    // ─────────────────────────────────────────────
    // PART 13: COMPANIES
    // ─────────────────────────────────────────────
    console.log('\nSeeding Companies...');
    const companiesData = [
      {
        companyName: 'Tesla',
        requiredSkills: [
          'JavaScript',
          'Node.js',
          'System Design',
          'Databases',
        ],
        minimumMatchScore: 70,
      },
      {
        companyName: 'Reliance Industries',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        minimumMatchScore: 65,
      },
      {
        companyName: 'Microsoft',
        requiredSkills: [
          'DSA',
          'System Design',
          'Databases',
          'Operating Systems',
        ],
        minimumMatchScore: 75,
      },
    ];

    const companyMap = new Map();
    for (const item of companiesData) {
      const comp = await Company.findOneAndUpdate(
        { companyName: item.companyName },
        {
          $set: {
            companyName: item.companyName,
            requiredSkills: item.requiredSkills,
            minimumMatchScore: item.minimumMatchScore,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      companyMap.set(item.companyName, comp);
      console.log(`[company] ${comp.companyName} (Min Score: ${comp.minimumMatchScore})`);
    }

    // ─────────────────────────────────────────────
    // PART 14: RECRUITER FEEDBACK
    // ─────────────────────────────────────────────
    console.log('\nSeeding Recruiter Feedback...');
    const elonRecruiter = recruiterMap.get('elon@gmail.com');
    const mukeshRecruiter = recruiterMap.get('mukesh@gmail.com');

    const feedbackData = [
      {
        studentId: jayUser._id,
        recruiterId: elonRecruiter._id,
        comments:
          'Strong backend fundamentals and good understanding of APIs. Needs deeper system design practice.',
        rating: 8,
        date: subDays(4),
      },
      {
        studentId: tanishUser._id,
        recruiterId: elonRecruiter._id,
        comments:
          'Good technical foundation and communication. Should improve database optimization concepts.',
        rating: 8,
        date: subDays(3),
      },
      {
        studentId: preetUser._id,
        recruiterId: mukeshRecruiter._id,
        comments:
          'Good frontend skills and project exposure. Should strengthen JavaScript fundamentals.',
        rating: 7,
        date: subDays(2),
      },
      {
        studentId: jayUser._id,
        recruiterId: mukeshRecruiter._id,
        comments:
          'Shows strong backend potential and consistent goal progress.',
        rating: 9,
        date: subDays(1),
      },
    ];

    const seededFeedback = [];
    for (const item of feedbackData) {
      const fb = await RecruiterFeedback.findOneAndUpdate(
        {
          studentId: item.studentId,
          recruiterId: item.recruiterId,
          comments: item.comments,
        },
        {
          $set: {
            studentId: item.studentId,
            recruiterId: item.recruiterId,
            comments: item.comments,
            rating: item.rating,
            date: item.date,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededFeedback.push(fb);
      console.log(`[recruiter-feedback] Recruiter ${item.recruiterId} -> Student ${item.studentId}`);
    }

    // ─────────────────────────────────────────────
    // PART 15: DEPARTMENT EVENTS
    // ─────────────────────────────────────────────
    console.log('\nSeeding Department Events...');
    const eventsData = [
      {
        hodId: hodUser._id,
        title: 'System Design Workshop',
        targetSkill: 'System Design',
        date: addDays(7),
        time: '11:00 AM',
        venue: 'Seminar Hall A',
        description:
          'Intensive workshop on architectural scaling patterns, microservices, and load balancing.',
        eventType: 'Workshop',
      },
      {
        hodId: hodUser._id,
        title: 'Backend Development Bootcamp',
        targetSkill: 'Node.js',
        date: addDays(14),
        time: '02:00 PM',
        venue: 'Lab 3',
        description:
          'Hands-on session building resilient RESTful microservices and caching architectures.',
        eventType: 'Bootcamp',
      },
      {
        hodId: hodUser._id,
        title: 'Mock Placement Drive',
        targetSkill: 'Interview Preparation',
        date: addDays(21),
        time: '09:30 AM',
        venue: 'Auditorium',
        description:
          'Full-scale simulated campus placement drive featuring technical, HR, and coding evaluation rounds.',
        eventType: 'Placement Drive',
      },
    ];

    const seededEvents = [];
    for (const item of eventsData) {
      const evt = await DepartmentEvent.findOneAndUpdate(
        { hodId: item.hodId, title: item.title },
        {
          $set: {
            hodId: item.hodId,
            title: item.title,
            targetSkill: item.targetSkill,
            date: item.date,
            time: item.time,
            venue: item.venue,
            description: item.description,
            eventType: item.eventType,
            status: 'scheduled',
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      seededEvents.push(evt);
      console.log(`[department-event] ${evt.title} (${evt.date.toDateString()})`);
    }

    // ─────────────────────────────────────────────
    // PART 23: CONSOLE SUMMARY
    // ─────────────────────────────────────────────
    console.log('\n==================================================');
    console.log('COMPLETE DEMONSTRATION SEED SUMMARY');
    console.log('==================================================');
    console.log('Users:');
    console.log(`  Students: ${studentMap.size}`);
    console.log(`  Faculty: ${facultyMap.size}`);
    console.log(`  HOD: 1`);
    console.log(`  Alumni: ${alumniMap.size}`);
    console.log(`  Recruiters: ${recruiterMap.size}`);
    console.log(`  Total Users: ${studentMap.size + facultyMap.size + 1 + alumniMap.size + recruiterMap.size}`);
    console.log('--------------------------------------------------');
    console.log('Populated Models:');
    console.log(`  StudentProfiles: ${studentMap.size}`);
    console.log(`  FacultyProfiles: ${facultyMap.size + 1}`);
    console.log(`  AlumniProfiles: ${alumniMap.size}`);
    console.log(`  RecruiterProfiles: ${recruiterMap.size}`);
    console.log(`  CareerRoadmaps: ${roadmapMap.size}`);
    console.log(`  SemesterPlans: ${seededSemesterPlans.length}`);
    console.log(`  WeeklyGoals: ${seededGoals.length}`);
    console.log(`  GuidanceRequests: ${guidanceRequestMap.size}`);
    console.log(`  GuidanceReplies: ${seededReplies.length}`);
    console.log(`  ExperiencePosts: ${seededPosts.length}`);
    console.log(`  MockInterviews: ${interviewMap.size}`);
    console.log(`  EvaluationScores: ${seededEvaluationScores.length}`);
    console.log(`  ActionPlans: ${seededActionPlans.length}`);
    console.log(`  Companies: ${companyMap.size}`);
    console.log(`  RecruiterFeedback: ${seededFeedback.length}`);
    console.log(`  DepartmentEvents: ${seededEvents.length}`);
    console.log('==================================================\n');

    console.log('DEFAULT PASSWORD:\n' + DEFAULT_PASSWORD + '\n');

    console.log('STUDENT ACCOUNTS:');
    for (const item of studentData) {
      console.log(`  ${item.name} | Email: ${item.email} | Password: ${DEFAULT_PASSWORD}`);
    }

    console.log('\nFACULTY ACCOUNTS:');
    for (const item of facultyData) {
      console.log(`  ${item.name} | Email: ${item.email} | Password: ${DEFAULT_PASSWORD}`);
    }

    console.log('\nHOD ACCOUNT:');
    console.log(`  ${hodItem.name} | Email: ${hodItem.email} | Password: ${DEFAULT_PASSWORD} | Role: faculty | isHOD: true`);

    console.log('\nALUMNI ACCOUNTS:');
    for (const item of alumniData) {
      console.log(`  ${item.name} | Email: ${item.email} | Password: ${DEFAULT_PASSWORD}`);
    }

    console.log('\nRECRUITER ACCOUNTS:');
    for (const item of recruiterData) {
      console.log(`  ${item.name} | Email: ${item.email} | Password: ${DEFAULT_PASSWORD}`);
    }

    console.log('\n✅ Complete demonstration seed finished successfully!');
  } catch (error) {
    console.error('❌ Error during demonstration seeding:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
}

runSeed();
