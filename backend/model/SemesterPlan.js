import mongoose from 'mongoose';

const semesterPlanSchema = new mongoose.Schema({
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerRoadmap',
    required: true,
  },
  semesterNumber: {
    type: Number,
    required: true,
  },
  subjects: {
    type: [String],
    default: [],
  },
});

const SemesterPlan = mongoose.model(
  'SemesterPlan',
  semesterPlanSchema,
  'Semester_Plans'
);
export default SemesterPlan;
