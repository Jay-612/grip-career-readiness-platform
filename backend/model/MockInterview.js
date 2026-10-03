import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    meetLink: {
      type: String,
      default: null,
      trim: true,
    },
    googleEventId: {
      type: String,
      default: '',
      trim: true,
    },
    calendarHtmlLink: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      default: 45, // default 45-minute interview slot
      min: 15,
      max: 180,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for student progress queries and interviewer schedules
mockInterviewSchema.index({ studentId: 1, status: 1 });
mockInterviewSchema.index({ interviewerId: 1, dateTime: 1 });
mockInterviewSchema.index({ studentId: 1, dateTime: -1 });

const MockInterview = mongoose.model(
  'MockInterview',
  mockInterviewSchema,
  'Mock_Interviews'
);
export default MockInterview;
