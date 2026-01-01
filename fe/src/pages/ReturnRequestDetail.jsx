import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { getReturnRequestById, approveReturnRequest, rejectReturnRequest } from '../services/orderService';
import { getImageUrl } from '../utils/imageUtils';

const ReturnRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReturnRequest();
  }, [id]);

  const fetchReturnRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getReturnRequestById(id);
      if (response.data) {
        setReturnRequest(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch return request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this return request?')) {
      return;
    }

    const orderId = returnRequest.order_id || returnRequest.order?.id;
    if (!orderId) {
      setError('Order ID is missing. Cannot approve return request.');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await approveReturnRequest(orderId);
      setSuccess('Return request approved successfully');
      setTimeout(() => {
        navigate('/return-requests');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve return request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this return request?')) {
      return;
    }

    const orderId = returnRequest.order_id || returnRequest.order?.id;
    if (!orderId) {
      setError('Order ID is missing. Cannot reject return request.');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await rejectReturnRequest(orderId);
      setSuccess('Return request rejected successfully');
      setTimeout(() => {
        navigate('/return-requests');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject return request');
    } finally {
      setProcessing(false);
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

  const getReturnStatusBadge = (status) => {
    const statusMap = {
      1: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      2: { text: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
      3: { text: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
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

  if (error && !returnRequest) {
    return (
      <div className="card p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/return-requests')} className="btn-secondary mt-4">
          Back to Return Requests
        </button>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="card p-6">
        <p className="text-gray-500">Return request not found</p>
        <button onClick={() => navigate('/return-requests')} className="btn-secondary mt-4">
          Back to Return Requests
        </button>
      </div>
    );
  }

  const order = returnRequest.order || {};
  // Check if return status is pending (1 = pending, 2 = approved, 3 = rejected)
  const returnStatus = returnRequest.return_status || 1;
  const canApproveReject = returnStatus === 1; // Only pending requests

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/return-requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Return Requests</span>
        </button>
        <div className="flex items-center gap-3">
          {getReturnStatusBadge(returnStatus)}
          {canApproveReject && (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-secondary flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-700 disabled:opacity-50"
              >
                <XCircleIcon className="h-5 w-5" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Return Request Overview */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Request Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Return Request ID:</span>
            <p className="text-sm font-medium text-gray-900">{returnRequest.id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Order Number:</span>
            <p className="text-sm font-medium text-gray-900">{returnRequest.order_no}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Return Reason:</span>
            <p className="text-sm font-medium text-gray-900">{returnRequest.reason_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Request Date:</span>
            <p className="text-sm font-medium text-gray-900">{formatDate(returnRequest.created_at)}</p>
          </div>
        </div>
        {returnRequest.description && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Description:</span>
            <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
              {returnRequest.description}
            </p>
          </div>
        )}
      </div>

      {/* Product Information */}
      {order.product_id && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="flex gap-4">
            {order.product_image && (
              <img
                src={getImageUrl(order.product_image)}
                alt={order.product_title}
                className="w-32 h-32 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{order.product_title}</h3>
              {order.product_description && (
                <p className="text-sm text-gray-600 mb-2">{order.product_description}</p>
              )}
              <p className="text-sm text-gray-500 mb-2">Product ID: {order.product_id}</p>
              <p className="text-lg font-bold text-primary-600">{formatPrice(order.price)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Information */}
      {order.id && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Order Number:</span>
              <p className="text-sm font-medium text-gray-900">{order.order_no}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Order Amount:</span>
              <p className="text-sm font-semibold text-primary-600">{formatPrice(order.price)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Order Date:</span>
              <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Order Status:</span>
              <p className="text-sm font-medium text-gray-900">
                {order.status === 0 ? 'Preparing' : 
                 order.status === 1 ? 'In Delivery' : 
                 order.status === 2 ? 'Refunded' : 
                 order.status === 3 ? 'Completed' : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              View Full Order Details →
            </button>
          </div>
        </div>
      )}

      {/* Buyer Information */}
      {order.buyer_id && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="text-sm font-medium text-gray-900">{order.buyer_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="text-sm font-medium text-gray-900">{order.buyer_email || 'N/A'}</p>
            </div>
            {order.buyer_phone && (
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="text-sm font-medium text-gray-900">
                  {order.buyer_country_code} {order.buyer_phone}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(`/users/${order.buyer_id}`)}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              View Buyer Profile →
            </button>
          </div>
        </div>
      )}

      {/* Seller Information */}
      {order.seller_id && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="text-sm font-medium text-gray-900">{order.seller_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="text-sm font-medium text-gray-900">{order.seller_email || 'N/A'}</p>
            </div>
            {order.seller_phone && (
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="text-sm font-medium text-gray-900">
                  {order.seller_country_code} {order.seller_phone}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(`/users/${order.seller_id}`)}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              View Seller Profile →
            </button>
          </div>
        </div>
      )}

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

      {/* Return Images */}
      {returnRequest.images && returnRequest.images.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {returnRequest.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={getImageUrl(img.url)}
                  alt={`Return image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onClick={() => window.open(getImageUrl(img.url), '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm">Click to enlarge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnRequestDetail;

