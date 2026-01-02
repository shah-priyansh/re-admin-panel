import api from './api';

// Get all categories
export const getCategories = async () => {
  const response = await api.get('/v2/master/categories');
  return response.data;
};

// Get sub-categories by category ID
export const getSubCategories = async (categoryId) => {
  const response = await api.get(`/v2/master/sub-categories?category_id=${categoryId}`);
  return response.data;
};

// Get all brands
export const getBrands = async (search = '', subCategoryId = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (subCategoryId) params.append('sub_category_id', subCategoryId);
  const response = await api.get(`/v2/master/brands?${params.toString()}`);
  return response.data;
};

// Get sizes by category ID (optional)
export const getSizes = async (categoryId = '') => {
  const params = categoryId ? `?category_id=${categoryId}` : '';
  const response = await api.get(`/v2/master/sizes${params}`);
  return response.data;
};

// Get all conditions
export const getConditions = async () => {
  const response = await api.get('/v2/master/conditions');
  return response.data;
};

