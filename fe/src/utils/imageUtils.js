/**
 * Constructs a full image URL from a relative path
 * Handles cases where base URL might or might not have trailing slash
 * and image path might or might not have leading slash
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const baseUrl = import.meta.env.VITE_IMAGE_URL || '';
  
  // If no base URL, return the path as is (might be relative)
  if (!baseUrl) {
    return imagePath;
  }
  
  // Remove trailing slash from base URL
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  
  // Remove leading slash from image path
  const cleanImagePath = imagePath.replace(/^\/+/, '');
  
  return `${cleanBaseUrl}/${cleanImagePath}`;
};




