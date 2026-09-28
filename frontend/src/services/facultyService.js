import apiClient from './apiClient';

/**
 * Faculty Service
 * Connects directly to backend endpoints for faculty profile, cohort leaderboard,
 * interview appointments, evaluations, guidance requests, and HOD analytics.
 */
export const facultyService = {
  // Get faculty profile and user metadata

  // GET /api/users/profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Get scheduled interview appointments for current faculty member
  // GET /api/appointments
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return Array.isArray(response.data)
      ? response.data
      : response.data?.appointments || [];
  },

  // Get guidance requests from students (accessible to faculty)
  // GET /api/guidance/requests?page=&limit=
  getGuidanceRequests: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/guidance/requests', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get a single guidance request by ID with conversation replies
  // GET /api/guidance/requests/:id
  getGuidanceRequestById: async (id) => {
    const response = await apiClient.get(`/guidance/requests/${id}`);
    return response.data;
  },

  // Reply to a student guidance request
  // POST /api/guidance/requests/:id/reply
  replyGuidanceRequest: async (id, replyText) => {
    const response = await apiClient.post(`/guidance/requests/${id}/reply`, {
      reply: replyText,
    });
    return response.data;
  },

  // Get student placement readiness leaderboard for cohort insights
  // GET /api/placement/leaderboard
  getLeaderboard: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/placement/leaderboard', {
      params: { page, limit },
    });
    return response.data;
  },

  // Submit mock interview rubric evaluation
  // POST /api/skills/evaluation
  submitEvaluation: async ({
    interviewId,
    communication,
    confidence,
    technical,
  }) => {
    const response = await apiClient.post('/skills/evaluation', {
      interviewId,
      communication,
      confidence,
      technical,
    });
    return response.data;
  },

  // Get comprehensive progress analysis for an individual student
  // GET /api/progress/dashboard/:studentId
  getStudentProgress: async (studentId) => {
    const response = await apiClient.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get readiness score breakdown for an individual student
  // GET /api/placement/readiness/:studentId
  getStudentReadiness: async (studentId) => {
    const response = await apiClient.get(`/placement/readiness/${studentId}`);
    return response.data;
  },

  // Optional: Get department placement stats (HOD-only)
  // GET /api/department/placement-stats
  getDepartmentPlacementStats: async () => {
    try {
      const response = await apiClient.get('/department/placement-stats');
      return response.data;
    } catch {
      // Non-HOD faculty return null gracefully without throwing
      return null;
    }
  },

  // Optional: Get department skill gaps (HOD-only)
  // GET /api/department/skill-gaps
  getDepartmentSkillGaps: async () => {
    try {
      const response = await apiClient.get('/department/skill-gaps');
      return response.data;
    } catch {
      return null;
    }
  },

  // Optional: Get department analytics (HOD-only)
  // GET /api/department/analytics
  getDepartmentAnalytics: async () => {
    try {
      const response = await apiClient.get('/department/analytics');
      return response.data;
    } catch {
      return null;
    }
  },
};

export default facultyService;
