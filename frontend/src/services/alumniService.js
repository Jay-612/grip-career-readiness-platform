import apiClient from './apiClient';

/**
 * Service methods for Alumni portal interactions.
 * Integrates directly with real backend endpoints for profile, experience posts,
 * mentorship guidance requests, and appointments.
 */
const alumniService = {
  // Get authenticated alumni profile and user details
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update authenticated alumni profile details (company, role, graduation year)
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  // Get student guidance / mentorship requests with optional pagination
  getGuidanceRequests: async (params = {}) => {
    const response = await apiClient.get('/guidance/requests', { params });
    return response.data;
  },

  // Get single guidance request with all replies
  getGuidanceRequestById: async (id) => {
    const response = await apiClient.get(`/guidance/requests/${id}`);
    return response.data;
  },

  // Post an alumni mentorship reply to a student guidance request
  replyGuidanceRequest: async (id, answerText) => {
    const response = await apiClient.post(`/guidance/${id}/reply`, { answerText });
    return response.data;
  },

  // Update an existing mentorship reply authored by this alumni
  updateGuidanceReply: async (replyId, answerText) => {
    const response = await apiClient.put(`/guidance/reply/${replyId}`, { answerText });
    return response.data;
  },

  // List all alumni experience posts with optional filters (e.g. tag)
  getPosts: async (params = {}) => {
    const response = await apiClient.get('/alumni/posts', { params });
    return response.data;
  },

  // Get single experience post by ID
  getPostById: async (id) => {
    const response = await apiClient.get(`/alumni/posts/${id}`);
    return response.data;
  },

  // Create a new experience post (Alumni only)
  createPost: async (postData) => {
    const response = await apiClient.post('/alumni/posts', postData);
    return response.data;
  },

  // Update an existing experience post authored by current alumni
  updatePost: async (id, postData) => {
    const response = await apiClient.put(`/alumni/posts/${id}`, postData);
    return response.data;
  },

  // Delete an existing experience post authored by current alumni
  deletePost: async (id) => {
    const response = await apiClient.delete(`/alumni/posts/${id}`);
    return response.data;
  },

  // Get appointment history where alumni is the interviewer/mentor
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return Array.isArray(response.data) ? response.data : (response.data?.appointments || []);
  },
};

export default alumniService;
