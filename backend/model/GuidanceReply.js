import mongoose from 'mongoose';

const guidanceReplySchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GuidanceRequest',
      required: true,
      index: true, // Accelerates $in queries when gathering replies for request lists
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answerText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

guidanceReplySchema.index({ requestId: 1, createdAt: -1 });

const GuidanceReply = mongoose.model(
  'GuidanceReply',
  guidanceReplySchema,
  'Guidance_Replies'
);
export default GuidanceReply;
