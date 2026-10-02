import mongoose from 'mongoose';

const guidanceRequestSchema = new mongoose.Schema(
  {
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
    // 'faculty' (specific faculty advisor) or 'alumni' (all alumni members) or 'all'
    targetType: {
      type: String,
      enum: ['faculty', 'alumni', 'all'],
      default: 'alumni',
    },
    // When targetType is 'faculty', targetFacultyId stores the specific faculty User ID
    targetFacultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

guidanceRequestSchema.index({ targetFacultyId: 1 });
guidanceRequestSchema.index({ targetType: 1 });
guidanceRequestSchema.index({ studentId: 1, date: -1 });

const GuidanceRequest = mongoose.model(
  'GuidanceRequest',
  guidanceRequestSchema,
  'Guidance_Requests'
);
export default GuidanceRequest;
