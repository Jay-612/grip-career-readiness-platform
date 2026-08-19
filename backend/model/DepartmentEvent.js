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
});

const DepartmentEvent = mongoose.model(
  'DepartmentEvent',
  departmentEventSchema,
  'Department_Events'
);
export default DepartmentEvent;
