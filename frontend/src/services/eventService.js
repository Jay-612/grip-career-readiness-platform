import apiClient from './apiClient';

/**
 * Event Service
 * Client for /api/events endpoints (Department & Campus Placement Events)
 */
export const eventService = {
  // GET /api/events (with optional query filters: upcomingOnly, audienceType, etc.)
  getEvents: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  // GET /api/events/:id
  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  // POST /api/events
  createEvent: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  // PUT /api/events/:id
  updateEvent: async (id, eventData) => {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  },

  // DELETE /api/events/:id
  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};

export default eventService;
