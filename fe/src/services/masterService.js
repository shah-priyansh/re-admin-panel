import api from './api';

// Get all categories
export const getCategories = async () => {
  const response = await api.post('/product/category-master');
  return response.data;
};

// Get sub-categories by category ID
export const getSubCategories = async (categoryId) => {
  const response = await api.post('/product/sub-category-master', {
    category: categoryId.toString()
  });
  return response.data;
};

// Get all brands
export const getBrands = async () => {
  const response = await api.post('/product/brand-master');
  return response.data;
};

// Get sizes by sub category ID
export const getSizes = async (subCategoryId) => {
  const response = await api.post('/product/size-master', {
    sub_category: subCategoryId.toString()
  });
  return response.data;
};

// Get all conditions
export const getConditions = async () => {
  const response = await api.post('/product/condition-master');
  return response.data;
};

// Get all colors
export const getColors = async () => {
  const response = await api.post('/product/color-master');
  return response.data;
};

// Get all materials
export const getMaterials = async () => {
  const response = await api.post('/product/material-master');
  return response.data;
};
