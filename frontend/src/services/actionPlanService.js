import apiClient from './apiClient';

/**
 * Action Plan Service
 * Connects directly to backend endpoints for automated action plans,
 * domain deficit analysis (< 7/10 threshold), and remedial goal assignments.
 */
export const actionPlanService = {
  // Generate real-time preview of action plan based on domain scores
  // POST /api/action-plans/preview
  previewActionPlan: async (scores, notes = {}) => {
    const response = await apiClient.post('/action-plans/preview', {
      scores,
      notes,
    });
    return response.data;
  },

  // Get current logged-in student's action plans and assigned remedial goals
  // GET /api/action-plans/my-plans
  getMyActionPlans: async () => {
    const response = await apiClient.get('/action-plans/my-plans');
    return response.data;
  },

  // Get action plans for a specific student
  // GET /api/action-plans/student/:studentId
  getStudentActionPlans: async (studentId) => {
    const response = await apiClient.get(`/action-plans/student/${studentId}`);
    return response.data;
  },

  // Get action plan for a specific interview appointment
  // GET /api/action-plans/interview/:interviewId
  getInterviewActionPlan: async (interviewId) => {
    const response = await apiClient.get(`/action-plans/interview/${interviewId}`);
    return response.data;
  },

  // Update action plan status ('assigned', 'in-progress', 'completed')
  // PATCH /api/action-plans/:id/status
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/action-plans/${id}/status`, { status });
    return response.data;
  },
};

export default actionPlanService;
