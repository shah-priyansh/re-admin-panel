import api from './api';

// Get all products with pagination and search
export const getProducts = async (params = {}) => {
  const { page = 1, limit = 10, search = '', category_id = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (category_id) queryParams.append('category_id', category_id);

  const response = await api.get(`/v2/product/all?${queryParams.toString()}`);
  return response.data;
};

// Get single product by ID
export const getProductById = async (productId) => {
  const response = await api.get(`/v2/product/${productId}`);
  return response.data;
};

// Update product - This is handled directly in EditProduct component
// Keeping for consistency but actual implementation uses api directly
export const updateProduct = async (productId, productData) => {
  const formData = new FormData();
  
  // Add product fields
  Object.keys(productData).forEach((key) => {
    if (key !== 'images' && key !== 'newImages') {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    }
  });

  // Add new images if any
  if (productData.newImages && productData.newImages.length > 0) {
    productData.newImages.forEach((file) => {
      formData.append('images', file);
    });
  }

  // Add existing image URLs if any
  if (productData.images && Array.isArray(productData.images)) {
    productData.images.forEach((imageUrl, index) => {
      formData.append(`existingImages[${index}]`, imageUrl);
    });
  }

  const response = await api.put(`/v2/product/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete product
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/v2/product?id=${productId}`);
  return response.data;
};

