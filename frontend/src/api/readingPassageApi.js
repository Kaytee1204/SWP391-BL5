import { apiRequest } from './apiRequest';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const readingPassageApi = {
  getAll: (params) => apiRequest(`/reading-passages${buildQuery(params)}`),

  getMine: (params) => apiRequest(`/reading-passages/my-passages${buildQuery(params)}`),

  getById: (id) => apiRequest(`/reading-passages/${id}`),

  create: (payload) => apiRequest('/reading-passages', 'POST', payload),

  update: (id, payload) => apiRequest(`/reading-passages/${id}`, 'PATCH', payload),

  delete: (id) => apiRequest(`/reading-passages/${id}`, 'DELETE')
};
