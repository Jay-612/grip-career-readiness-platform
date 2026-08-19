import mongoose from 'mongoose';

const actionPlanSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weakSkill: {
    type: String,
    required: true,
  },
  recommendedTask: {
    type: String,
    required: true,
  },
});

const ActionPlan = mongoose.model(
  'ActionPlan',
  actionPlanSchema,
  'Action_Plans'
);
export default ActionPlan;
