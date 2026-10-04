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
    // When targetType is 'alumni', targetAlumniId stores the specific alumni User ID
    targetAlumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Workflow tracking status: 'pending' (submitted, awaiting reply) | 'replied' (faculty/mentor replied) | 'resolved' (concluded)
    status: {
      type: String,
      enum: ['pending', 'replied', 'in-review', 'resolved'],
      default: 'pending',
    },
    // Topic category chosen during guidance request
    topic: {
      type: String,
      trim: true,
      default: 'General Guidance',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

guidanceRequestSchema.index({ status: 1 });
guidanceRequestSchema.index({ targetFacultyId: 1 });
guidanceRequestSchema.index({ targetAlumniId: 1 });
guidanceRequestSchema.index({ targetType: 1 });
guidanceRequestSchema.index({ studentId: 1, date: -1 });

const GuidanceRequest = mongoose.model(
  'GuidanceRequest',
  guidanceRequestSchema,
  'Guidance_Requests'
);
export default GuidanceRequest;
