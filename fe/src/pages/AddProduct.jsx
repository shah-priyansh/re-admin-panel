import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { getCategories, getSubCategories, getBrands, getSizes, getConditions, getColors, getMaterials } from '../services/masterService';

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
    sub_sub_category_id: '',
    brand_id: '',
    brand_other: false, // Track if "Other" is selected for brand
    custom_brand: '',
    size_id: '',
    condition_id: '',
    color_ids: [],
    color_other: false, // Track if "Other" is selected for color
    custom_color: '',
    material_ids: [],
    material_other: false, // Track if "Other" is selected for material
    custom_material: '',
  });
  
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Master data options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubCategories(formData.category_id);
    } else {
      setSubCategories([]);
      setSubSubCategories([]);
      setSizes([]);
      setFormData(prev => ({ ...prev, sub_category_id: '', sub_sub_category_id: '', size_id: '' }));
    }
  }, [formData.category_id]);

  useEffect(() => {
    if (formData.sub_category_id) {
      fetchSubSubCategories(formData.sub_category_id);
    } else {
      setSubSubCategories([]);
      setSizes([]);
      setFormData(prev => ({ ...prev, sub_sub_category_id: '', size_id: '' }));
    }
  }, [formData.sub_category_id]);

  useEffect(() => {
    if (formData.sub_sub_category_id) {
      fetchSizes(formData.sub_sub_category_id);
    } else {
      setSizes([]);
      setFormData(prev => ({ ...prev, size_id: '' }));
    }
  }, [formData.sub_sub_category_id]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes, conditionsRes, colorsRes, materialsRes] = await Promise.all([
        getCategories(),
        getBrands(),
        getConditions(),
        getColors(),
        getMaterials(),
      ]);
      
      if (categoriesRes?.list) {
        setCategories(categoriesRes.list);
      }
      if (brandsRes?.list) {
        setBrands(brandsRes.list);
      }
      if (conditionsRes?.list) {
        setConditions(conditionsRes.list);
      }
      if (colorsRes?.list) {
        setColors(colorsRes.list);
      }
      if (materialsRes?.list) {
        setMaterials(materialsRes.list);
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await getSubCategories(categoryId);
      if (response?.list) {
        setSubCategories(response.list);
      }
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
      setSubCategories([]);
    }
  };

  const fetchSubSubCategories = async (subCategoryId) => {
    try {
      const response = await getSubCategories(subCategoryId);
      if (response?.list) {
        setSubSubCategories(response.list);
      }
    } catch (err) {
      console.error('Error fetching sub-sub-categories:', err);
      setSubSubCategories([]);
    }
  };

  const fetchSizes = async (subCategoryId) => {
    try {
      const response = await getSizes(subCategoryId);
      if (response?.list) {
        setSizes(response.list);
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

  const handleColorChange = (colorId) => {
    if (colorId === 'other') {
      // Toggle "Other" option
      setFormData((prev) => ({
        ...prev,
        color_other: !prev.color_other,
        color_ids: prev.color_other ? prev.color_ids : [], // Clear selected colors if enabling other
        custom_color: prev.color_other ? '' : prev.custom_color, // Clear custom if disabling other
      }));
      return;
    }

    const numColorId = parseInt(colorId);
    setFormData((prev) => {
      const currentColors = prev.color_ids || [];
      const colorIndex = currentColors.indexOf(numColorId);
      
      if (colorIndex > -1) {
        // Remove color
        return {
          ...prev,
          color_ids: currentColors.filter(id => id !== numColorId),
        };
      } else {
        // Add color (max 2)
        if (currentColors.length >= 2) {
          setError('Maximum 2 colors allowed');
          return prev;
        }
        if (prev.color_other) {
          setError('Please select colors from the list or use "Other", not both');
          return prev;
        }
        setError('');
        return {
          ...prev,
          color_ids: [...currentColors, numColorId],
          color_other: false, // Disable other if selecting from list
          custom_color: '', // Clear custom color if selecting from list
        };
      }
    });
  };

  const handleMaterialChange = (materialId) => {
    if (materialId === 'other') {
      // Toggle "Other" option
      setFormData((prev) => ({
        ...prev,
        material_other: !prev.material_other,
        material_ids: prev.material_other ? prev.material_ids : [], // Clear selected materials if enabling other
        custom_material: prev.material_other ? '' : prev.custom_material, // Clear custom if disabling other
      }));
      return;
    }

    const numMaterialId = parseInt(materialId);
    setFormData((prev) => {
      const currentMaterials = prev.material_ids || [];
      const materialIndex = currentMaterials.indexOf(numMaterialId);
      
      if (materialIndex > -1) {
        // Remove material
        return {
          ...prev,
          material_ids: currentMaterials.filter(id => id !== numMaterialId),
        };
      } else {
        // Add material (max 3)
        if (currentMaterials.length >= 3) {
          setError('Maximum 3 materials allowed');
          return prev;
        }
        if (prev.material_other) {
          setError('Please select materials from the list or use "Other", not both');
          return prev;
        }
        setError('');
        return {
          ...prev,
          material_ids: [...currentMaterials, numMaterialId],
          material_other: false, // Disable other if selecting from list
          custom_material: '', // Clear custom material if selecting from list
        };
      }
    });
  };

  const handleCustomColorChange = (e) => {
    const value = e.target.value;
    setError('');
    setFormData((prev) => ({
      ...prev,
      custom_color: value,
    }));
  };

  const handleCustomMaterialChange = (e) => {
    const value = e.target.value;
    setError('');
    setFormData((prev) => ({
      ...prev,
      custom_material: value,
    }));
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    const isOther = value === 'other';
    setError('');
    setFormData((prev) => ({
      ...prev,
      brand_id: isOther ? '' : value,
      brand_other: isOther,
      custom_brand: isOther ? prev.custom_brand : '', // Keep custom_brand if switching to other
    }));
  };

  const handleCustomBrandChange = (e) => {
    const value = e.target.value;
    setError('');
    setFormData((prev) => ({
      ...prev,
      custom_brand: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate max 20 images
    if (newImages.length + files.length > 20) {
      setError('Maximum 20 images allowed');
      return;
    }
    
    setNewImages((prev) => [...prev, ...files]);
    setError('');
    
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

  const handleSubmit = async (e, isPublish = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validation
    if (formData.brand_other && !formData.custom_brand?.trim()) {
      setError('Please enter a custom brand name');
      setSaving(false);
      return;
    }

    if (formData.color_other && !formData.custom_color?.trim()) {
      setError('Please enter a custom color name');
      setSaving(false);
      return;
    }

    if (formData.material_other && !formData.custom_material?.trim()) {
      setError('Please enter a custom material name');
      setSaving(false);
      return;
    }

    if (newImages.length > 20) {
      setError('Maximum 20 images allowed');
      setSaving(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('user_id', userId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      
      if (formData.category_id) {
        formDataToSend.append('category_id', formData.category_id);
      }
      
      // Store Sub Sub Category in sub_sub_category_id (API will store it in sub_category_id field)
      if (formData.sub_sub_category_id) {
        formDataToSend.append('sub_sub_category_id', formData.sub_sub_category_id);
      }
      
      if (formData.brand_id) {
        formDataToSend.append('brand_id', formData.brand_id);
      }
      if (formData.custom_brand && formData.custom_brand.trim()) {
        formDataToSend.append('custom_brand', formData.custom_brand);
      }
      
      if (formData.size_id) {
        formDataToSend.append('size_id', formData.size_id);
      }
      
      if (formData.condition_id) {
        formDataToSend.append('condition_id', formData.condition_id);
      }
      
      if (formData.color_ids && formData.color_ids.length > 0) {
        formDataToSend.append('color_ids', JSON.stringify(formData.color_ids));
      }
      if (formData.custom_color && formData.custom_color.trim()) {
        formDataToSend.append('custom_color', formData.custom_color);
      }
      
      if (formData.material_ids && formData.material_ids.length > 0) {
        formDataToSend.append('material_ids', JSON.stringify(formData.material_ids));
      }
      if (formData.custom_material && formData.custom_material.trim()) {
        formDataToSend.append('custom_material', formData.custom_material);
      }
      
      // Set publish flag: true for publish, false for draft
      formDataToSend.append('publish', isPublish ? 'true' : 'false');

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

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              {/* 1. Title */}
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

              {/* 2. Description */}
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

              {/* 3. Brand -> Other (Max 1) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand (Max 1)
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_other ? 'other' : formData.brand_id}
                  onChange={handleBrandChange}
                  className="input-field w-full"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.brand_other && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Brand Name *
                  </label>
                  <input
                    type="text"
                    name="custom_brand"
                    value={formData.custom_brand}
                    onChange={handleCustomBrandChange}
                    placeholder="Enter custom brand name"
                    required={formData.brand_other}
                    className="input-field w-full"
                  />
                </div>
              )}

              {/* 4. Category -> Sub Category -> Sub Sub Category */}
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
                  Sub Sub Category
                </label>
                <select
                  name="sub_sub_category_id"
                  value={formData.sub_sub_category_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  disabled={!formData.sub_category_id}
                >
                  <option value="">Select Sub Sub Category</option>
                  {subSubCategories.map((subSubCat) => (
                    <option key={subSubCat.id} value={subSubCat.id}>
                      {subSubCat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Size (Max 1) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size (Max 1)
                </label>
                <select
                  name="size_id"
                  value={formData.size_id}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  disabled={!formData.sub_sub_category_id}
                >
                  <option value="">Select Size</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Material -> Other (Max 3) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material (Max 3)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                  {materials.map((material) => (
                    <label key={material.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.material_ids?.includes(material.id) || false}
                        onChange={() => handleMaterialChange(material.id)}
                        disabled={formData.material_other}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{material.name}</span>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.material_other || false}
                      onChange={() => handleMaterialChange('other')}
                      disabled={formData.material_ids?.length > 0}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">Other</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.material_ids?.length || 0}/3
                </p>
              </div>

              {formData.material_other && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Material Name *
                  </label>
                  <input
                    type="text"
                    name="custom_material"
                    value={formData.custom_material}
                    onChange={handleCustomMaterialChange}
                    placeholder="Enter custom material name"
                    required={formData.material_other}
                    className="input-field w-full"
                  />
                </div>
              )}

              {/* 7. Color -> Other (Max 2) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color (Max 2)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                  {colors.map((color) => (
                    <label key={color.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.color_ids?.includes(color.id) || false}
                        onChange={() => handleColorChange(color.id)}
                        disabled={formData.color_other}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{color.name}</span>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.color_other || false}
                      onChange={() => handleColorChange('other')}
                      disabled={formData.color_ids?.length > 0}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">Other</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.color_ids?.length || 0}/2
                </p>
              </div>

              {formData.color_other && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Color Name *
                  </label>
                  <input
                    type="text"
                    name="custom_color"
                    value={formData.custom_color}
                    onChange={handleCustomColorChange}
                    placeholder="Enter custom color name"
                    required={formData.color_other}
                    className="input-field w-full"
                  />
                </div>
              )}

              {/* 8. Condition (Max 1) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition (Max 1)
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

              {/* 9. Price */}
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

            </div>

          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images (Max 20)</h2>
              
              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uploaded Images ({imagePreviews.length}/20)
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
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Max 20 images)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={newImages.length >= 20}
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
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="btn-secondary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Publishing...' : 'Save as Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
