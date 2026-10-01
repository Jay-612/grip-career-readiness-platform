import apiClient from './apiClient';

/**
 * Admin Service
 * Provides institutional administration APIs for user RBAC governance,
 * curriculum roadmaps, company hiring partners, department events, and analytics.
 */
export const adminService = {
  // 1. Executive Telemetry Overview
  getOverview: async () => {
    const response = await apiClient.get('/admin/overview');
    return response.data;
  },

  // 2. User & RBAC Management
  getUsers: async ({ page = 1, limit = 10, role = 'all', search = '' } = {}) => {
    const params = { page, limit };
    if (role && role !== 'all') params.role = role;
    if (search && search.trim()) params.search = search.trim();

    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // 3. Career Roadmaps & Curriculum Master Data
  getRoadmaps: async () => {
    const response = await apiClient.get('/admin/roadmaps');
    return response.data;
  },

  createRoadmap: async (data) => {
    const response = await apiClient.post('/admin/roadmaps', data);
    return response.data;
  },

  updateRoadmap: async (id, data) => {
    const response = await apiClient.put(`/admin/roadmaps/${id}`, data);
    return response.data;
  },

  deleteRoadmap: async (id) => {
    const response = await apiClient.delete(`/admin/roadmaps/${id}`);
    return response.data;
  },

  // 4. Hiring Partner Companies
  getCompanies: async () => {
    const response = await apiClient.get('/admin/companies');
    return response.data;
  },

  createCompany: async (data) => {
    const response = await apiClient.post('/admin/companies', data);
    return response.data;
  },

  updateCompany: async (id, data) => {
    const response = await apiClient.put(`/admin/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await apiClient.delete(`/admin/companies/${id}`);
    return response.data;
  },

  // 5. Department Skill-Improvement Events
  getEvents: async () => {
    const response = await apiClient.get('/admin/events');
    return response.data;
  },

  createEvent: async (data) => {
    const response = await apiClient.post('/admin/events', data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/admin/events/${id}`);
    return response.data;
  },

  // 6. Institutional Analytics
  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },
};

export default adminService;
