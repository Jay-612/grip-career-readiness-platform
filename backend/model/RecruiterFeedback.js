import mongoose from 'mongoose';

const recruiterFeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, 'Feedback comments must be at least 5 characters long'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: 8,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch/count feedback per student
recruiterFeedbackSchema.index({ studentId: 1, date: -1 });

const RecruiterFeedback = mongoose.model(
  'RecruiterFeedback',
  recruiterFeedbackSchema,
  'Recruiter_Feedback'
);
export default RecruiterFeedback;
