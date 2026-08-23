import { apiRequest } from './apiRequest';

export const courseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.jlptLevel) query.append('jlptLevel', params.jlptLevel);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sort) query.append('sort', params.sort);
    return apiRequest(`/courses?${query.toString()}`, 'GET');
  },

  getById: (id) => apiRequest(`/courses/${id}`, 'GET'),

  create: (data) => apiRequest('/courses', 'POST', data),

  update: (id, data) => apiRequest(`/courses/${id}`, 'PUT', data),

  delete: (id) => apiRequest(`/courses/${id}`, 'DELETE'),

  enrollFree: (id) => apiRequest(`/courses/${id}/enroll-free`, 'POST'),

  getMyEnrolled: () => apiRequest('/courses/my-enrolled', 'GET'),
};
