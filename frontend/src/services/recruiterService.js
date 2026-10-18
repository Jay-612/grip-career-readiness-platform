import apiClient from './apiClient';

/**
 * Service methods for Recruiter portal interactions.
 * Integrates directly with real backend endpoints for recruiter profile,
 * company creation, student feedback, scheduled interview appointments,
 * and company skill matching.
 */
const recruiterService = {
  // Get authenticated recruiter user and profile details
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Alias for semantic company profile access
  getCompanyProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update authenticated recruiter profile details (companyName, designation)
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  // Alias for updating company profile
  updateCompanyProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  // Register or add a company to the campus hiring platform
  addCompany: async (companyData) => {
    const response = await apiClient.post('/companies', companyData);
    return response.data;
  },

  // Retrieve company criteria by name
  getCompanyByName: async (name) => {
    const response = await apiClient.get('/companies', { params: { name } });
    return response.data?.company || null;
  },

  // Submit recruiter feedback for a specific candidate
  submitFeedback: async (studentId, comments, rating = 8) => {
    const response = await apiClient.post('/feedback', { studentId, comments, rating });
    return response.data;
  },

  // Get recruiter's feedback submission history
  getFeedbackHistory: async () => {
    const response = await apiClient.get('/feedback');
    return response.data?.feedbacks || [];
  },

  // Discover candidate pool via placement leaderboard
  getCandidatesLeaderboard: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/placement/leaderboard', {
      params: { page, limit },
    });
    return response.data?.leaderboard || [];
  },

  // Get interview appointments where the current recruiter is the interviewer
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return Array.isArray(response.data) ? response.data : (response.data?.appointments || []);
  },

  // Retrieve candidate company match analysis (authorized for recruiters)
  getCompanyMatch: async (studentId) => {
    const response = await apiClient.get(`/placement/company-match/${studentId}`);
    return response.data;
  },

  // Retrieve campus placement drives and department improvement events
  getEvents: async () => {
    const response = await apiClient.get('/events');
    return Array.isArray(response.data) ? response.data : (response.data?.events || []);
  },

  // Get list of authorized students available to recruiter via scheduled mock appointments
  getAvailableStudents: async () => {
    const response = await apiClient.get('/appointments');
    const apts = Array.isArray(response.data) ? response.data : (response.data?.appointments || []);
    const studentMap = new Map();

    apts.forEach((apt) => {
      if (apt.student && apt.student.id) {
        const sid = apt.student.id;
        if (!studentMap.has(sid)) {
          studentMap.set(sid, {
            id: sid,
            name: apt.student.name,
            email: apt.student.email,
            latestStatus: apt.status,
            appointmentDate: apt.date,
            appointmentTime: apt.time,
            appointmentId: apt.id,
          });
        }
      }
    });

    return Array.from(studentMap.values());
  },

  // Retrieve authorized student feedback context (skills, career roadmap, company match)
  getStudentFeedbackContext: async (studentId) => {
    const response = await apiClient.get(`/placement/company-match/${studentId}`);
    return response.data;
  },

  // Get user basic public details
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};

export default recruiterService;
