import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { getCategories, getSubCategories, getBrands, getSizes, getConditions } from '../services/masterService';

const AddProduct = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    sub_category_id: '',
    brand_id: '',
    custom_brand: '',
    size_id: '',
    condition_id: '',
    status: true,
    is_approved: true,
    search_tags: '',
  });
  
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Master data options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubCategories(formData.category_id);
      fetchSizes(formData.category_id);
    } else {
      setSubCategories([]);
      setSizes([]);
      setFormData(prev => ({ ...prev, sub_category_id: '', size_id: '' }));
    }
  }, [formData.category_id]);

  useEffect(() => {
    if (formData.sub_category_id) {
      fetchBrands('', formData.sub_category_id);
    } else {
      fetchBrands();
    }
  }, [formData.sub_category_id]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, conditionsRes] = await Promise.all([
        getCategories(),
        getConditions(),
      ]);
      
      if (categoriesRes?.data) {
        setCategories(categoriesRes.data);
      }
      if (conditionsRes?.data) {
        setConditions(conditionsRes.data);
      }
      
      // Fetch all brands initially
      await fetchBrands();
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await getSubCategories(categoryId);
      if (response?.data) {
        setSubCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
      setSubCategories([]);
    }
  };

  const fetchBrands = async (search = '', subCategoryId = '') => {
    try {
      const response = await getBrands(search, subCategoryId);
      if (response?.data) {
        setBrands(response.data);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  };

  const fetchSizes = async (categoryId) => {
    try {
      const response = await getSizes(categoryId);
      if (response?.data) {
        setSizes(response.data);
      }
    } catch (err) {
      console.error('Error fetching sizes:', err);
      setSizes([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('user_id', userId);
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        // Skip empty strings, null, undefined, but allow 0 and false
        if (value !== '' && value !== null && value !== undefined) {
          // Convert empty strings for IDs to 0
          if ((key.includes('_id') || key === 'category_id' || key === 'sub_category_id' || key === 'brand_id' || key === 'size_id' || key === 'condition_id') && value === '') {
            return; // Skip empty ID fields
          }
          formDataToSend.append(key, value);
        }
      });

      // Add new images
      newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await api.post('/v2/product/admin/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/users/${userId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/users/${userId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to User
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Product created successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (AED) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <select
                  name="sub_category_id"
                  value={formData.sub_category_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  disabled={!formData.category_id}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Brand
                </label>
                <input
                  type="text"
                  name="custom_brand"
                  value={formData.custom_brand}
                  onChange={handleInputChange}
                  placeholder="Enter custom brand name"
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Use this if brand is not in the list above</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  name="size_id"
                  value={formData.size_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  disabled={!formData.category_id}
                >
                  <option value="">Select Size</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition_id"
                  value={formData.condition_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">Select Condition</option>
                  {conditions.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Tags
                </label>
                <input
                  type="text"
                  name="search_tags"
                  value={formData.search_tags}
                  onChange={handleInputChange}
                  placeholder="Comma-separated tags"
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Status Options */}
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Status</h2>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_approved"
                  checked={formData.is_approved}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Approved</span>
              </label>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
              
              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uploaded Images
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`New image ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Images
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/users/${userId}`)}
            className="btn-secondary px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

