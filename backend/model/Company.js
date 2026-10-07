import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Technology & Software',
      trim: true,
    },
    location: {
      type: String,
      default: 'Bengaluru, India',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    targetRole: {
      type: String,
      default: 'Distributed Systems & Cloud Platform Engineer',
      trim: true,
    },
    openPositions: {
      type: Number,
      default: 15,
    },
    cgpaCutoff: {
      type: String,
      default: '7.5+ CGPA',
      trim: true,
    },
    eligibleDepartments: {
      type: [String],
      default: ['Computer Science & Engineering', 'Information Technology'],
    },
    eligibleBatch: {
      type: String,
      default: '2026 Batch',
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design'],
    },
    preferredSkills: {
      type: [String],
      default: ['Go', 'AWS Lambda', 'GraphQL', 'Linux Kernel'],
    },
    minimumMatchScore: {
      type: Number,
      default: 70,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema, 'Companies');
export default Company;
