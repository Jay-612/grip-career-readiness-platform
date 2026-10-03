import mongoose from 'mongoose';
import ActionPlan from '../model/ActionPlan.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import { calculateStudentReadiness } from './readinessService.js';

/**
 * Domain benchmark threshold: < 7/10 is considered a deficit requiring remedial intervention
 * (Based on SRS Section R.4.5 & Lab-3 Sequence & Activity Diagrams)
 */
export const REMEDIAL_THRESHOLD = 7;

/**
 * Targeted advice templates and remedial goal mappings for each evaluation domain
 */
export const ADVICE_TEMPLATES = {
  technical: {
    domainName: 'Technical Knowledge & Problem Solving',
    weakSkill: 'Data Structures, Algorithms & System Architecture',
    taskTitle: 'Master Core Data Structures & Dynamic Programming',
    description:
      'Complete 10 LeetCode Medium problems on dynamic programming, graph traversals, and trees. Review Big-O space/time complexity and modular microservice boundaries.',
    goalTitle: '[Action Plan: Mock Remedial] Master Core Data Structures & Dynamic Programming',
    domain: 'technical',
    category: 'technical',
    priority: 'high',
    durationDays: 7,
    estimatedHours: 8,
  },
  communication: {
    domainName: 'STAR Communication & Behavioral Structuring',
    weakSkill: 'STAR Behavioral Framework & Technical Articulation',
    taskTitle: 'Practice STAR Framework Articulation & Project Delivery',
    description:
      'Structure past project experiences into the STAR format (Situation, Task, Action, Result). Practice 5 mock behavioral responses articulating measurable technical impact.',
    goalTitle: '[Action Plan: Mock Remedial] Practice STAR Framework Articulation & Project Delivery',
    domain: 'communication',
    category: 'communication',
    priority: 'high',
    durationDays: 7,
    estimatedHours: 5,
  },
  confidence: {
    domainName: 'Interview Poise & Pressure Composure',
    weakSkill: 'Interview Composure & Poise Under Pressure',
    taskTitle: 'Timed Mock Pressure Simulations & Composure Practice',
    description:
      'Conduct 2 timed mock interview dry-runs. Practice think-aloud debugging, deliberate pauses before responding, and receptive critique handling.',
    goalTitle: '[Action Plan: Mock Remedial] Timed Mock Pressure Simulations & Composure Practice',
    domain: 'confidence',
    category: 'confidence',
    priority: 'high',
    durationDays: 7,
    estimatedHours: 4,
  },
};

/**
 * Analyzes domain scores against the < 7/10 threshold and matches targeted advice templates.
 * @param {Object} scores - { technical, communication, confidence }
 * @returns {Object} Analysis with weakSkills, recommendedTasks, domainScores, and needsRemedial flag
 */
export const analyzeDomainScores = (scores = {}) => {
  const technical = Number(scores.technical ?? scores.technicalScore ?? 0);
  const communication = Number(scores.communication ?? scores.communicationScore ?? 0);
  const confidence = Number(scores.confidence ?? scores.confidenceScore ?? 0);

  const domainScores = {
    technical: isNaN(technical) ? 0 : Math.min(10, Math.max(0, technical)),
    communication: isNaN(communication) ? 0 : Math.min(10, Math.max(0, communication)),
    confidence: isNaN(confidence) ? 0 : Math.min(10, Math.max(0, confidence)),
  };

  const weakSkills = [];
  const recommendedTasks = [];

  // 1. Evaluate Technical domain (< 7)
  if (domainScores.technical < REMEDIAL_THRESHOLD) {
    const tpl = ADVICE_TEMPLATES.technical;
    weakSkills.push(tpl.weakSkill);
    recommendedTasks.push({
      title: tpl.taskTitle,
      category: tpl.category,
      estimatedHours: tpl.estimatedHours,
      targetDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      task: tpl.description,
      domain: tpl.domain,
      priority: tpl.priority,
      dueDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      goalTitle: tpl.goalTitle,
      weakSkill: tpl.weakSkill,
    });
  }

  // 2. Evaluate Communication domain (< 7)
  if (domainScores.communication < REMEDIAL_THRESHOLD) {
    const tpl = ADVICE_TEMPLATES.communication;
    weakSkills.push(tpl.weakSkill);
    recommendedTasks.push({
      title: tpl.taskTitle,
      category: tpl.category,
      estimatedHours: tpl.estimatedHours,
      targetDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      task: tpl.description,
      domain: tpl.domain,
      priority: tpl.priority,
      dueDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      goalTitle: tpl.goalTitle,
      weakSkill: tpl.weakSkill,
    });
  }

  // 3. Evaluate Confidence domain (< 7)
  if (domainScores.confidence < REMEDIAL_THRESHOLD) {
    const tpl = ADVICE_TEMPLATES.confidence;
    weakSkills.push(tpl.weakSkill);
    recommendedTasks.push({
      title: tpl.taskTitle,
      category: tpl.category,
      estimatedHours: tpl.estimatedHours,
      targetDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      task: tpl.description,
      domain: tpl.domain,
      priority: tpl.priority,
      dueDate: new Date(Date.now() + tpl.durationDays * 24 * 60 * 60 * 1000),
      goalTitle: tpl.goalTitle,
      weakSkill: tpl.weakSkill,
    });
  }

  const needsRemedial = weakSkills.length > 0;

  return {
    domainScores,
    weakSkills,
    recommendedTasks,
    tasks: recommendedTasks,
    needsRemedial,
    threshold: REMEDIAL_THRESHOLD,
    benchmarkPassed: !needsRemedial,
  };
};

