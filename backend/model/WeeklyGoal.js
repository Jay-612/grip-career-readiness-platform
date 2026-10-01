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
  },
  {
    timestamps: true,
  }
);

// High-cardinality compound indexes for status filtering and deadline sorting
weeklyGoalSchema.index({ studentId: 1, status: 1 });
weeklyGoalSchema.index({ studentId: 1, dueDate: -1 });

const WeeklyGoal = mongoose.model(
  'WeeklyGoal',
  weeklyGoalSchema,
  'Weekly_Goals'
);
export default WeeklyGoal;
