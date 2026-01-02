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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </button>
        <button
          onClick={() => navigate(`/products/${id}/edit`)}
          className="btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <PencilIcon className="h-5 w-5" />
          Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative shadow-lg group">
            {mainImage ? (
              <img
                src={getImageUrl(mainImage)}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
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
            {images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-3">
              {images.map((img, index) => {
                const imgSrc =img.full;
                const fullImgSrc = getImageUrl(imgSrc);
                
                return (
                  <button
                    key={img.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 relative bg-gray-100 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-primary-600 ring-2 ring-primary-200 shadow-md scale-105'
                        : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <img
                      src={fullImgSrc}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
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
          {/* Title and Price */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
              product.status 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {product.status ? '✓ Active' : '✗ Inactive'}
            </span>
            {product.is_sold && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                Sold
              </span>
            )}
            {product.is_hidden && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                Hidden
              </span>
            )}
            {product.is_approved && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                ✓ Approved
              </span>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-600 rounded"></span>
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>

          {/* Product Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-600 rounded"></span>
              Product Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product ID</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.id}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ref ID</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.ref_id || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.category?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub Category</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.sub_category?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Condition</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.condition?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Views</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.views || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Likes</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{product.likes || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created At</span>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {product.created_at
                    ? new Date(product.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {product.search_tags && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-600 rounded"></span>
                Search Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.search_tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

