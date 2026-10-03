import mongoose from 'mongoose';

const actionPlanTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'technical',
    },
    estimatedHours: {
      type: Number,
      default: 5,
    },
    targetDate: {
      type: Date,
    },
    assignedGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyGoal',
      default: null,
    },
    // Backwards-compatible legacy properties
    task: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'high',
    },
    dueDate: {
      type: Date,
    },
    goalTitle: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const actionPlanSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterview',
      index: true,
      default: null,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    domainScores: {
      technical: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      communication: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
    },
    tasks: {
      type: [actionPlanTaskSchema],
      default: [],
    },
    facultyFeedback: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['generated', 'assigned', 'in-progress', 'completed'],
      default: 'assigned',
      index: true,
    },
    // Backwards-compatible legacy fields
    weakSkills: {
      type: [String],
      default: [],
    },
    recommendedTasks: {
      type: [actionPlanTaskSchema],
      default: [],
    },
    weakSkill: {
      type: String,
      default: '',
    },
    recommendedTask: {
      type: String,
      default: '',
    },
    evaluatorNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook to ensure backwards compatibility with existing aggregation queries
actionPlanSchema.pre('save', function () {
  // Sync tasks <-> recommendedTasks
  if ((!this.tasks || this.tasks.length === 0) && this.recommendedTasks && this.recommendedTasks.length > 0) {
    this.tasks = this.recommendedTasks.map((t) => ({
      title: t.title || t.task || 'Remedial Task',
      category: t.category || t.domain || 'technical',
      estimatedHours: t.estimatedHours || 5,
      targetDate: t.targetDate || t.dueDate || new Date(Date.now() + 7 * 86400000),
      assignedGoalId: t.assignedGoalId || null,
      task: t.task || t.title,
      domain: t.domain || t.category,
      priority: t.priority || 'high',
      dueDate: t.dueDate || t.targetDate,
      goalTitle: t.goalTitle || t.title,
    }));
  } else if ((!this.recommendedTasks || this.recommendedTasks.length === 0) && this.tasks && this.tasks.length > 0) {
    this.recommendedTasks = this.tasks.map((t) => ({
      title: t.title,
      category: t.category,
      estimatedHours: t.estimatedHours,
      targetDate: t.targetDate,
      assignedGoalId: t.assignedGoalId,
      task: t.task || t.title,
      domain: t.domain || t.category,
      priority: t.priority || 'high',
      dueDate: t.dueDate || t.targetDate,
      goalTitle: t.goalTitle || t.title,
    }));
  }

  // Sync facultyFeedback <-> evaluatorNotes
  if (!this.facultyFeedback && this.evaluatorNotes) {
    this.facultyFeedback = this.evaluatorNotes;
  } else if (this.facultyFeedback && !this.evaluatorNotes) {
    this.evaluatorNotes = this.facultyFeedback;
  }

  // Sync weakSkill from weakSkills
  if (!this.weakSkill && Array.isArray(this.weakSkills) && this.weakSkills.length > 0) {
    this.weakSkill = this.weakSkills.join(', ');
  } else if (this.weakSkill && (!this.weakSkills || this.weakSkills.length === 0)) {
    this.weakSkills = [this.weakSkill];
  }

  // Sync recommendedTask from tasks
  if (!this.recommendedTask && Array.isArray(this.tasks) && this.tasks.length > 0) {
    this.recommendedTask = this.tasks.map((t) => t.title || t.task).join('; ');
  } else if (this.recommendedTask && (!this.tasks || this.tasks.length === 0)) {
    this.tasks = [
      {
        title: this.recommendedTask,
        category: 'general',
        estimatedHours: 5,
        targetDate: new Date(Date.now() + 7 * 86400000),
        task: this.recommendedTask,
        domain: 'general',
        priority: 'high',
      },
    ];
    this.recommendedTasks = [...this.tasks];
  }
});

// Indexes for fast lookup by student, interview, and evaluator
actionPlanSchema.index({ studentId: 1, status: 1 });
actionPlanSchema.index({ studentId: 1, createdAt: -1 });
actionPlanSchema.index({ evaluatorId: 1, createdAt: -1 });

const ActionPlan = mongoose.model(
  'ActionPlan',
  actionPlanSchema,
  'Action_Plans'
);

export default ActionPlan;
