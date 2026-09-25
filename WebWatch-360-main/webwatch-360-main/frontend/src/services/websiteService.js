import api from './api';

const websiteService = {
  getAll: async (params = {}) => {
    const response = await api.get('/websites', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/websites/${id}`);
    return response.data.data;
  },

  create: async (websiteData) => {
    const response = await api.post('/websites', websiteData);
    return response.data.data;
  },

  update: async (id, websiteData) => {
    const response = await api.put(`/websites/${id}`, websiteData);
    return response.data.data;
  },

  archive: async (id) => {
    const response = await api.patch(`/websites/${id}/archive`);
    return response.data.data;
  },

  restore: async (id) => {
    const response = await api.patch(`/websites/${id}/restore`);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/websites/${id}`);
    return response.data.data;
  },
};

export default websiteService;