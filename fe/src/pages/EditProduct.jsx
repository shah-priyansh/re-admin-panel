import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { getProductById } from '../services/productService';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { getCategories, getSubCategories, getBrands, getSizes, getConditions, getColors, getMaterials } from '../services/masterService';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    sub_category_id: '',
    sub_sub_category_id: '',
    brand_id: '',
    brand_other: false,
    custom_brand: '',
    size_id: '',
    condition_id: '',
    color_ids: [],
    color_other: false,
    custom_color: '',
    material_ids: [],
    material_other: false,
    custom_material: '',
    status: true,
    is_approved: true,
    is_sold: false,
    is_hidden: false,
    search_tags: '',
  });
  
  const [existingImages, setExistingImages] = useState([]);
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
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubCategories(formData.category_id);
    } else {
      setSubCategories([]);
      setSubSubCategories([]);
      setSizes([]);
    }
  }, [formData.category_id]);

  useEffect(() => {
    if (formData.sub_category_id) {
      fetchSubSubCategories(formData.sub_category_id);
    } else {
      setSubSubCategories([]);
      setSizes([]);
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
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProductById(id);
      if (response.data) {
        const productData = response.data;
        setProduct(productData);
        
        // Parse color_ids and material_ids from JSON strings
        let colorIds = [];
        let materialIds = [];
        
        try {
          if (productData.color_ids) {
            colorIds = typeof productData.color_ids === 'string' 
              ? JSON.parse(productData.color_ids) 
              : productData.color_ids;
          }
        } catch (e) {
          console.error('Error parsing color_ids:', e);
        }
        
        try {
          if (productData.material_ids) {
            materialIds = typeof productData.material_ids === 'string' 
              ? JSON.parse(productData.material_ids) 
              : productData.material_ids;
          }
        } catch (e) {
          console.error('Error parsing material_ids:', e);
        }

        // Determine "Other" states
        const brandOther = !productData.brand_id && productData.custom_brand && productData.custom_brand.trim();
        const colorOther = (!colorIds || colorIds.length === 0) && productData.custom_color && productData.custom_color.trim();
        const materialOther = (!materialIds || materialIds.length === 0) && productData.custom_material && productData.custom_material.trim();

        setFormData({
          title: productData.title || '',
          description: productData.description || '',
          price: productData.price || '',
          category_id: productData.category_id || '',
          sub_category_id: '', // Will be determined from sub_sub_category_id
          sub_sub_category_id: productData.sub_category_id || '', // sub_category_id stores Sub Sub Category
          brand_id: productData.brand_id || '',
          brand_other: brandOther,
          custom_brand: productData.custom_brand || '',
          size_id: productData.size_id || '',
          condition_id: productData.condition_id || '',
          color_ids: colorIds || [],
          color_other: colorOther,
          custom_color: productData.custom_color || '',
          material_ids: materialIds || [],
          material_other: materialOther,
          custom_material: productData.custom_material || '',
          status: productData.status !== undefined ? productData.status : true,
          is_approved: productData.is_approved !== undefined ? productData.is_approved : true,
          is_sold: productData.is_sold || false,
          is_hidden: productData.is_hidden || false,
          search_tags: productData.search_tags || '',
        });
        
        setExistingImages(productData.images || []);

        // Load category hierarchy if category exists
        if (productData.category_id) {
          await fetchSubCategories(productData.category_id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await getSubCategories(categoryId);
      if (response?.list) {
        setSubCategories(response.list);
        // If we have a sub_sub_category_id, find its parent sub_category
        if (formData.sub_sub_category_id) {
          // Find which sub_category contains this sub_sub_category
          // We'll need to check each sub_category to find the one that has this as a child
          for (const subCat of response.list) {
            try {
              const subSubRes = await getSubCategories(subCat.id);
              if (subSubRes?.list?.some(ssc => ssc.id === parseInt(formData.sub_sub_category_id))) {
                setFormData(prev => ({ ...prev, sub_category_id: subCat.id.toString() }));
                break;
              }
            } catch (e) {
              // Continue checking
            }
          }
        }
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

  const handleBrandChange = (e) => {
    const value = e.target.value;
    const isOther = value === 'other';
    setError('');
    setFormData((prev) => ({
      ...prev,
      brand_id: isOther ? '' : value,
      brand_other: isOther,
      custom_brand: isOther ? prev.custom_brand : '',
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

  const handleColorChange = (colorId) => {
    if (colorId === 'other') {
      setFormData((prev) => ({
        ...prev,
        color_other: !prev.color_other,
        color_ids: prev.color_other ? prev.color_ids : [],
        custom_color: prev.color_other ? '' : prev.custom_color,
      }));
      return;
    }

    const numColorId = parseInt(colorId);
    setFormData((prev) => {
      const currentColors = prev.color_ids || [];
      const colorIndex = currentColors.indexOf(numColorId);
      
      if (colorIndex > -1) {
        return {
          ...prev,
          color_ids: currentColors.filter(id => id !== numColorId),
        };
      } else {
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
          color_other: false,
          custom_color: '',
        };
      }
    });
  };

  const handleMaterialChange = (materialId) => {
    if (materialId === 'other') {
      setFormData((prev) => ({
        ...prev,
        material_other: !prev.material_other,
        material_ids: prev.material_other ? prev.material_ids : [],
        custom_material: prev.material_other ? '' : prev.custom_material,
      }));
      return;
    }

    const numMaterialId = parseInt(materialId);
    setFormData((prev) => {
      const currentMaterials = prev.material_ids || [];
      const materialIndex = currentMaterials.indexOf(numMaterialId);
      
      if (materialIndex > -1) {
        return {
          ...prev,
          material_ids: currentMaterials.filter(id => id !== numMaterialId),
        };
      } else {
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
          material_other: false,
          custom_material: '',
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (existingImages.length + newImages.length + files.length > 20) {
      setError('Maximum 20 images allowed');
      return;
    }
    
    setNewImages((prev) => [...prev, ...files]);
    setError('');
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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

    if (existingImages.length + newImages.length > 20) {
      setError('Maximum 20 images allowed');
      setSaving(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      
      if (formData.category_id) {
        formDataToSend.append('category_id', formData.category_id);
      }
      
      if (formData.sub_sub_category_id) {
        formDataToSend.append('sub_category_id', formData.sub_sub_category_id);
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
      
      formDataToSend.append('status', formData.status ? 'true' : 'false');
      formDataToSend.append('is_approved', formData.is_approved ? 'true' : 'false');
      formDataToSend.append('is_sold', formData.is_sold ? 'true' : 'false');
      formDataToSend.append('is_hidden', formData.is_hidden ? 'true' : 'false');
      
      if (formData.search_tags) {
        formDataToSend.append('search_tags', formData.search_tags);
      }

      newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      existingImages.forEach((img, index) => {
        formDataToSend.append(`existingImages[${index}]`, img.full || img.thumb);
      });

      await api.put(`/v2/product/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/products/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
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

  if (!product) {
    return (
      <div className="card p-6">
        <p className="text-gray-500">Product not found</p>
        <button onClick={() => navigate('/products')} className="btn-secondary mt-4">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Product
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Product updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (AED) *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Sub Category</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand (Max 1)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Brand Name *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (Max 1)</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material (Max 3)</label>
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
                <p className="text-xs text-gray-500 mt-1">Selected: {formData.material_ids?.length || 0}/3</p>
              </div>

              {formData.material_other && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Material Name *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color (Max 2)</label>
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
                <p className="text-xs text-gray-500 mt-1">Selected: {formData.color_ids?.length || 0}/2</p>
              </div>

              {formData.color_other && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Color Name *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition (Max 1)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Tags</label>
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

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_sold"
                  checked={formData.is_sold}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Sold</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_hidden"
                  checked={formData.is_hidden}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Hidden</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images (Max 20)</h2>
              
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Images ({existingImages.length})
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(img.thumb || img.full)}
                          alt={`${product.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Images ({imagePreviews.length})
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
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
                    disabled={existingImages.length + newImages.length >= 20}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="btn-secondary px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
