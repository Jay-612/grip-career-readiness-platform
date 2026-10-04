import apiClient from './apiClient';

/**
 * In-app Notification Service
 * Interfaces with /api/notifications endpoints.
 */
export const notificationService = {
  // GET /api/notifications
  getNotifications: async (limit = 20) => {
    const response = await apiClient.get('/notifications', {
      params: { limit },
    });
    return response.data;
  },

  // PUT /api/notifications/:id/read
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // PUT /api/notifications/read-all
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  // POST /api/notifications/trigger-reminders (testing/audit)
  triggerReminderScan: async () => {
    const response = await apiClient.post('/notifications/trigger-reminders');
    return response.data;
  },
};

export default notificationService;
