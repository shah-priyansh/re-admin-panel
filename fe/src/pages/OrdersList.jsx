import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  EyeIcon,
} from '@heroicons/react/24/outline';
import { getOrders } from '../services/orderService';
import { getImageUrl } from '../utils/imageUtils';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  });

  const navigate = useNavigate();

  const fetchOrders = async (page = 1, search = '', status = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrders({
        page,
        limit: 10,
        search,
        status,
      });
      
      if (response && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination || pagination);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1, searchTerm, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, searchTerm, status);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (typeof dateString === 'number') {
      return new Date(dateString * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Preparing for Dispatch', color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'In Delivery', color: 'bg-blue-100 text-blue-800' },
      2: { text: 'Refunded', color: 'bg-red-100 text-red-800' },
      3: { text: 'Completed', color: 'bg-green-100 text-green-800' },
    };
    const statusInfo = statusMap[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all orders
            {pagination.total > 0 && (
              <span className="ml-1 font-medium text-gray-700">
                ({pagination.total} {pagination.total === 1 ? 'order' : 'orders'})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by order number, product, buyer, or seller..."
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="0">Preparing</option>
              <option value="1">In Delivery</option>
              <option value="2">Refunded</option>
              <option value="3">Completed</option>
            </select>
            <button type="submit" className="btn-primary px-6 whitespace-nowrap">
              <MagnifyingGlassIcon className="h-4 w-4 inline-block mr-2" />
              Search
            </button>
            {(searchTerm || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                  fetchOrders(1, '', '');
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

      {/* Orders Table */}
      {loading ? (
        <div className="card">
          <div className="animate-pulse space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter
              ? `No orders match your filters. Try adjusting your search criteria.`
              : 'No orders available.'}
          </p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
                fetchOrders(1, '', '');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_no}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {order.product_image && (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-3"
                              src={getImageUrl(order.product_image)}
                              alt={order.product_title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {order.product_title || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.buyer_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.buyer_email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.seller_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.seller_email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                        {order.is_return_status === 1 && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Return Requested
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
                of <span className="font-medium text-gray-900">{pagination.total}</span> orders
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
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
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersList;

