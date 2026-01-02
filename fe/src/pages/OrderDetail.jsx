import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getOrderById } from '../services/orderService';
import { getImageUrl } from '../utils/imageUtils';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderById(id);
      if (response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Preparing for Dispatch', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      1: { text: 'In Delivery', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      2: { text: 'Refunded', color: 'bg-red-100 text-red-800 border-red-200' },
      3: { text: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
    };
    const statusInfo = statusMap[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
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
        <button onClick={() => navigate('/orders')} className="btn-secondary mt-4">
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card p-6">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn-secondary mt-4">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </button>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          {order.is_return_status === 1 && (
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              Return Requested
            </span>
          )}
        </div>
      </div>

      {/* Order Overview */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order Number:</span>
                <span className="text-sm font-medium text-gray-900">{order.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order ID:</span>
                <span className="text-sm font-medium text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-semibold text-primary-600">{formatPrice(order.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order Date:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</span>
              </div>
              {order.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Transaction ID:</span>
                  <span className="text-sm font-medium text-gray-900">{order.transaction_id}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            <div className="flex gap-4">
              {order.product_image && (
                <img
                  src={getImageUrl(order.product_image)}
                  alt={order.product_title}
                  className="w-24 h-24 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{order.product_title}</h3>
                <p className="text-sm text-gray-500 mb-2">Product ID: {order.product_id}</p>
                <p className="text-lg font-bold text-primary-600">{formatPrice(order.product_price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer & Seller Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Name:</span>{' '}
              <span className="font-medium text-gray-900">{order.buyer_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium text-gray-900">{order.buyer_email}</span>
            </p>
            {order.buyer_phone && (
              <p className="text-sm">
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium text-gray-900">
                  {order.buyer_country_code} {order.buyer_phone}
                </span>
              </p>
            )}
            <button
              onClick={() => navigate(`/users/${order.buyer_id}`)}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium mt-2"
            >
              View Buyer Profile →
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Name:</span>{' '}
              <span className="font-medium text-gray-900">{order.seller_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium text-gray-900">{order.seller_email}</span>
            </p>
            {order.seller_phone && (
              <p className="text-sm">
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium text-gray-900">
                  {order.seller_country_code} {order.seller_phone}
                </span>
              </p>
            )}
            <button
              onClick={() => navigate(`/users/${order.seller_id}`)}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium mt-2"
            >
              View Seller Profile →
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{order.address.full_name}</p>
            <p>{order.address.address_line1}</p>
            {order.address.address_line2 && <p>{order.address.address_line2}</p>}
            <p>{order.address.city}, {order.address.area}</p>
            {order.address.postal_code && <p>Postal Code: {order.address.postal_code}</p>}
            {order.address.phone && <p className="mt-2">Phone: {order.address.phone}</p>}
          </div>
        </div>
      )}

      {/* Tracking Information */}
      {order.tracking && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Delivery Tracking</h2>
          </div>
          
          {order.tracking.tracking_code && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tracking Code</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{order.tracking.tracking_code}</p>
                </div>
                {order.tracking.tracking_link && (
                  <a
                    href={order.tracking.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm"
                  >
                    Track Package
                  </a>
                )}
              </div>
            </div>
          )}

          {order.tracking.pickup_date && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Pickup Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(order.tracking.pickup_date)}
              </p>
            </div>
          )}

          {order.tracking.logs && order.tracking.logs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tracking History</h3>
              <div className="space-y-4">
                {order.tracking.logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === order.tracking.logs.length - 1
                          ? 'bg-primary-600 ring-4 ring-primary-200'
                          : 'bg-gray-300'
                      }`}></div>
                      {index < order.tracking.logs.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">{log.status}</p>
                      {log.description && (
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      )}
                      {log.hub_name && (
                        <p className="text-xs text-gray-500 mt-1">Hub: {log.hub_name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Return Tracking */}
      {order.return_tracking && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Return Tracking</h2>
          </div>
          
          {order.return_tracking.tracking_code && (
            <div className="mb-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Return Tracking Code</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{order.return_tracking.tracking_code}</p>
                </div>
                {order.return_tracking.tracking_link && (
                  <a
                    href={order.return_tracking.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Track Return
                  </a>
                )}
              </div>
            </div>
          )}

          {order.return_tracking.logs && order.return_tracking.logs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Tracking History</h3>
              <div className="space-y-4">
                {order.return_tracking.logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === order.return_tracking.logs.length - 1
                          ? 'bg-orange-600 ring-4 ring-orange-200'
                          : 'bg-gray-300'
                      }`}></div>
                      {index < order.return_tracking.logs.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">{log.status}</p>
                      {log.description && (
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      )}
                      {log.hub_name && (
                        <p className="text-xs text-gray-500 mt-1">Hub: {log.hub_name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetail;



