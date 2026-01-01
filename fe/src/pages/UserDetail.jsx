import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, StarIcon } from '@heroicons/react/24/outline';
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
  const [transactions, setTransactions] = useState([]);
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [trustapInfo, setTrustapInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user info
      const userResponse = await getUserById(id);
      if (userResponse.data) {
        setUser(userResponse.data);
      }

      // Fetch related data
      try {
        const [productsRes, ordersRes, transactionsRes, reviewsReceivedRes, reviewsGivenRes] = await Promise.allSettled([
          getUserProducts(id),
          getUserOrders(id),
          getUserTransactions(id),
          getUserReviewsReceived(id),
          getUserReviewsGiven(id),
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
          setProducts(productsRes.value.data);
        }
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
          setOrders(ordersRes.value.data);
        }
        if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.data) {
          setTransactions(transactionsRes.value.data);
        }
        if (reviewsReceivedRes.status === 'fulfilled' && reviewsReceivedRes.value?.data) {
          setReviewsReceived(reviewsReceivedRes.value.data);
        }
        if (reviewsGivenRes.status === 'fulfilled' && reviewsGivenRes.value?.data) {
          setReviewsGiven(reviewsGivenRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user');
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
    { id: 'products', name: `Products (${products.length})` },
    { id: 'orders', name: `Orders (${orders.length})` },
    { id: 'transactions', name: `Transactions (${transactions.length})` },
    { id: 'reviews-received', name: `Reviews Received (${reviewsReceived.length})` },
    { id: 'reviews-given', name: `Reviews Given (${reviewsGiven.length})` },
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
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.type === 'seller' || user.type === 1 ? 'Seller' : 'Buyer'}
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
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products found</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
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
        )}

        {activeTab === 'transactions' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions found</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((txn) => (
                  <div key={txn.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">Transaction #{txn.id}</p>
                        <p className="text-primary-600 font-bold mt-1">{formatPrice(txn.sub_total || txn.amount)}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(txn.created_at)}</p>
                        <p className="text-sm text-gray-500">Status: {txn.pay_status || txn.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews-received' && (
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
        )}

        {activeTab === 'reviews-given' && (
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
        )}
      </div>
    </div>
  );
};

export default UserDetail;

