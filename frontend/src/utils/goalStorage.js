/**
 * Utility to manage local enrichment for goals:
 * - progress percentages
 * - milestone tracking
 * - priority labels
 * - custom categories and descriptions
 * 
 * Synchronized with localStorage so changes persist across browser refreshes
 * while preserving full compatibility with the backend MongoDB schema.
 */

const STORAGE_KEY = 'grip_goals_enrichment_v1';

export const getEnrichmentMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load goal enrichment map:', err);
    return {};
  }
};

export const saveGoalEnrichment = (goalId, data) => {
  try {
    const current = getEnrichmentMap();
    current[goalId] = {
      ...(current[goalId] || {}),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save goal enrichment:', err);
  }
};

export const deleteGoalEnrichment = (goalId) => {
  try {
    const current = getEnrichmentMap();
    if (current[goalId]) {
      delete current[goalId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error('Failed to delete goal enrichment:', err);
  }
};

/**
 * Infer default category if not explicitly specified
 */
export const inferCategory = (goal) => {
  if (goal.category && goal.category !== 'general') {
    return goal.category;
  }
  const title = (goal.title || '').toLowerCase();
  if (goal.isRemedial || title.includes('remedial') || title.includes('action plan')) {
    return 'Remedial';
  }
  if (
    title.includes('react') ||
    title.includes('node') ||
    title.includes('api') ||
    title.includes('redis') ||
    title.includes('kafka') ||
    title.includes('docker') ||
    title.includes('kubernetes') ||
    title.includes('sql')
  ) {
    return 'Technical';
  }
  if (
    title.includes('leetcode') ||
    title.includes('algorithm') ||
    title.includes('tree') ||
    title.includes('graph') ||
    title.includes('certification')
  ) {
    return 'Skill Development';
  }
  if (title.includes('communication') || title.includes('interview') || title.includes('resume')) {
    return 'Career Prep';
  }
  return 'General';
};

/**
 * Infer priority from deadlines and urgency
 */
export const inferPriority = (goal, diffDays) => {
  if (goal.priority) return goal.priority;
  if (diffDays < 0 || diffDays <= 2 || goal.isRemedial) {
    return 'High';
  }
  if (diffDays <= 7) {
    return 'Medium';
  }
  return 'Low';
};

/**
 * Enrich raw goal record from backend with display-ready metadata
 */
export const enrichGoal = (goal) => {
  const enrichments = getEnrichmentMap();
  const extra = enrichments[goal.id] || {};

  const dueDate = goal.dueDate ? new Date(goal.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let diffDays = null;
  let deadlineInfo = { text: 'Flexible deadline', variant: 'neutral', isOverdue: false, isDueSoon: false };

  if (dueDate && !isNaN(dueDate.getTime())) {
    const dueDay = new Date(dueDate);
    dueDay.setHours(0, 0, 0, 0);
    diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (goal.status === 'completed') {
      deadlineInfo = {
        text: 'Completed',
        variant: 'success',
        isOverdue: false,
        isDueSoon: false,
      };
    } else if (diffDays < 0) {
      deadlineInfo = {
        text: `Overdue by ${Math.abs(diffDays)}d`,
        variant: 'danger',
        isOverdue: true,
        isDueSoon: false,
      };
    } else if (diffDays === 0) {
      deadlineInfo = {
        text: 'Due today',
        variant: 'warning',
        isOverdue: false,
        isDueSoon: true,
      };
    } else if (diffDays === 1) {
      deadlineInfo = {
        text: 'Due tomorrow',
        variant: 'warning',
        isOverdue: false,
        isDueSoon: true,
      };
    } else if (diffDays <= 7) {
      deadlineInfo = {
        text: `${diffDays} days left`,
        variant: 'info',
        isOverdue: false,
        isDueSoon: true,
      };
    } else {
      deadlineInfo = {
        text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        variant: 'neutral',
        isOverdue: false,
        isDueSoon: false,
      };
    }
  }

  // Determine progress %
  let progress = extra.progress;
  if (typeof progress !== 'number') {
    if (goal.status === 'completed') progress = 100;
    else if (goal.status === 'in-progress') progress = 60;
    else progress = 0;
  }
  if (goal.status === 'completed') {
    progress = 100;
  }

  // Category
  const category = extra.category || inferCategory(goal);

  // Priority
  const priority = extra.priority || inferPriority(goal, diffDays);

  // Milestones
  let milestones = extra.milestones;
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    if (extra.initialMilestone) {
      milestones = [
        { id: 1, title: extra.initialMilestone, completed: progress > 50 },
        { id: 2, title: 'Finalize & Review', completed: progress === 100 },
      ];
    } else {
      milestones = [
        { id: 1, title: 'Curriculum & resource setup', completed: progress >= 30 },
        { id: 2, title: 'Core implementation & tests', completed: progress >= 75 },
        { id: 3, title: 'Final milestone verification', completed: progress === 100 },
      ];
    }
  }

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const nextMilestone = milestones.find((m) => !m.completed) || milestones[milestones.length - 1];

  return {
    ...goal,
    cleanTitle: (goal.title || 'Untitled Goal').replace(/^\[Action Plan: Mock Remedial\]\s*/i, ''),
    category,
    priority,
    progress,
    diffDays,
    deadlineInfo,
    milestones,
    completedMilestonesCount: completedMilestones,
    totalMilestonesCount: milestones.length,
    nextAction: nextMilestone ? nextMilestone.title : 'Complete goal milestone',
    description: extra.description || goal.description || '',
  };
};
