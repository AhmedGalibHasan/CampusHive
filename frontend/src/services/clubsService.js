import apiClient from './apiClient';

const clubsService = {
  getClubs: async ({ searchTerm, filter, category, userId } = {}) => {
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (filter && filter !== 'all') params.append('filter', filter);
      if (category && category !== 'all') params.append('category', category);
      if (filter === 'joined' && userId) params.append('userId', userId);

      const response = await apiClient.get(`/clubs?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestClub: async (formData) => {
    try {
      const response = await apiClient.post('/clubs/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  joinClub: async (clubId) => {
    try {
      const response = await apiClient.post(`/clubs/${clubId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  leaveClub: async (clubId) => {
    try {
      const response = await apiClient.post(`/clubs/${clubId}/leave`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteClub: async (clubId) => {
    try {
      const response = await apiClient.delete(`/clubs/${clubId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addAnnouncement: async (clubId, content) => {
    try {
      const response = await apiClient.post(`/clubs/${clubId}/announcements`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveAnnouncement: async (clubId, announcementIndex) => {
    try {
      const response = await apiClient.post(
        `/clubs/${clubId}/announcements/${announcementIndex}/approve`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  rejectAnnouncement: async (clubId, announcementIndex) => {
    try {
      const response = await apiClient.post(
        `/clubs/${clubId}/announcements/${announcementIndex}/reject`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default clubsService;
