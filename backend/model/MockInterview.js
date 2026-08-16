import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  meetLink: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
});

const MockInterview = mongoose.model(
  'MockInterview',
  mockInterviewSchema,
  'Mock_Interviews'
);
export default MockInterview;
