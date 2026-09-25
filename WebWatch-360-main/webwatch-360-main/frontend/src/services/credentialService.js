import api from './api';

export const credentialService = {
  getAll: async (params = {}) => {
    const res = await api.get('/credentials', { params });
    return res.data.data;
  },

  create: async (credentialData) => {
    const res = await api.post('/credentials', credentialData);
    return res.data.data;
  },

  update: async (id, credentialData) => {
    const res = await api.put(`/credentials/${id}`, credentialData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/credentials/${id}`);
    return res.data;
  },
};

export default credentialService;
