import api from './api';

export const notificationService = {
  getAll: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },

  syncReminders: async () => {
    const res = await api.post('/notifications/sync');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/mark-all-read');
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationService;