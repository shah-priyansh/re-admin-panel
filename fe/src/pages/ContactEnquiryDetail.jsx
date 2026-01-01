import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getContactEnquiryById, sendContactEnquiryReply } from '../services/contactService';

const ContactEnquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubject, setReplySubject] = useState('');

  useEffect(() => {
    fetchEnquiry();
  }, [id]);

  const fetchEnquiry = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getContactEnquiryById(id);
      if (response.data) {
        setEnquiry(response.data);
        // Set default subject
        setReplySubject(`Re: Your ${response.data.query_type === "feedback" ? "Feedback" : "Contact Enquiry"} #${response.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contact enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setError('Reply message is required');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await sendContactEnquiryReply(id, {
        reply_message: replyMessage,
        subject: replySubject,
      });
      setSuccess('Reply sent successfully');
      setReplyMessage('');
      // Refresh enquiry to get updated status
      setTimeout(() => {
        fetchEnquiry();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      closed: { text: 'Closed', color: 'bg-green-100 text-green-800 border-green-200' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getQueryTypeBadge = (queryType) => {
    const typeMap = {
      feedback: { text: 'Feedback', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      contact: { text: 'Contact', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      support: { text: 'Support', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };
    const typeInfo = typeMap[queryType] || { text: queryType, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.color}`}>
        {typeInfo.text}
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

  if (error && !enquiry) {
    return (
      <div className="card p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/contact-enquiries')} className="btn-secondary mt-4">
          Back to Contact Enquiries
        </button>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="card p-6">
        <p className="text-gray-500">Contact enquiry not found</p>
        <button onClick={() => navigate('/contact-enquiries')} className="btn-secondary mt-4">
          Back to Contact Enquiries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/contact-enquiries')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Contact Enquiries</span>
        </button>
        <div className="flex items-center gap-3">
          {getStatusBadge(enquiry.status)}
          {getQueryTypeBadge(enquiry.query_type)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Enquiry Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enquiry Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enquiry Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Enquiry ID:</span>
                <p className="text-sm text-gray-900 mt-1">#{enquiry.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date:</span>
                <p className="text-sm text-gray-900 mt-1">{enquiry.created_at_text || formatDate(enquiry.created_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Message:</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              </div>
              {enquiry.rating && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Rating:</span>
                  <p className="text-sm text-gray-900 mt-1">{enquiry.rating} / 5</p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          {enquiry.user && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-sm text-gray-900 mt-1">{enquiry.user.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-sm text-gray-900 mt-1">{enquiry.user.email}</p>
                </div>
                {enquiry.user.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-sm text-gray-900 mt-1">{enquiry.user.phone}</p>
                  </div>
                )}
                {enquiry.user.id && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">User ID:</span>
                    <p className="text-sm text-gray-900 mt-1">#{enquiry.user.id}</p>
                  </div>
                )}
              </div>
              {enquiry.user.id && (
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/users/${enquiry.user.id}`)}
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    View User Profile →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order Information */}
          {enquiry.order_id && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Order</h2>
              <div>
                <span className="text-sm font-medium text-gray-500">Order ID:</span>
                <p className="text-sm text-gray-900 mt-1">#{enquiry.order_id}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/orders/${enquiry.order_id}`)}
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  View Order Details →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Reply Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Reply</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>• Reply will be sent to: {enquiry.user?.email || 'N/A'}</p>
                <p>• Enquiry status will be updated to "Closed" after sending</p>
              </div>
              <button
                onClick={handleSendReply}
                disabled={processing || !replyMessage.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                {processing ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactEnquiryDetail;

