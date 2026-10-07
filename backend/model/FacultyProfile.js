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
    default: '',
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering',
  },
  isHOD: {
    type: Boolean,
    default: false,
  },
  designation: {
    type: String,
    default: 'Assistant Professor',
  },
  phone: {
    type: String,
    default: '',
  },
  cabinNumber: {
    type: String,
    default: '',
  },
  officeHours: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  specialization: {
    type: [String],
    default: [],
  },
  education: {
    type: String,
    default: '',
  },
  researchInterests: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const FacultyProfile = mongoose.model(
  'FacultyProfile',
  facultyProfileSchema,
  'Faculty_Profiles'
);
export default FacultyProfile;
