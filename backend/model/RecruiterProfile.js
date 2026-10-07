import mongoose from 'mongoose';

const recruiterProfileSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    hiringDomains: {
      type: [String],
      default: [],
    },
    hiringRoles: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const RecruiterProfile = mongoose.model(
  'RecruiterProfile',
  recruiterProfileSchema,
  'Recruiter_Profiles'
);
export default RecruiterProfile;

