import apiClient from './apiClient';

const studyRoomService = {
  // Get all study rooms
  getAllStudyRooms: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await apiClient.get(`/study-rooms?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get study room by ID
  getStudyRoomById: async (roomId) => {
    try {
      const response = await apiClient.get(`/study-rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get study room by room number
  getStudyRoomByNumber: async (roomNumber) => {
    try {
      const response = await apiClient.get(`/study-rooms/number/${roomNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new study room
  createStudyRoom: async (roomData) => {
    try {
      const response = await apiClient.post(`/study-rooms`, roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Join a study room
  joinStudyRoom: async (roomId) => {
    try {
      const response = await apiClient.post(`/study-rooms/${roomId}/join`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Leave a study room
  leaveStudyRoom: async (roomId) => {
    try {
      const response = await apiClient.post(`/study-rooms/${roomId}/leave`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Disband a study room
  disbandStudyRoom: async (roomId) => {
    try {
      const response = await apiClient.delete(`/study-rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get messages for a study room
  getMessages: async (roomId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await apiClient.get(
        `/study-rooms/${roomId}/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send a message to a study room
  sendMessage: async (roomId, message) => {
    try {
      const response = await apiClient.post(
        `/study-rooms/${roomId}/messages`,
        { message }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default studyRoomService;

