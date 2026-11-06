import apiClient from './apiClient';

const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await apiClient.post(`/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get reviews with optional filters
  getReviews: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.teacher) params.append('teacher', filters.teacher);
      if (filters.course) params.append('course', filters.course);
      if (filters.term) params.append('term', filters.term);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await apiClient.get(`/reviews?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single review by ID
  getReviewById: async (reviewId) => {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Flag a review (positive or negative) - one flag per user
  flagReview: async (reviewId, flagType = 'positive') => {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/flag`, {
        flagType, // 'positive' or 'negative'
        // userId is now obtained from auth token
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a review (only owner/admin in backend)
  updateReview: async (reviewId, updateData) => {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a review (soft delete) (only owner/admin in backend)
  deleteReview: async (reviewId) => {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default reviewService;

