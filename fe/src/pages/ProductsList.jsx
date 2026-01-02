import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  EyeIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { getProducts } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  });

  const navigate = useNavigate();

  const fetchProducts = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts({
        page,
        limit: 10,
        search,
      });
      
      // Response structure: { message, data: products[], pagination: {...} }
      if (response && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination || pagination);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all products
            {pagination.total > 0 && (
              <span className="ml-1 font-medium text-gray-700">
                ({pagination.total} {pagination.total === 1 ? 'product' : 'products'})
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/products/bulk-upload')}
            className="btn-secondary flex items-center gap-2"
          >
            <PhotoIcon className="h-5 w-5" />
            Bulk Upload
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, description, or tags..."
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-6 whitespace-nowrap">
              <MagnifyingGlassIcon className="h-4 w-4 inline-block mr-2" />
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchProducts(1, '');
                }}
                className="btn-secondary px-4 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Products Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? `No products match "${searchTerm}". Try a different search term.`
              : 'Get started by adding your first product.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                fetchProducts(1, '');
              }}
              className="btn-primary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-primary-300"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative group-hover:scale-[1.02] transition-transform duration-300">
                    {product.mainImage ? (
                      <img
                        src={getImageUrl(product.mainImage)}
                        alt={product.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          if (e.target.dataset.errorHandled === 'true') {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                            return;
                          }
                          e.target.dataset.errorHandled = 'true';
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16"
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

                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_sold && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Sold
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary-300"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-48 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.mainImage ? (
                        <img
                          src={getImageUrl(product.mainImage)}
                          alt={product.title}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                          onError={(e) => {
                            if (e.target.dataset.errorHandled === 'true') {
                              e.target.style.display = 'none';
                              return;
                            }
                            e.target.dataset.errorHandled = 'true';
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-xl font-bold text-primary-600 mb-2">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                          {product.is_sold && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Sold
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            ID: {product.id}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:flex-col" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="btn-secondary text-sm py-2 px-4 flex items-center justify-center gap-2 sm:w-full"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          className="btn-primary text-sm py-2 px-4 flex items-center justify-center gap-2 sm:w-full"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">
                  {(currentPage - 1) * pagination.limit + 1}
                </span> to{' '}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium text-gray-900">{pagination.total}</span> products
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Next</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsList;

