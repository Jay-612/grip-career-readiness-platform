import apiClient from './apiClient';

/**
 * Guidance Service
 * Interfaces with backend endpoints for guidance requests and threaded replies.
 */
export const guidanceService = {
  // Student submits a new guidance question
  // POST /api/guidance/request -> body: { question }
  createRequest: async (question) => {
    const response = await apiClient.post('/guidance/request', { question });
    return response.data;
  },

  // List student's guidance requests (role-based: students see only their own)
  // GET /api/guidance/requests -> query: ?page=&limit=
  getRequests: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/guidance/requests', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get single guidance request with all mentor replies
  // GET /api/guidance/requests/:id
  getRequestById: async (id) => {
    const response = await apiClient.get(`/guidance/requests/${id}`);
    return response.data;
  },
};

export default guidanceService;
