import api from './api';

// Get all contact enquiries with search, filter, and pagination
export const getContactEnquiries = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = '', query_type = '' } = params;
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (query_type) queryParams.append('query_type', query_type);

  const response = await api.get(`/v2/support/contact-enquiries?${queryParams.toString()}`);
  return response.data;
};

// Get single contact enquiry by ID
export const getContactEnquiryById = async (enquiryId) => {
  const response = await api.get(`/v2/support/contact-enquiries/${enquiryId}`);
  return response.data;
};

// Send reply to contact enquiry
export const sendContactEnquiryReply = async (enquiryId, replyData) => {
  const response = await api.post(`/v2/support/contact-enquiries/${enquiryId}/reply`, replyData);
  return response.data;
};



