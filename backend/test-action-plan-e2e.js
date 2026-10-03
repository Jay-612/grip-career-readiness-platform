import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

import mongoose from 'mongoose';
import User from './model/User.js';
import MockInterview from './model/MockInterview.js';
import EvaluationScore from './model/EvaluationScore.js';
import ActionPlan from './model/ActionPlan.js';
import WeeklyGoal from './model/WeeklyGoal.js';

// Import service & controllers to test
import {
  analyzeDomainScores,
  previewActionPlan,
  createAndAssignActionPlan,
  REMEDIAL_THRESHOLD,
} from './services/actionPlanService.js';

import { saveEvaluationScore } from './controllers/evaluationController.js';
import { updateGoalStatus } from './controllers/goalController.js';

import {
  getActionPlanPreview,
  getStudentActionPlans,
  getInterviewActionPlan,
  updateActionPlanStatus,
} from './controllers/actionPlanController.js';

import {
  getInterviewAnalysis,
  getGoalsAnalysis,
  getProgressDashboard,
} from './controllers/progressController.js';

// Helper mock req/res creator
function createMockReqRes(user, body = {}, params = {}, query = {}) {
  const req = {
    user: {
      id: user._id,
      _id: user._id,
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

async function runActionPlanE2ETests() {
  console.log('================================================================');
  console.log('🚀 Starting Automated Action Plan E2E Suite (SRS R.4.5 & Lab-3)');
  console.log('================================================================');

  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grip_db';
  await mongoose.connect(mongoURI);
  console.log(' Connected to MongoDB:', mongoose.connection.name);

  const cleanupIds = [];

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Domain Deficit Analysis Algorithm (< 7/10 Threshold)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 1: Domain Deficit Analysis (< 7/10 Threshold) ---');
    const lowScores = { technical: 5, communication: 6, confidence: 8 };
    const analysis = analyzeDomainScores(lowScores);

    console.log('   Input scores:', lowScores);
    console.log('   Needs remedial:', analysis.needsRemedial);
    console.log('   Identified weak skills:', analysis.weakSkills);
    console.log('   Recommended tasks count:', analysis.recommendedTasks.length);

    if (!analysis.needsRemedial) {
      throw new Error('Analysis should flag needsRemedial=true when scores are < 7');
    }
    if (analysis.weakSkills.length !== 2) {
      throw new Error(`Expected 2 weak skills for tech (5) and comm (6), got ${analysis.weakSkills.length}`);
    }
    if (analysis.recommendedTasks.length !== 2) {
      throw new Error(`Expected 2 recommended tasks, got ${analysis.recommendedTasks.length}`);
    }
    if (!analysis.recommendedTasks[0].goalTitle.includes('[Action Plan: Mock Remedial]')) {
      throw new Error('Recommended task goalTitle must contain [Action Plan: Mock Remedial]');
    }

    // Benchmark passed scenario (all >= 7)
    const highScores = { technical: 9, communication: 8, confidence: 9 };
    const highAnalysis = analyzeDomainScores(highScores);
    console.log('   High scores needs remedial:', highAnalysis.needsRemedial);
    if (highAnalysis.needsRemedial !== false || highAnalysis.weakSkills.length !== 0) {
      throw new Error('Expected needsRemedial=false and empty weakSkills for scores >= 7');
    }
    console.log('✅ TEST 1 PASSED: Domain deficit analysis strictly respects < 7 threshold.');

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Action Plan Preview API (POST /api/action-plans/preview)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Action Plan Preview API with Custom Tasks ---');
    let faculty = await User.findOne({ role: 'faculty' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Action Plan Tester',
        email: 'action_plan_faculty_test@campus.edu',
        password: 'Password123!',
        role: 'faculty',
      });
      cleanupIds.push({ model: User, id: faculty._id });
    }

    const { req: prevReq, res: prevRes } = createMockReqRes(faculty, {
      scores: { technical: 4, communication: 5, confidence: 6 },
      notes: { overallSynthesis: 'Needs foundational revision before recruitment drives.' },
    });

    await getActionPlanPreview(prevReq, prevRes);
    const prevData = prevRes.getData();

    console.log('   Preview HTTP Code:', prevRes.getStatusCode());
    console.log('   Preview Weak Skills Count:', prevData?.preview?.weakSkills?.length);
    console.log('   Preview Summary Message:', prevData?.preview?.summaryMessage);

    if (prevRes.getStatusCode() !== 200 || !prevData?.success) {
      throw new Error(`Preview API failed: ${JSON.stringify(prevData)}`);
    }
    if (prevData?.preview?.weakSkills?.length !== 3) {
      throw new Error(`Expected all 3 domains flagged when all < 7, got ${prevData?.preview?.weakSkills?.length}`);
    }
    console.log('✅ TEST 2 PASSED: Real-time action plan preview generated successfully.');

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Setup Test Student & Mock Interview Appointment
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Setup Student & Mock Interview Appointment ---');
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'Action Plan Candidate',
        email: 'action_plan_student_test@campus.edu',
        password: 'Password123!',
        role: 'student',
      });
      cleanupIds.push({ model: User, id: student._id });
    }

    const interview = await MockInterview.create({
      studentId: student._id,
      interviewerId: faculty._id,
      dateTime: new Date(),
      status: 'scheduled',
      duration: 45,
    });
    cleanupIds.push({ model: MockInterview, id: interview._id });
    console.log('   Created scheduled mock interview ID:', interview._id);
    console.log('✅ TEST 3 PASSED: Appointment established.');

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Faculty-Inputted Custom Action Plan & Automated Dispatch
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Faculty-Inputted Action Plan & Automated WeeklyGoal Dispatch ---');
    const customFacultyTasks = [
      {
        title: 'Master Raft Consensus State Machine in Go',
        category: 'technical',
        estimatedHours: 12,
        targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        task: 'Build a 3-node distributed consensus state machine with heartbeat timeouts.',
      },
      {
        title: 'Deliver 5 High-Impact STAR Behavioral Responses',
        category: 'communication',
        estimatedHours: 6,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        task: 'Record video responses addressing team conflict resolution and trade-offs.',
      },
    ];

    const facultyFeedbackText = 'Strong core technical foundations, but needs targeted practice on distributed log replication and concise STAR behavioral articulation.';

    const { req: evalReq, res: evalRes } = createMockReqRes(faculty, {
      interviewId: interview._id,
      technicalScore: 6,
      communicationScore: 6,
      confidenceScore: 8,
      technicalNotes: 'Good API design; struggled on Raft leader partition recovery.',
      communicationNotes: 'Responses meandered past 3 minutes without clear STAR metrics.',
      overallSynthesis: facultyFeedbackText,
      facultyFeedback: facultyFeedbackText,
      actionPlanTasks: customFacultyTasks,
    });

    await saveEvaluationScore(evalReq, evalRes);
    const evalData = evalRes.getData();

    console.log('   Evaluation HTTP Code:', evalRes.getStatusCode());
    console.log('   Response Success:', evalData?.success);
    console.log('   Action Plan Generated:', Boolean(evalData?.actionPlan));
    console.log('   Assigned Goals Count:', evalData?.assignedGoals?.length);

    if (evalRes.getStatusCode() !== 201 || !evalData?.success) {
      throw new Error(`Evaluation submission failed: ${JSON.stringify(evalData)}`);
    }
    if (!evalData?.actionPlan) {
      throw new Error('Response must include actionPlan object');
    }
    if (!Array.isArray(evalData?.assignedGoals) || evalData.assignedGoals.length !== 2) {
      throw new Error(`Expected 2 assigned remedial goals, got ${evalData?.assignedGoals?.length}`);
    }

    // Verify ActionPlan in MongoDB (studentId, interviewId, evaluatorId, tasks, facultyFeedback)
    const savedPlan = await ActionPlan.findById(evalData.actionPlan._id);
    if (!savedPlan) {
      throw new Error('ActionPlan document not found in MongoDB');
    }
    cleanupIds.push({ model: ActionPlan, id: savedPlan._id });

    console.log('   MongoDB ActionPlan studentId:', savedPlan.studentId);
    console.log('   MongoDB ActionPlan evaluatorId:', savedPlan.evaluatorId);
    console.log('   MongoDB ActionPlan tasks count:', savedPlan.tasks.length);
    console.log('   MongoDB ActionPlan facultyFeedback:', savedPlan.facultyFeedback);
    console.log('   MongoDB ActionPlan status:', savedPlan.status);

    if (savedPlan.studentId.toString() !== student._id.toString()) {
      throw new Error('ActionPlan studentId mismatch');
    }
    if (savedPlan.evaluatorId.toString() !== faculty._id.toString()) {
      throw new Error('ActionPlan evaluatorId mismatch');
    }
    if (savedPlan.interviewId.toString() !== interview._id.toString()) {
      throw new Error('ActionPlan interviewId mismatch');
    }
    if (savedPlan.tasks.length !== 2) {
      throw new Error(`Expected 2 tasks on ActionPlan, found ${savedPlan.tasks.length}`);
    }
    if (savedPlan.facultyFeedback !== facultyFeedbackText) {
      throw new Error('ActionPlan facultyFeedback mismatch');
    }
    if (savedPlan.status !== 'assigned') {
      throw new Error(`Expected status 'assigned', got '${savedPlan.status}'`);
    }

    // Verify WeeklyGoal records in MongoDB with assignedGoalId linkage, source, assignedBy, interviewId
    for (let i = 0; i < savedPlan.tasks.length; i++) {
      const task = savedPlan.tasks[i];
      if (!task.assignedGoalId) {
        throw new Error(`Task #${i + 1} is missing assignedGoalId`);
      }

      const goal = await WeeklyGoal.findById(task.assignedGoalId);
      if (!goal) {
        throw new Error(`Linked WeeklyGoal with ID ${task.assignedGoalId} not found in DB`);
      }
      cleanupIds.push({ model: WeeklyGoal, id: goal._id });

      console.log(`     - Task #${i + 1}: "${task.title}" -> WeeklyGoal ID: ${goal._id}`);
      console.log(`       Source: "${goal.source}", AssignedBy: ${goal.assignedBy}, InterviewId: ${goal.interviewId}, isRemedial: ${goal.isRemedial}`);

      if (goal.source !== 'action_plan') {
        throw new Error(`Expected WeeklyGoal source to be 'action_plan', got '${goal.source}'`);
      }
      if (!goal.isRemedial) {
        throw new Error('Expected WeeklyGoal isRemedial to be true');
      }
      if (goal.assignedBy.toString() !== faculty._id.toString()) {
        throw new Error(`Expected WeeklyGoal assignedBy to be ${faculty._id}, got ${goal.assignedBy}`);
      }
      if (goal.interviewId.toString() !== interview._id.toString()) {
        throw new Error(`Expected WeeklyGoal interviewId to be ${interview._id}, got ${goal.interviewId}`);
      }
      if (goal.actionPlanId.toString() !== savedPlan._id.toString()) {
        throw new Error(`Expected WeeklyGoal actionPlanId to be ${savedPlan._id}`);
      }
    }
    console.log('✅ TEST 4 PASSED: Faculty action plan and automated WeeklyGoal linkage verified.');

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Student Goal Completion Flow (PUT /api/goals/:goalId)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 5: Student Completes an Assigned Action Plan Goal ---');
    const firstGoalId = savedPlan.tasks[0].assignedGoalId;
    const { req: completeReq, res: completeRes } = createMockReqRes(
      student,
      { status: 'completed' },
      { goalId: firstGoalId }
    );

    await updateGoalStatus(completeReq, completeRes);
    const completeData = completeRes.getData();

    console.log('   Goal Completion HTTP Code:', completeRes.getStatusCode());
    console.log('   Updated Goal Status:', completeData?.goal?.status);

    if (completeRes.getStatusCode() !== 200 || completeData?.goal?.status !== 'completed') {
      throw new Error('Failed to update assigned action plan goal to completed');
    }

    const updatedGoal = await WeeklyGoal.findById(firstGoalId);
    if (updatedGoal.status !== 'completed') {
      throw new Error('WeeklyGoal record did not persist status completed in MongoDB');
    }
    console.log('✅ TEST 5 PASSED: Student successfully marked assigned action plan goal as completed.');

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Student Action Plans API with Mentor Attribution Populated
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 6: Student Action Plans Retrieval & Mentor Attribution ---');
    const { req: studentPlanReq, res: studentPlanRes } = createMockReqRes(student, {}, { studentId: student._id });
    await getStudentActionPlans(studentPlanReq, studentPlanRes);
    const studentPlanData = studentPlanRes.getData();

    console.log('   Student API HTTP Code:', studentPlanRes.getStatusCode());
    console.log('   Action Plans Count:', studentPlanData?.actionPlans?.length);
    console.log('   Remedial Goals Count:', studentPlanData?.remedialGoals?.length);

    if (studentPlanRes.getStatusCode() !== 200 || !studentPlanData?.success) {
      throw new Error(`Student Action Plans API failed: ${JSON.stringify(studentPlanData)}`);
    }

    const returnedPlan = studentPlanData.actionPlans[0];
    console.log('   Evaluator Populated Name:', returnedPlan?.evaluatorId?.name);
    if (!returnedPlan?.evaluatorId?.name) {
      throw new Error('ActionPlan evaluatorId should be populated with faculty name');
    }

    const returnedGoal = studentPlanData.remedialGoals[0];
    console.log('   Goal AssignedBy Populated Name:', returnedGoal?.assignedBy?.name);
    if (!returnedGoal?.assignedBy?.name) {
      throw new Error('WeeklyGoal assignedBy should be populated with faculty name');
    }
    console.log('✅ TEST 6 PASSED: Student action plan retrieval verified with mentor attribution.');

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Goals Analysis & Progress Aggregation Integration
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 7: Goals Analysis Aggregation ---');
    const { req: goalsAnalysisReq, res: goalsAnalysisRes } = createMockReqRes(student, {}, { studentId: student._id });
    await getGoalsAnalysis(goalsAnalysisReq, goalsAnalysisRes);
    const goalsAnalysisData = goalsAnalysisRes.getData();

    const remedialGoalItem = goalsAnalysisData?.goals?.find((g) => g.source === 'action_plan');
    console.log('   Found action_plan goal in Goals Analysis:', Boolean(remedialGoalItem));
    console.log('   Goal assignedBy attribute:', remedialGoalItem?.assignedBy?.name || remedialGoalItem?.assignedBy);

    if (!remedialGoalItem) {
      throw new Error('Goals analysis must expose source: "action_plan"');
    }
    console.log('✅ TEST 7 PASSED: Goals analysis exposes action plan goals and attribution.');

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Evaluation with Benchmark Cleared (Scores >= 7)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 8: High Score Evaluation (>= 7/10 Benchmark Passed) ---');
    const interview2 = await MockInterview.create({
      studentId: student._id,
      interviewerId: faculty._id,
      dateTime: new Date(),
      status: 'scheduled',
      duration: 45,
    });
    cleanupIds.push({ model: MockInterview, id: interview2._id });

    const { req: evalHighReq, res: evalHighRes } = createMockReqRes(faculty, {
      interviewId: interview2._id,
      technicalScore: 9,
      communicationScore: 8,
      confidenceScore: 9,
      overallSynthesis: 'Super-Dream Tier 1 Placement Ready across all dimensions.',
    });

    await saveEvaluationScore(evalHighReq, evalHighRes);
    const evalHighData = evalHighRes.getData();

    console.log('   Benchmark Passed Success:', evalHighData?.success);
    console.log('   Benchmark Passed ActionPlan Status:', evalHighData?.actionPlan?.status);
    console.log('   Benchmark Passed Assigned Goals Count:', evalHighData?.assignedGoals?.length);

    if (evalHighData?.assignedGoals?.length !== 0) {
      throw new Error('Students clearing all domain benchmarks (>= 7) must not be assigned remedial goals');
    }
    if (evalHighData?.actionPlan?.status !== 'completed') {
      throw new Error(`Expected completed status for high scorer action plan, got ${evalHighData?.actionPlan?.status}`);
    }
    cleanupIds.push({ model: ActionPlan, id: evalHighData.actionPlan._id });
    console.log('✅ TEST 8 PASSED: Benchmark-clearing evaluation verified with 0 remedial goals.');

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Action Plan Status Transition (PATCH /api/action-plans/:id/status)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 9: Action Plan Status Transition ---');
    const { req: patchReq, res: patchRes } = createMockReqRes(
      student,
      { status: 'in-progress' },
      { id: savedPlan._id }
    );
    await updateActionPlanStatus(patchReq, patchRes);
    const patchData = patchRes.getData();

    console.log('   PATCH status code:', patchRes.getStatusCode());
    console.log('   Updated Action Plan Status:', patchData?.actionPlan?.status);

    if (patchRes.getStatusCode() !== 200 || patchData?.actionPlan?.status !== 'in-progress') {
      throw new Error('Failed to update action plan status to in-progress');
    }
    console.log('✅ TEST 9 PASSED: Status transition verified.');

    console.log('\n================================================================');
    console.log('🎉 ALL 9 FACULTY ACTION PLAN E2E TESTS PASSED CLEANLY! 🎉');
    console.log('================================================================');
  } finally {
    // Wait briefly for background promises
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Cleanup artifacts created in test
    console.log('\nCleaning up test artifacts...');
    for (const item of cleanupIds) {
      try {
        await item.model.findByIdAndDelete(item.id);
      } catch (err) {
        // ignore
      }
    }
    await EvaluationScore.deleteMany({
      interviewId: { $in: cleanupIds.map((c) => c.id) },
    });
    await ActionPlan.deleteMany({
      _id: { $in: cleanupIds.map((c) => c.id) },
    });
    await WeeklyGoal.deleteMany({
      _id: { $in: cleanupIds.map((c) => c.id) },
    });
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runActionPlanE2ETests().catch((err) => {
  console.error('\n❌ Action Plan E2E Suite Error:', err);
  process.exit(1);
});
