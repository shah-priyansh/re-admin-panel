import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, StarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { 
  getUserById, 
  getUserProducts, 
  getUserOrders, 
  getUserTransactions,
  getUserReviewsReceived,
  getUserReviewsGiven
} from '../services/userService';
import { getImageUrl } from '../utils/imageUtils';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Store all transactions for client-side pagination
  const [transactions, setTransactions] = useState([]); // Displayed transactions (paginated)
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [trustapInfo, setTrustapInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pagination states for each tab
  const [productsPagination, setProductsPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
  const [ordersPagination, setOrdersPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
  const [transactionsPagination, setTransactionsPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
  const [reviewsReceivedPagination, setReviewsReceivedPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
  const [reviewsGivenPagination, setReviewsGivenPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
  
  // Current page states for each tab
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [reviewsReceivedPage, setReviewsReceivedPage] = useState(1);
  const [reviewsGivenPage, setReviewsGivenPage] = useState(1);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  // Fetch initial counts for all tabs when user data loads
  useEffect(() => {
    if (user && id) {
      fetchInitialCounts();
    }
  }, [user, id]);

  // Fetch data when tab changes or page changes
  useEffect(() => {
    if (user) {
      if (activeTab === 'transactions' && allTransactions.length === 0) {
        // Fetch transactions only once
        fetchTransactions();
      } else if (activeTab === 'transactions' && allTransactions.length > 0) {
        // Re-paginate existing transactions when page changes
        const limit = 10;
        const startIndex = (transactionsPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
        setTransactions(paginatedTransactions);
        setTransactionsPagination({ 
          total: allTransactions.length, 
          page: transactionsPage, 
          limit: limit, 
          totalPages: Math.ceil(allTransactions.length / limit), 
          hasNextPage: transactionsPage < Math.ceil(allTransactions.length / limit) 
        });
      } else {
        fetchTabData();
      }
    }
  }, [activeTab, productsPage, ordersPage, transactionsPage, reviewsReceivedPage, reviewsGivenPage, id, allTransactions.length]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user info
      const userResponse = await getUserById(id);
      if (userResponse.data) {
        setUser(userResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialCounts = async () => {
    try {
      // Fetch first page of each tab to get counts (limit: 1 to minimize data transfer)
      const [productsRes, ordersRes, transactionsRes, reviewsReceivedRes, reviewsGivenRes] = await Promise.allSettled([
        getUserProducts(id, { page: 1, limit: 1 }),
        getUserOrders(id, { page: 1, limit: 1 }),
        getUserTransactions(id),
        getUserReviewsReceived(id, { page: 1 }),
        getUserReviewsGiven(id, { page: 1 }),
      ]);

      if (productsRes.status === 'fulfilled' && productsRes.value?.pagination) {
        setProductsPagination(productsRes.value.pagination);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.pagination) {
        setOrdersPagination(ordersRes.value.pagination);
      }
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.data) {
        const allTransactionsData = Array.isArray(transactionsRes.value.data) ? transactionsRes.value.data : [];
        setAllTransactions(allTransactionsData);
        setTransactionsPagination({ 
          total: allTransactionsData.length, 
          page: 1, 
          limit: 10, 
          totalPages: Math.ceil(allTransactionsData.length / 10), 
          hasNextPage: allTransactionsData.length > 10 
        });
      }
      if (reviewsReceivedRes.status === 'fulfilled' && reviewsReceivedRes.value?.pagination) {
        setReviewsReceivedPagination(reviewsReceivedRes.value.pagination);
      }
      if (reviewsGivenRes.status === 'fulfilled' && reviewsGivenRes.value?.pagination) {
        setReviewsGivenPagination(reviewsGivenRes.value.pagination);
      }
    } catch (err) {
      console.error('Error fetching initial counts:', err);
    }
  };

  const fetchTabData = async () => {
    try {
      switch (activeTab) {
        case 'products':
          await fetchProducts();
          break;
        case 'orders':
          await fetchOrders();
          break;
        case 'transactions':
          await fetchTransactions();
          break;
        case 'reviews-received':
          await fetchReviewsReceived();
          break;
        case 'reviews-given':
          await fetchReviewsGiven();
          break;
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getUserProducts(id, { page: productsPage, limit: 10 });
      if (response?.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
        setProductsPagination(response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await getUserOrders(id, { page: ordersPage, limit: 10 });
      if (response?.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
        setOrdersPagination(response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await getUserTransactions(id);
      if (response?.data) {
        const allTransactionsData = Array.isArray(response.data) ? response.data : [];
        setAllTransactions(allTransactionsData);
        
        // Client-side pagination for transactions
        const limit = 10;
        const startIndex = (transactionsPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTransactions = allTransactionsData.slice(startIndex, endIndex);
        setTransactions(paginatedTransactions);
        
        setTransactionsPagination({ 
          total: allTransactionsData.length, 
          page: transactionsPage, 
          limit: limit, 
          totalPages: Math.ceil(allTransactionsData.length / limit), 
          hasNextPage: transactionsPage < Math.ceil(allTransactionsData.length / limit) 
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchReviewsReceived = async () => {
    try {
      const response = await getUserReviewsReceived(id, { page: reviewsReceivedPage });
      if (response?.data) {
        setReviewsReceived(Array.isArray(response.data) ? response.data : []);
        setReviewsReceivedPagination(response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
      }
    } catch (err) {
      console.error('Error fetching reviews received:', err);
    }
  };

  const fetchReviewsGiven = async () => {
    try {
      const response = await getUserReviewsGiven(id, { page: reviewsGivenPage });
      if (response?.data) {
        setReviewsGiven(Array.isArray(response.data) ? response.data : []);
        setReviewsGivenPagination(response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false });
      }
    } catch (err) {
      console.error('Error fetching reviews given:', err);
    }
  };

  const handlePageChange = (tab, page) => {
    switch (tab) {
      case 'products':
        setProductsPage(page);
        break;
      case 'orders':
        setOrdersPage(page);
        break;
      case 'transactions':
        setTransactionsPage(page);
        break;
      case 'reviews-received':
        setReviewsReceivedPage(page);
        break;
      case 'reviews-given':
        setReviewsGivenPage(page);
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationForTab = (tab) => {
    switch (tab) {
      case 'products':
        return productsPagination;
      case 'orders':
        return ordersPagination;
      case 'transactions':
        return transactionsPagination;
      case 'reviews-received':
        return reviewsReceivedPagination;
      case 'reviews-given':
        return reviewsGivenPagination;
      default:
        return { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false };
    }
  };

  const getCurrentPageForTab = (tab) => {
    switch (tab) {
      case 'products':
        return productsPage;
      case 'orders':
        return ordersPage;
      case 'transactions':
        return transactionsPage;
      case 'reviews-received':
        return reviewsReceivedPage;
      case 'reviews-given':
        return reviewsGivenPage;
      default:
        return 1;
    }
  };

  // Pagination Component
  const Pagination = ({ pagination, currentPage, onPageChange, tab }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(tab, Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(tab, Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(tab, Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(tab, 1)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      ...
                    </span>
                  )}
                </>
              )}
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(tab, page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                    page === currentPage
                      ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              {endPage < pagination.totalPages && (
                <>
                  {endPage < pagination.totalPages - 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(tab, pagination.totalPages)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => onPageChange(tab, Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="card p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/users')} className="btn-secondary mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card p-6">
        <p className="text-gray-500">User not found</p>
        <button onClick={() => navigate('/users')} className="btn-secondary mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'products', name: `Products (${productsPagination.total || products.length})` },
    { id: 'orders', name: `Orders (${ordersPagination.total || orders.length})` },
    { id: 'transactions', name: `Transactions (${transactionsPagination.total || transactions.length})` },
    { id: 'reviews-received', name: `Reviews Received (${reviewsReceivedPagination.total || reviewsReceived.length})` },
    { id: 'reviews-given', name: `Reviews Given (${reviewsGivenPagination.total || reviewsGiven.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Users</span>
        </button>
        <button
          onClick={() => navigate(`/users/${id}/edit`)}
          className="btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <PencilIcon className="h-5 w-5" />
          Edit User
        </button>
      </div>

      {/* User Overview Card */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {user.profile_img ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={getImageUrl(user.profile_img)}
                alt={`${user.first_name} ${user.last_name}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center" style={{ display: user.profile_img ? 'none' : 'flex' }}>
              <span className="text-primary-600 font-medium text-2xl">
                {user.first_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{user.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user.phone ? `${user.country_code || ''} ${user.phone}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">User Type</span>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.type === 'seller' || user.type === 1
                      ? 'bg-green-100 text-green-800'
                      : user.type === 'super' || user.type === 0 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.type === 'seller' || user.type === 1 ? 'Seller' : user.type === 'super' || user.type === 0 ? 'Super Admin' : 'Buyer'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Joined</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(user.created_at)}</p>
              </div>
              {user.total_reviews !== undefined && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Total Reviews</span>
                  <p className="text-base font-semibold text-gray-900 mt-1">{user.total_reviews || 0}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase">Username</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{user.username || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase">Date of Birth</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(user.dob)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase">Email Verified</span>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user.email_verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 uppercase">Phone Verified</span>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user.phone_verified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/users/${id}/bulk-upload`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <PhotoIcon className="h-5 w-5" />
                    Bulk Upload
                  </button>
                  <button
                    onClick={() => navigate(`/users/${id}/add-product`)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                    Add Product
                  </button>
                </div>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No products found</p>
                  <button
                    onClick={() => navigate(`/users/${id}/add-product`)}
                    className="btn-primary"
                  >
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4 items-center">
                        {product.image && (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.title}</h3>
                          <p className="text-primary-600 font-bold mt-1">{formatPrice(product.price)}</p>
                          <p className="text-sm text-gray-500 mt-1">ID: {product.id}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination
              pagination={productsPagination}
              currentPage={productsPage}
              onPageChange={handlePageChange}
              tab="products"
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 flex-1">
                          {order.image && (
                            <img
                              src={getImageUrl(order.image)}
                              alt={order.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{order.title}</h3>
                            <p className="text-primary-600 font-bold mt-1">{formatPrice(order.price)}</p>
                            <p className="text-sm text-gray-500 mt-1">Order #: {order.order_no}</p>
                            <p className="text-sm text-gray-500">Status: {order.status_text}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination
              pagination={ordersPagination}
              currentPage={ordersPage}
              onPageChange={handlePageChange}
              tab="orders"
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transactions</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {transactions.map((txn) => (
                  <div 
                    key={txn.id} 
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-300 group"
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-4">
           
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-lg">Transaction #{txn.id}</p>
                            {txn.type_text && (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
                                txn.type === 1 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                  : 'bg-green-50 text-green-700 border border-green-200'
                              }`}>
                                {txn.type_text}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(txn.date || txn.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Amount Badge */}
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                        <p className="text-2xl font-bold text-primary-600">{formatPrice(txn.price || txn.sub_total || txn.amount)}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Info */}
                      {txn.product && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product</p>
                          <p className="text-sm font-medium text-gray-900 mb-1">{txn.product}</p>
                          {txn.product_count > 1 && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              {txn.product_count} items in this transaction
                            </p>
                          )}
                        </div>
                      )}

                      {/* Status Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Payment Status */}
                        <div className={`rounded-lg p-4 border-2 transition-colors ${
                          txn.pay_status === 0 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              txn.pay_status === 0 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                            }`}></div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment</p>
                          </div>
                          <p className={`text-sm font-bold ${
                            txn.pay_status === 0 ? 'text-yellow-700' : 'text-green-700'
                          }`}>
                            {txn.pay_status === 0 ? 'Pending' : 'Paid'}
                          </p>
                        </div>

                        {/* Claimed Status */}
                        <div className={`rounded-lg p-4 border-2 transition-colors ${
                          txn.is_txn_claimed === 0 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              txn.is_txn_claimed === 0 ? 'bg-gray-400' : 'bg-green-500'
                            }`}></div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Claimed</p>
                          </div>
                          <p className={`text-sm font-bold ${
                            txn.is_txn_claimed === 0 ? 'text-gray-600' : 'text-green-700'
                          }`}>
                            {txn.is_txn_claimed === 0 ? 'Not Claimed' : 'Claimed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
            <Pagination
              pagination={transactionsPagination}
              currentPage={transactionsPage}
              onPageChange={handlePageChange}
              tab="transactions"
            />
          </div>
        )}

        {activeTab === 'reviews-received' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews Received</h2>
              {reviewsReceived.length === 0 ? (
                <p className="text-gray-500">No reviews received</p>
              ) : (
                <div className="space-y-4">
                  {reviewsReceived.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {review.user_image && (
                          <img
                            src={getImageUrl(review.user_image)}
                            alt={review.user_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900">{review.user_name}</p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 mt-2">
                              {typeof review.review_text === 'string' && review.review_text.startsWith('data:') 
                                ? atob(review.review_text.split(',')[1] || '')
                                : review.review_text}
                            </p>
                          )}
                          {review.title && (
                            <p className="text-sm text-gray-500 mt-2">Product: {review.title}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination
              pagination={reviewsReceivedPagination}
              currentPage={reviewsReceivedPage}
              onPageChange={handlePageChange}
              tab="reviews-received"
            />
          </div>
        )}

        {activeTab === 'reviews-given' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews Given</h2>
              {reviewsGiven.length === 0 ? (
                <p className="text-gray-500">No reviews given</p>
              ) : (
                <div className="space-y-4">
                  {reviewsGiven.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {review.user_image && (
                          <img
                            src={getImageUrl(review.user_image)}
                            alt={review.user_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900">Review for: {review.user_name || 'User'}</p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 mt-2">
                              {typeof review.review_text === 'string' && review.review_text.startsWith('data:') 
                                ? atob(review.review_text.split(',')[1] || '')
                                : review.review_text}
                            </p>
                          )}
                          {review.title && (
                            <p className="text-sm text-gray-500 mt-2">Product: {review.title}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination
              pagination={reviewsGivenPagination}
              currentPage={reviewsGivenPage}
              onPageChange={handlePageChange}
              tab="reviews-given"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;

