import apiClient from './apiClient';

const notificationService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteOne: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default notificationService;
