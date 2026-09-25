import api from './api';

const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data.data;
  },
};

export default dashboardService;
