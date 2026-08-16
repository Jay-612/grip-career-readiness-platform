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
    required: true,
  },
  currentCompany: {
    type: String,
    default: '',
  },
  jobRole: {
    type: String,
    default: '',
  },
});

const AlumniProfile = mongoose.model(
  'AlumniProfile',
  alumniProfileSchema,
  'Alumni_Profiles'
);
export default AlumniProfile;
