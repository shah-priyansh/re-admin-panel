import api from './api';

// Get all Trustap transactions with search, filter, and pagination
export const getTrustapTransactions = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = '', pay_status = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (pay_status) queryParams.append('pay_status', pay_status);

  const response = await api.get(`/v2/trustap-transactions?${queryParams.toString()}`);
  return response.data;
};

