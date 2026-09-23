import apiClient from './apiClient';

/**
 * Goal Service
 * Interacts with confirmed backend endpoints for goals, roadmaps, and progress analytics.
 */
export const goalService = {
  // Get student's base user and profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Get weekly goals with optional status filter ('pending', 'in-progress', 'completed')
  // GET /api/progress/goals/:studentId
  getGoals: async (studentId, status) => {
    const params = status && status !== 'all' ? { status } : {};
    const response = await apiClient.get(`/progress/goals/${studentId}`, { params });
    return response.data;
  },

  // Save weekly goals for authenticated student
  // POST /api/goals -> body: { userId, goals: [title], dueDate }
  createWeeklyGoals: async ({ userId, goals, dueDate }) => {
    const payload = {
      goals,
    };
    if (userId) payload.userId = userId;
    if (dueDate) payload.dueDate = dueDate;

    const response = await apiClient.post('/goals', payload);
    return response.data;
  },

  // Update goal status (e.g. 'pending', 'in-progress', 'completed')
  // PUT /api/goals/:goalId -> body: { status }
  updateGoalStatus: async (goalId, status) => {
    const response = await apiClient.put(`/goals/${goalId}`, { status });
    return response.data;
  },

  // Get comprehensive progress dashboard (includes action plans, interview stats, etc.)
  // GET /api/progress/dashboard/:studentId
  getProgressDashboard: async (studentId) => {
    const response = await apiClient.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get career roadmap and semester milestone plans
  // GET /api/career/roadmap/:careerId
  getCareerRoadmap: async (careerId) => {
    const response = await apiClient.get(`/career/roadmap/${encodeURIComponent(careerId)}`);
    return response.data;
  },

  // Get placement readiness score & rubric breakdown
  // GET /api/placement/readiness/:studentId
  getPlacementReadiness: async (studentId) => {
    const response = await apiClient.get(`/placement/readiness/${studentId}`);
    return response.data;
  },
};

export default goalService;
