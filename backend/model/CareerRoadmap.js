import mongoose from 'mongoose';

const careerRoadmapSchema = new mongoose.Schema({
  careerName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
});

const CareerRoadmap = mongoose.model(
  'CareerRoadmap',
  careerRoadmapSchema,
  'Career_Roadmaps'
);
export default CareerRoadmap;
