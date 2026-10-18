import mongoose from 'mongoose';

const weeklyGoalSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'communication', 'confidence', 'remedial', 'project', 'academic'],
      default: 'general',
    },
    isRemedial: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      enum: ['self', 'action_plan', 'mentor', 'faculty', 'system'],
      default: 'self',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterview',
      default: null,
      index: true,
    },
    actionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActionPlan',
      index: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-cardinality compound indexes for status filtering and deadline sorting
weeklyGoalSchema.index({ studentId: 1, status: 1 });
weeklyGoalSchema.index({ studentId: 1, dueDate: -1 });
weeklyGoalSchema.index({ studentId: 1, isRemedial: 1 });

const WeeklyGoal = mongoose.model(
  'WeeklyGoal',
  weeklyGoalSchema,
  'Weekly_Goals'
);

export default WeeklyGoal;
