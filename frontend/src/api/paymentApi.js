import { apiRequest } from './apiRequest';

export const paymentApi = {
  createPaymentLink: (courseId) => {
    return apiRequest('/payments/create-payment-link', 'POST', { courseId });
  },

  checkPaymentStatus: (orderCode) => {
    return apiRequest(`/payments/check-status/${orderCode}`, 'GET');
  },

  verifyPaymentReturn: (orderCode) => {
    return apiRequest(`/payments/verify-return?orderCode=${orderCode}`, 'GET');
  },

  getAllPayments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sort) query.append('sort', params.sort);
    return apiRequest(`/payments?${query.toString()}`, 'GET');
  },

  getMyPaymentHistory: () => {
    return apiRequest('/payments/my-history', 'GET');
  }
};
