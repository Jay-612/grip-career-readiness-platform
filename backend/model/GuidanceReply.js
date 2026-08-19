import mongoose from 'mongoose';

const guidanceReplySchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuidanceRequest',
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answerText: {
    type: String,
    required: true,
  },
});

const GuidanceReply = mongoose.model(
  'GuidanceReply',
  guidanceReplySchema,
  'Guidance_Replies'
);
export default GuidanceReply;
