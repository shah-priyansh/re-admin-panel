import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { getProductById } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProductById(id);
      if (response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/products')} className="btn-secondary mt-4">
          Back to Products
        </button>
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

  const images = product.images || [];
  const mainImage = images[selectedImageIndex]?.full || product.mainImage || null;
  
  // Data URI for placeholder (prevents network calls)
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Products
        </button>
        <button
          onClick={() => navigate(`/products/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <PencilIcon className="h-5 w-5" />
          Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {mainImage ? (
              <img
                src={getImageUrl(mainImage)}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={(e) => {
                  // Prevent infinite loop
                  if (e.target.dataset.errorHandled === 'true') {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                    return;
                  }
                  e.target.dataset.errorHandled = 'true';
                  e.target.src = placeholderImage;
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg
                  className="w-24 h-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => {
                const imgSrc = img.thumb || img.full;
                const fullImgSrc = getImageUrl(imgSrc);
                
                return (
                  <button
                    key={img.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 relative bg-gray-100 ${
                      selectedImageIndex === index
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={fullImgSrc}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        // Prevent infinite loop
                        if (e.target.dataset.errorHandled === 'true') {
                          e.target.style.display = 'none';
                          return;
                        }
                        e.target.dataset.errorHandled = 'true';
                        e.target.src = placeholderImage;
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-3xl font-bold text-primary-600 mb-4">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.status ? 'Active' : 'Inactive'}
            </span>
            {product.is_sold && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Sold
              </span>
            )}
            {product.is_hidden && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Hidden
              </span>
            )}
            {product.is_approved && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Approved
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{product.description || 'No description available'}</p>
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Product ID</span>
              <p className="font-medium">{product.id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Ref ID</span>
              <p className="font-medium">{product.ref_id || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Category</span>
              <p className="font-medium">{product.category?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Sub Category</span>
              <p className="font-medium">{product.sub_category?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Condition</span>
              <p className="font-medium">{product.condition?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Views</span>
              <p className="font-medium">{product.views || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Likes</span>
              <p className="font-medium">{product.likes || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Created At</span>
              <p className="font-medium">
                {product.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          {product.search_tags && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Search Tags</h2>
              <p className="text-gray-600">{product.search_tags}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

