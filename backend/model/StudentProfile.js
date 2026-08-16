import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  selectedCareer: {
    type: String,
    default: '',
  },
  readinessScore: {
    type: Number,
    default: 0,
  },
});

const StudentProfile = mongoose.model(
  'StudentProfile',
  studentProfileSchema,
  'Student_Profiles'
);
export default StudentProfile;
