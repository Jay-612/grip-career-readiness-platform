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
  // POST /api/appointments -> body: { date, time, facultyId }
  scheduleAppointment: async ({ date, time, facultyId }) => {
    const response = await apiClient.post('/appointments', {
      date,
      time,
      facultyId,
    });
    return response.data;
  },

  // Query faculty evaluators and department mentors
  // GET /api/mentors/recommendation
  getRecommendedMentors: async () => {
    const response = await apiClient.get('/mentors/recommendation');
    return Array.isArray(response.data) ? response.data : [];
  },
};

export default interviewService;
