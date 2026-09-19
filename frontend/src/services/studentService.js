import apiClient from './apiClient';

/**
 * Student Dashboard & Progress Service
 * Exclusively uses centralized apiClient with automatic JWT authorization
 */

export const studentService = {
  // Get authenticated user's base user and student profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update authenticated user's base and student profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  // Get student's overall progress dashboard analytics
  getProgressDashboard: async (studentId) => {
    const response = await apiClient.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get placement readiness score and rubric breakdown
  getPlacementReadiness: async (studentId) => {
    const response = await apiClient.get(`/placement/readiness/${studentId}`);
    return response.data;
  },

  // Get target company matches and eligibility percentages
  getCompanyMatch: async (studentId) => {
    const response = await apiClient.get(`/placement/company-match/${studentId}`);
    return response.data;
  },

  // Get weekly goals with optional status filter
  getGoals: async (studentId, status) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/progress/goals/${studentId}`, { params });
    return response.data;
  },

  // Get scheduled interview and mentorship appointments
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    // Handle both direct array and object with appointments property
    return Array.isArray(response.data) ? response.data : (response.data?.appointments || []);
  },

  // Get career roadmap and semester milestones
  getCareerRoadmap: async (careerId) => {
    const response = await apiClient.get(`/career/roadmap/${encodeURIComponent(careerId)}`);
    return response.data;
  },

  // Submit diagnostic career quiz to evaluate suggested track
  submitCareerQuiz: async (quizData) => {
    const response = await apiClient.post('/career/quiz', quizData);
    return response.data;
  },

  // Get recommended faculty and alumni mentors aligned with path
  getMentorRecommendations: async () => {
    const response = await apiClient.get('/mentors/recommendation');
    return Array.isArray(response.data) ? response.data : [];
  },
};

export default studentService;
