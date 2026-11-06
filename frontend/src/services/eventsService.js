import apiClient from './apiClient';

const eventsService = {
  getEvents: async () => {
    try {
      const response = await apiClient.get('/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/events/create', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  registerForEvent: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelRegistration: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await apiClient.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default eventsService;
