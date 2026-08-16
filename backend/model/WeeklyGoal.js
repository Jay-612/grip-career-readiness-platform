import mongoose from 'mongoose';

const weeklyGoalSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
});

const WeeklyGoal = mongoose.model(
  'WeeklyGoal',
  weeklyGoalSchema,
  'Weekly_Goals'
);
export default WeeklyGoal;
