import mongoose from 'mongoose';

const recruiterProfileSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    default: '',
  },
});

const RecruiterProfile = mongoose.model(
  'RecruiterProfile',
  recruiterProfileSchema,
  'Recruiter_Profiles'
);
export default RecruiterProfile;
