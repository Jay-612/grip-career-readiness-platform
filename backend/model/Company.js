import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  minimumMatchScore: {
    type: Number,
    default: 0,
  },
});

const Company = mongoose.model(
  'Company',
  companySchema,
  'Companies'
);
export default Company;
