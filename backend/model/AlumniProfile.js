import mongoose from 'mongoose';

const alumniProfileSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  graduationYear: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  currentCompany: {
    type: String,
    default: '',
  },
  jobRole: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering',
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  linkedinUrl: {
    type: String,
    default: '',
  },
  githubUrl: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  mentorshipTopics: {
    type: [String],
    default: [],
  },
  isAvailableForMentorship: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const AlumniProfile = mongoose.model(
  'AlumniProfile',
  alumniProfileSchema,
  'Alumni_Profiles'
);
export default AlumniProfile;
