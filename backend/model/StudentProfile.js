import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    selectedCareer: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true, // Crucial index for sub-10ms leaderboard and rank queries
    },
    careerHistory: [
      {
        career: { type: String, required: true },
        date: { type: Date, default: Date.now },
        source: { type: String, default: 'quiz' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for department and semester queries
studentProfileSchema.index({ semester: 1, readinessScore: -1 });

const StudentProfile = mongoose.model(
  'StudentProfile',
  studentProfileSchema,
  'Student_Profiles'
);
export default StudentProfile;
