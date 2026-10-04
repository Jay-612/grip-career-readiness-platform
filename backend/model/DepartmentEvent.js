import mongoose from 'mongoose';

const departmentEventSchema = new mongoose.Schema({
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  targetSkill: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    default: '11:00 AM',
    trim: true,
  },
  venue: {
    type: String,
    default: 'Seminar Hall',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  eventType: {
    type: String,
    default: 'Workshop',
    trim: true,
  },
  // Targeting
  audienceType: {
    type: String,
    enum: ['all_students', 'department', 'semester', 'department_semester'],
    default: 'all_students',
    index: true,
  },
  targetDepartment: {
    type: String,
    default: '',
    trim: true,
  },
  targetSemester: {
    type: Number,
    min: 1,
    max: 8,
    default: null,
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled',
    index: true,
  },
  // Durable Reminder Dispatch State
  remindersSent: {
    '24h': { type: Boolean, default: false },
    '1h': { type: Boolean, default: false },
  },
});

departmentEventSchema.index({ date: 1, status: 1 });

const DepartmentEvent = mongoose.model(
  'DepartmentEvent',
  departmentEventSchema,
  'Department_Events'
);
export default DepartmentEvent;
