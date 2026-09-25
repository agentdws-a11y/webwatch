import api from './api';

export const maintenanceService = {
  getLogs: async (params = {}) => {
    const res = await api.get('/maintenance/logs', { params });
    return res.data.data;
  },

  createLog: async (logData) => {
    const res = await api.post('/maintenance/logs', logData);
    return res.data.data;
  },

  deleteLog: async (id) => {
    const res = await api.delete(`/maintenance/logs/${id}`);
    return res.data;
  },
};

export default maintenanceService;
