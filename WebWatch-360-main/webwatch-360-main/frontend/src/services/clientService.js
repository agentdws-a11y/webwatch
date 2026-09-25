import api from './api';

const clientService = {
  getAll: async (search = '') => {
    const response = await api.get('/clients', { params: { search } });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  },

  create: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data.data;
  },

  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data.data;
  },
};

export default clientService;
