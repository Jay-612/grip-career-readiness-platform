import mongoose from 'mongoose';

const guidanceRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const GuidanceRequest = mongoose.model(
  'GuidanceRequest',
  guidanceRequestSchema,
  'Guidance_Requests'
);
export default GuidanceRequest;
