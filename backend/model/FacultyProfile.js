import mongoose from 'mongoose';

const facultyProfileSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  isHOD: {
    type: Boolean,
    default: false,
  },
});

const FacultyProfile = mongoose.model(
  'FacultyProfile',
  facultyProfileSchema,
  'Faculty_Profiles'
);
export default FacultyProfile;
