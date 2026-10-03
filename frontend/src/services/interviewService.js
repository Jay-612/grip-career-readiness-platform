import apiClient from './apiClient';

/**
 * Interview & Readiness Service
 * Interacts with confirmed backend endpoints for appointments, mock interviews, evaluations, and placement readiness.
 */
export const interviewService = {
  // Get authenticated student's base profile and studentId
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Get placement readiness score and 30-40-30 rubric breakdown
  // GET /api/placement/readiness/:studentId
  getPlacementReadiness: async (studentId) => {
    const response = await apiClient.get(`/placement/readiness/${studentId}`);
    return response.data;
  },

  // Get interview performance analysis, upcoming/past history, and evaluation scores
  // GET /api/progress/interviews/:studentId
  getInterviewAnalysis: async (studentId) => {
    const response = await apiClient.get(`/progress/interviews/${studentId}`);
    return response.data;
  },

  // Get scheduled appointment records for authenticated user
  // GET /api/appointments
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return Array.isArray(response.data) ? response.data : (response.data?.appointments || []);
  },

  // Schedule/book a new mock interview appointment
  // POST /api/appointments -> body: { date, time, facultyId, dateTime, timezoneOffset, customMeetLink }
  scheduleAppointment: async (payload) => {
    const response = await apiClient.post('/appointments', payload);
    return response.data;
  },

  // Query faculty evaluators and department mentors
  // GET /api/mentors/recommendation
  getRecommendedMentors: async () => {
    const response = await apiClient.get('/mentors/recommendation');
    return Array.isArray(response.data) ? response.data : [];
  },

  // Cancel an appointment
  // PATCH /api/appointments/:id/cancel
  cancelAppointment: async (appointmentId) => {
    const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  // Generate or refresh Google Meet room for an appointment (or save custom link)
  // POST /api/appointments/:id/create-meet
  generateGoogleMeet: async (appointmentId, customMeetLink = null) => {
    const response = await apiClient.post(`/appointments/${appointmentId}/create-meet`, {
      customMeetLink,
    });
    return response.data;
  },

  // Accept a pending mock interview appointment and generate Google Meet
  // PATCH /api/appointments/:id/accept
  acceptAppointment: async (appointmentId, customMeetLink = null) => {
    const response = await apiClient.patch(`/appointments/${appointmentId}/accept`, {
      customMeetLink,
    });
    return response.data;
  },

  // Decline/reject an appointment request
  // PATCH /api/appointments/:id/reject
  rejectAppointment: async (appointmentId, reason = '') => {
    const response = await apiClient.patch(`/appointments/${appointmentId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Securely verify and obtain the active meeting link with time-gate protection
  // GET /api/appointments/:id/join
  joinAppointment: async (appointmentId) => {
    const response = await apiClient.get(`/appointments/${appointmentId}/join`);
    return response.data;
  },
};

export default interviewService;
