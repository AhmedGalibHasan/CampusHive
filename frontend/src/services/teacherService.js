import apiClient from './apiClient';

const teacherService = {
  // Get all teachers
  getAllTeachers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await apiClient.get(`/teachers?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher by ID
  getTeacherById: async (teacherId) => {
    try {
      const response = await apiClient.get(`/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all reviews for a teacher
  getTeacherReviews: async (teacherId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.course) params.append('course', filters.course);
      if (filters.term) params.append('term', filters.term);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await apiClient.get(
        `/teachers/${teacherId}/reviews?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default teacherService;

