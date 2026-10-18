import apiClient from './apiClient';

/**
 * Mentor Service
 * Interfaces with mentor recommendation and alumni directory endpoints.
 */
export const mentorService = {
  // Query recommended faculty and alumni mentors
  // GET /api/mentors/recommendation
  getRecommendedMentors: async () => {
    const response = await apiClient.get('/mentors/recommendation');
    return response.data;
  },

  // List alumni mentors with optional filtering
  // GET /api/alumni
  getAllAlumni: async (params = {}) => {
    const response = await apiClient.get('/alumni', { params });
    return response.data;
  },
};

export default mentorService;
