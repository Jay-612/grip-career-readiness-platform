import apiClient from './apiClient';

/**
 * Analytics API Service
 * Centralized service for Department & HOD Analytics.
 * Connects to confirmed backend endpoints:
 * - GET  /api/department/analytics
 * - GET  /api/department/skill-gaps
 * - GET  /api/department/placement-stats
 * - GET  /api/department/career-distribution
 * - GET  /api/placement/leaderboard
 * - GET  /api/events
 * - POST /api/events
 * - GET  /api/progress/dashboard/:studentId
 * - GET  /api/placement/readiness/:studentId
 * - GET  /api/progress/interviews/:studentId
 */
export const analyticsApi = {
  // Get Department-wide Analytics Overview
  // GET /api/department/analytics
  getDepartmentAnalytics: async () => {
    const response = await apiClient.get('/department/analytics');
    return response.data;
  },

  // Get Top Department Skill Gaps (from ActionPlans)
  // GET /api/department/skill-gaps
  getSkillGaps: async () => {
    const response = await apiClient.get('/department/skill-gaps');
    return response.data;
  },

  // Get Placement Statistics and Score Distribution
  // GET /api/department/placement-stats
  getPlacementStats: async () => {
    const response = await apiClient.get('/department/placement-stats');
    return response.data;
  },

  // Get Career Path Distribution
  // GET /api/department/career-distribution
  getCareerDistribution: async () => {
    const response = await apiClient.get('/department/career-distribution');
    return response.data;
  },

  // Get Student Leaderboard / Cohort Roster
  // GET /api/placement/leaderboard?page=&limit=
  getLeaderboard: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/placement/leaderboard', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get Department Scheduled Events
  // GET /api/events?hodId=&targetSkill=
  getEvents: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  // Schedule an Improvement Workshop / Event (HOD only)
  // POST /api/events
  createEvent: async ({ hodId, title, targetSkill, date, description }) => {
    const response = await apiClient.post('/events', {
      hodId,
      title,
      targetSkill,
      date,
      description,
    });
    return response.data;
  },

  // Get Individual Student Progress Detail
  // GET /api/progress/dashboard/:studentId
  getStudentProgress: async (studentId) => {
    const response = await apiClient.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get Individual Student Placement Readiness
  // GET /api/placement/readiness/:studentId
  getStudentReadiness: async (studentId) => {
    const response = await apiClient.get(`/placement/readiness/${studentId}`);
    return response.data;
  },

  // Get Individual Student Interview Breakdown
  // GET /api/progress/interviews/:studentId
  getStudentInterviews: async (studentId) => {
    const response = await apiClient.get(`/progress/interviews/${studentId}`);
    return response.data;
  },
};

export default analyticsApi;
