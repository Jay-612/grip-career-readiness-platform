import mongoose from 'mongoose';

const experiencePostSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ExperiencePost = mongoose.model(
  'ExperiencePost',
  experiencePostSchema,
  'Experience_Posts'
);
export default ExperiencePost;
