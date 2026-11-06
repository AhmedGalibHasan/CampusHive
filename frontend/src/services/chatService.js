import apiClient from './apiClient';

const chatService = {
  getUsers: async () => {
    try {
      const response = await apiClient.get('/chat/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getChatList: async () => {
    try {
      const response = await apiClient.get('/chat/list');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMessages: async (userId) => {
    try {
      const response = await apiClient.get(`/chat/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAsRead: async (userId) => {
    try {
      const response = await apiClient.put(`/chat/${userId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendMessage: async ({ receiverId, message }) => {
    try {
      const response = await apiClient.post('/chat/send', { receiverId, message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/chat/message/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const response = await apiClient.post(`/chat/message/${messageId}/reaction`, { emoji });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeReaction: async (messageId) => {
    try {
      const response = await apiClient.delete(`/chat/message/${messageId}/reaction`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  startTyping: async (receiverId) => {
    try {
      const response = await apiClient.post('/chat/typing/start', { receiverId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  stopTyping: async (receiverId) => {
    try {
      const response = await apiClient.post('/chat/typing/stop', { receiverId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTypingStatus: async (userId) => {
    try {
      const response = await apiClient.get(`/chat/typing/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default chatService;
