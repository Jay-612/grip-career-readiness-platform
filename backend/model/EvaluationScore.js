import mongoose from 'mongoose';

const evaluationScoreSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true,
  },
  technicalScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  communicationScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
});

const EvaluationScore = mongoose.model(
  'EvaluationScore',
  evaluationScoreSchema,
  'Evaluation_Scores'
);
export default EvaluationScore;
