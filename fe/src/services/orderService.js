import api from './api';

// Get all orders with pagination and search
export const getOrders = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);

  const response = await api.get(`/v2/order?${queryParams.toString()}`);
  return response.data;
};

// Get single order by ID with tracking info
export const getOrderById = async (orderId) => {
  const response = await api.get(`/v2/order/${orderId}`);
  return response.data;
};

// Get all return requests with pagination and search
export const getReturnRequests = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);

  const response = await api.get(`/v2/chat/return-request?${queryParams.toString()}`);
  return response.data;
};

// Get return request detail
export const getReturnRequestById = async (returnRequestId) => {
  const response = await api.get(`/v2/chat/return-request/${returnRequestId}`);
  return response.data;
};

// Approve return request
export const approveReturnRequest = async (orderId) => {
  const response = await api.post(`/v2/chat/approve-return-request/${orderId}`);
  return response.data;
};

// Reject return request
export const rejectReturnRequest = async (orderId) => {
  const response = await api.post(`/v2/chat/reject-return-request/${orderId}`);
  return response.data;
};