/**
 * Generates an in-memory preview of the Action Plan without persisting to the database.
 * Useful for the Faculty evaluation interface real-time preview and custom editing.
 */
export const previewActionPlan = ({ scores = {}, notes = {}, tasks = [] } = {}) => {
  const analysis = analyzeDomainScores(scores);
  const facultyFeedback = notes.facultyFeedback || notes.overallSynthesis || notes.notes || '';

  const resolvedTasks =
    Array.isArray(tasks) && tasks.length > 0
      ? tasks.map((t) => ({
          title: t.title || t.task || 'Action Plan Task',
          category: t.category || t.domain || 'technical',
          estimatedHours: Number(t.estimatedHours) || 5,
          targetDate: t.targetDate || t.dueDate || new Date(Date.now() + 7 * 86400000),
          task: t.task || t.description || t.title,
          domain: t.domain || t.category || 'technical',
          priority: t.priority || 'high',
          goalTitle: t.goalTitle || (t.title?.startsWith('[Action Plan: Mock Remedial]') ? t.title : `[Action Plan: Mock Remedial] ${t.title || 'Task'}`),
        }))
      : analysis.recommendedTasks;

  const needsRemedial = resolvedTasks.length > 0;

  return {
    ...analysis,
    tasks: resolvedTasks,
    recommendedTasks: resolvedTasks,
    facultyFeedback,
    evaluatorNotes: facultyFeedback,
    status: needsRemedial ? 'assigned' : 'completed',
    summaryMessage: needsRemedial
      ? `Action Plan required: ${resolvedTasks.length} remedial task(s) scheduled for dispatch.`
      : `Benchmark cleared: All domain scores meet or exceed ${REMEDIAL_THRESHOLD}/10. Student is placement-ready.`,
  };
};

/**
 * Creates an Action Plan document and automatically inserts each task into WeeklyGoal collection.
 * Captures assignedGoalId on the ActionPlan task subdocument and links evaluatorId and interviewId.
 * (Based on SRS Section R.4.5 & Lab-3 Sequence & Activity Diagrams)
 *
 * @param {Object} params
 * @param {string|ObjectId} params.studentId - User ID of the student
 * @param {string|ObjectId} [params.interviewId] - Mock interview appointment ID
 * @param {string|ObjectId} [params.evaluatorId] - User ID of faculty evaluator
 * @param {Object} params.scores - { technical, communication, confidence }
 * @param {Object} [params.notes] - Evaluator written feedback notes
 * @param {Array} [params.tasks] - Custom/edited tasks inputted by faculty
 * @param {string} [params.facultyFeedback] - Specific faculty overall synthesis
 * @returns {Promise<{ actionPlan: Object, assignedGoals: Array }>}
 */
