import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const BulkUploadProducts = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [productsFile, setProductsFile] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentProduct: '' });
  const [results, setResults] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  
  const productsFileInputRef = useRef(null);
  const imagesFileInputRef = useRef(null);

  const handleProductsFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError('Please select a valid JSON file');
        return;
      }
      setProductsFile(file);
      setError('');
    }
  };

  const handleImagesFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesFiles((prev) => [...prev, ...files]);
    setError('');
  };

  const removeImageFile = (index) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const parseProductsFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const products = JSON.parse(e.target.result);
          if (!Array.isArray(products)) {
            reject(new Error('Products file must contain an array of products'));
            return;
          }
          resolve(products);
        } catch (err) {
          reject(new Error('Invalid JSON file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const uploadProduct = async (productData, imageFilesMap) => {
    const formData = new FormData();
    
    // Add product fields
    formData.append('user_id', selectedUserId);
    Object.keys(productData).forEach((key) => {
      if (key !== 'images' && productData[key] !== undefined && productData[key] !== null && productData[key] !== '') {
        if (typeof productData[key] === 'boolean') {
          formData.append(key, productData[key] ? 'true' : 'false');
        } else {
          formData.append(key, String(productData[key]));
        }
      }
    });

    // Add images for this product
    if (productData.images && Array.isArray(productData.images)) {
      for (const imageName of productData.images) {
        const imageFile = imageFilesMap[imageName];
        if (imageFile) {
          formData.append('images', imageFile);
        }
      }
    }

    const response = await api.post('/v2/product/admin/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productsFile) {
      setError('Please select a products JSON file');
      return;
    }

    if (!selectedUserId) {
      setError('Please enter a User ID');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);
    setResults(null);

    try {
      // Parse products JSON file
      const products = await parseProductsFile(productsFile);
      
      // Create a map of image files by filename
      const imageFilesMap = {};
      imagesFiles.forEach((file) => {
        imageFilesMap[file.name] = file;
      });

      const uploadResults = {
        success: [],
        failed: [],
      };

      setUploadProgress({ current: 0, total: products.length, currentProduct: '' });

      // Upload products one by one
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setUploadProgress({
          current: i + 1,
          total: products.length,
          currentProduct: product.title || `Product ${i + 1}`,
        });

        try {
          const result = await uploadProduct(product, imageFilesMap);
          uploadResults.success.push({
            index: i + 1,
            title: product.title,
            productId: result.data?.id,
          });
        } catch (err) {
          uploadResults.failed.push({
            index: i + 1,
            title: product.title,
            error: err.response?.data?.message || err.message,
          });
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setResults(uploadResults);
      setSuccess(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        setProductsFile(null);
        setImagesFiles([]);
        if (productsFileInputRef.current) productsFileInputRef.current.value = '';
        if (imagesFileInputRef.current) imagesFileInputRef.current.value = '';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to process bulk upload');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, currentProduct: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(userId ? `/users/${userId}` : '/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {userId ? 'Back to User' : 'Back to Products'}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Products</h1>

      {/* User ID Input (if not provided in URL) */}
      {!userId && (
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID *
          </label>
          <input
            type="number"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder="Enter User ID"
            required
            className="input-field w-full max-w-md"
          />
          <p className="text-xs text-gray-500 mt-1">Enter the ID of the user to add products for</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Bulk upload completed!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress.total > 0 && (
        <div className="card p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Uploading: {uploadProgress.currentProduct}
              </span>
              <span className="text-sm text-gray-500">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {results && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{results.success.length + results.failed.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Success</p>
              <p className="text-2xl font-bold text-green-700">{results.success.length}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-700">{results.failed.length}</p>
            </div>
          </div>

          {results.failed.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed Products</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.failed.map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      [{item.index}] {item.title}
                    </p>
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Products JSON */}
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Products JSON File</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Products JSON File *
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <DocumentIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> JSON file
                  </p>
                  <p className="text-xs text-gray-500">Products data in JSON format</p>
                </div>
                <input
                  ref={productsFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".json,application/json"
                  onChange={handleProductsFileChange}
                />
              </label>
              {productsFile && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{productsFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductsFile(null);
                      if (productsFileInputRef.current) productsFileInputRef.current.value = '';
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">JSON Format:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`[
  {
    "title": "Product Title",
    "description": "Description",
    "price": 100.00,
    "category_id": 1,
    "images": ["image1.jpg", "image2.jpg"]
  }
]`}
              </pre>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image Files
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> images
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (multiple files)</p>
                </div>
                <input
                  ref={imagesFileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImagesFileChange}
                />
              </label>
            </div>

            {imagesFiles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({imagesFiles.length})
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {imagesFiles.map((file, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>Note:</strong> Image filenames in the JSON file should match the uploaded image files. 
                The images will be matched by filename.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(userId ? `/users/${userId}` : '/products')}
            className="btn-secondary px-6"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !productsFile}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Start Bulk Upload'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkUploadProducts;

