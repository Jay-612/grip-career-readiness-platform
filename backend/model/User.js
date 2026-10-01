import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'faculty', 'alumni', 'recruiter', 'admin'],
      default: 'student',
      index: true, // Key index for role filtering (leaderboards, faculty roster, student lookup)
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema, 'Users');
export default User;