export const createAndAssignActionPlan = async ({
  studentId,
  interviewId,
  evaluatorId,
  scores = {},
  notes = {},
  tasks = [],
  facultyFeedback,
}) => {
  if (!studentId) {
    throw new Error('studentId is required to generate an action plan');
  }

  // 1. Analyze domain scores against < 7 threshold
  const analysis = analyzeDomainScores(scores);
  const facultyFeedbackText =
    facultyFeedback ||
    notes.facultyFeedback ||
    notes.overallSynthesis ||
    [notes.technicalNotes, notes.communicationNotes, notes.confidenceNotes]
      .filter(Boolean)
      .join(' | ') ||
    '';

  // 2. Determine tasks to assign: faculty-inputted custom tasks or smart suggestions
  let tasksToAssign = [];
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasksToAssign = tasks.map((t) => {
      const cleanTitle = (t.title || t.task || 'Remedial Task').trim();
      const goalTitle =
        t.goalTitle ||
        (cleanTitle.startsWith('[Action Plan: Mock Remedial]')
          ? cleanTitle
          : `[Action Plan: Mock Remedial] ${cleanTitle}`);

      const targetDate = t.targetDate
        ? new Date(t.targetDate)
        : t.dueDate
        ? new Date(t.dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return {
        title: cleanTitle,
        category: (t.category || t.domain || 'technical').toLowerCase(),
        estimatedHours: Number(t.estimatedHours) || 5,
        targetDate,
        assignedGoalId: null,
        task: t.task || t.description || cleanTitle,
        domain: t.domain || t.category || 'technical',
        priority: t.priority || 'high',
        dueDate: targetDate,
        goalTitle,
      };
    });
  } else {
    // Default smart suggestions from domain deficit analysis
    tasksToAssign = [...analysis.recommendedTasks];
  }

  // Determine weak skills list
  let weakSkills = [...analysis.weakSkills];
  if (weakSkills.length === 0 && tasksToAssign.length > 0) {
    // Derive from custom task categories or titles
    const categories = [...new Set(tasksToAssign.map((t) => t.category || t.domain))];
    weakSkills = categories.map((c) => `${c.charAt(0).toUpperCase() + c.slice(1)} Competency Refinement`);
  }

  const hasTasks = tasksToAssign.length > 0;
  const planStatus = hasTasks ? 'assigned' : 'completed';

  // 3. Upsert or create ActionPlan record
  let actionPlan;
  const planData = {
    studentId,
    interviewId: interviewId || null,
    evaluatorId: evaluatorId || null,
    domainScores: analysis.domainScores,
    weakSkills,
    tasks: tasksToAssign,
    recommendedTasks: tasksToAssign,
    facultyFeedback: facultyFeedbackText,
    evaluatorNotes: facultyFeedbackText,
    weakSkill: weakSkills.length > 0 ? weakSkills.join(', ') : 'None (Placement Ready)',
    recommendedTask:
      tasksToAssign.length > 0
        ? tasksToAssign.map((t) => t.title || t.task).join('; ')
        : 'Institutional benchmark cleared (>= 7/10). No remedial intervention required.',
    status: planStatus,
  };

  if (interviewId) {
    actionPlan = await ActionPlan.findOneAndUpdate(
      { interviewId },
      { $set: planData },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
  } else {
    actionPlan = await ActionPlan.create(planData);
  }

  // 4. Automatically insert each task into WeeklyGoal collection for the student
  const assignedGoals = [];
  if (hasTasks) {
    let tasksUpdated = false;

    for (let i = 0; i < actionPlan.tasks.length; i++) {
      const task = actionPlan.tasks[i];
      const goalTitle = task.goalTitle || `[Action Plan: Mock Remedial] ${task.title}`;

      // Check if goal was already created for this action plan & task
      let goal = null;
      if (task.assignedGoalId) {
        goal = await WeeklyGoal.findById(task.assignedGoalId);
      }

      if (!goal) {
        goal = await WeeklyGoal.create({
          studentId,
          title: goalTitle,
          status: 'pending',
          dueDate: task.targetDate || task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          category: ['technical', 'communication', 'confidence', 'remedial'].includes(task.category)
            ? task.category
            : 'remedial',
          isRemedial: true,
          source: 'action_plan',
          assignedBy: evaluatorId || null,
          interviewId: interviewId || null,
          actionPlanId: actionPlan._id,
        });

        // Link back to action plan task
        task.assignedGoalId = goal._id;
        tasksUpdated = true;
      }

      assignedGoals.push(goal);
    }

    if (tasksUpdated) {
      actionPlan.recommendedTasks = [...actionPlan.tasks];
      await actionPlan.save();
    }

    // Trigger async readiness score recalculation
    calculateStudentReadiness(studentId).catch((err) =>
      console.error('Async readiness update failed after remedial goal assignment:', err.message)
    );
  }

  return {
    actionPlan,
    assignedGoals,
  };
};

/**
 * Get all action plans for a specific student, sorted newest first
 */
export const getActionPlansByStudent = async (studentId) => {
  return ActionPlan.find({ studentId })
    .populate('evaluatorId', 'name email role')
    .sort({ createdAt: -1 });
};

/**
 * Get the action plan associated with a specific mock interview
 */
export const getActionPlanByInterview = async (interviewId) => {
  return ActionPlan.findOne({ interviewId }).populate('evaluatorId', 'name email role');
};

/**
 * Get a single action plan by its ID
 */
export const getActionPlanById = async (actionPlanId) => {
  return ActionPlan.findById(actionPlanId).populate('evaluatorId', 'name email role');
};

export default {
  REMEDIAL_THRESHOLD,
  ADVICE_TEMPLATES,
  analyzeDomainScores,
  previewActionPlan,
  createAndAssignActionPlan,
  getActionPlansByStudent,
  getActionPlanByInterview,
  getActionPlanById,
};
