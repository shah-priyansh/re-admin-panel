import api from './api';

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/v2/dashboard/stats');
  return response.data;
};

