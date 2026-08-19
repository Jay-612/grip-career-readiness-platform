import mongoose from 'mongoose';

const recruiterFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const RecruiterFeedback = mongoose.model(
  'RecruiterFeedback',
  recruiterFeedbackSchema,
  'Recruiter_Feedback'
);
export default RecruiterFeedback;
