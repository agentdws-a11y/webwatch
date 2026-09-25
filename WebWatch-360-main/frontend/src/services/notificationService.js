import api from './api';

const notificationService = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  getUnread: async () => {
    try {
      const response = await api.get('/notifications/unread');
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data?.data;
    } catch {
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data?.data;
    } catch {
      return null;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data?.data;
    } catch {
      return null;
    }
  },
};

export default notificationService;