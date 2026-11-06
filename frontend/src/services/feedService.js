import apiClient from './apiClient';

const feedService = {
  getPosts: async ({ searchQuery, filterTag, sortBy, showSaved } = {}) => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterTag) params.tags = filterTag;
      if (sortBy && sortBy !== 'newest') params.sort = sortBy;

      const endpoint = showSaved ? '/posts/saved' : '/posts';
      const response = await apiClient.get(endpoint, { params });
      return response.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPost: async ({ content, tags }) => {
    try {
      const response = await apiClient.post('/posts', { content, tags });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  upvote: async (postId) => {
    try {
      const response = await apiClient.put(`/posts/${postId}/upvote`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downvote: async (postId) => {
    try {
      const response = await apiClient.put(`/posts/${postId}/downvote`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  save: async (postId) => {
    try {
      const response = await apiClient.put(`/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePost: async (postId, { content, tags }) => {
    try {
      const response = await apiClient.put(`/posts/${postId}`, { content, tags });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await apiClient.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getComments: async (postId) => {
    try {
      const response = await apiClient.get(`/comments/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createComment: async (postId, { content }) => {
    try {
      const response = await apiClient.post(`/comments/${postId}`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateComment: async (commentId, { content }) => {
    try {
      const response = await apiClient.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default feedService;
