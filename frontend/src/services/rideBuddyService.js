import apiClient from './apiClient';

const rideBuddyService = {
  getRides: async (filters = {}) => {
    try {
      const params = {};
      if (filters.fromLocation) params.fromLocation = filters.fromLocation;
      if (filters.toLocation) params.toLocation = filters.toLocation;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.status) params.status = filters.status;

      const response = await apiClient.get('/rides', { params });
      return response.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createRide: async (rideData) => {
    try {
      const response = await apiClient.post('/rides', rideData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendPairRequest: async (rideId) => {
    try {
      const response = await apiClient.post(`/rides/${rideId}/pair-request`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  respondToPairRequest: async (rideId, { requestUserId, status }) => {
    try {
      const response = await apiClient.put(`/rides/${rideId}/pair-request`, {
        requestUserId,
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteRide: async (rideId) => {
    try {
      const response = await apiClient.delete(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default rideBuddyService;
