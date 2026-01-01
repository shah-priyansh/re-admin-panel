import api from './api';

// Get all users with pagination and search
export const getUsers = async (params = {}) => {
  const { page = 1, limit = 10, search = '', type = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (type) queryParams.append('type', type);

  const response = await api.get(`/v2/user?${queryParams.toString()}`);
  return response.data;
};

// Get single user by ID
export const getUserById = async (userId) => {
  const response = await api.get(`/v2/user/user-info?user_id=${userId}`);
  return response.data;
};

// Update user - Admin endpoint
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/v2/user/${userId}`, userData);
    return response.data;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

// Get user products - Admin endpoint
export const getUserProducts = async (userId, params = {}) => {
  const { page = 1, status = 0 } = params;
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/v2/user/${userId}/products?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching user products:', err);
    return { data: [], pagination: {} };
  }
};

// Get user orders - Admin endpoint
export const getUserOrders = async (userId, params = {}) => {
  const { page = 1, type = 0, status = '' } = params;
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/v2/user/${userId}/orders?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching user orders:', err);
    return { data: [], pagination: {} };
  }
};

// Get user transactions - Admin endpoint
export const getUserTransactions = async (userId) => {
  try {
    const response = await api.get(`/v2/user/${userId}/transactions`);
    return response.data;
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    return { data: [], pending_balance: 0 };
  }
};

// Get user trustap account info - Admin endpoint
export const getUserTrustapInfo = async (userId) => {
  try {
    const response = await api.get(`/v2/user/${userId}/trustap`);
    return response.data;
  } catch (err) {
    console.error('Error fetching trustap info:', err);
    return null;
  }
};

// Get reviews given to user (received reviews) - Admin endpoint
export const getUserReviewsReceived = async (userId, params = {}) => {
  const { page = 1 } = params;
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    
    const response = await api.get(`/v2/user/${userId}/reviews/received?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching reviews received:', err);
    return { data: [], pagination: {} };
  }
};

// Get reviews given by user - Admin endpoint
export const getUserReviewsGiven = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    
    const response = await api.get(`/v2/user/${userId}/reviews/given?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching reviews given:', err);
    return { data: [], pagination: {} };
  }
};

