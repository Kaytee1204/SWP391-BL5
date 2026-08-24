import { API_BASE, apiRequest } from './apiRequest';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return query.toString();
};

const multipartRequest = async (endpoint, method, payload, audioFile) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (audioFile) formData.append('audio', audioFile);

  const token = localStorage.getItem('jwt_token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `Lỗi hệ thống (${response.status})`);
    error.status = response.status;
    error.fieldErrors = data?.data || {};
    throw error;
  }
  return data;
};

export const resolveListeningAudioUrl = (audioUrl) => {
  if (!audioUrl) return '';
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  return `${API_BASE}${audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`}`;
};

export const listeningExerciseApi = {
  search(params) {
    const query = buildQuery(params);
    return apiRequest(`/listening-exercises${query ? `?${query}` : ''}`);
  },
  searchMine(params) {
    const query = buildQuery(params);
    return apiRequest(`/listening-exercises/my-exercises${query ? `?${query}` : ''}`);
  },
  getById(id) {
    return apiRequest(`/listening-exercises/${id}`);
  },
  create(payload, audioFile) {
    return multipartRequest('/listening-exercises', 'POST', payload, audioFile);
  },
  update(id, payload, audioFile) {
    return multipartRequest(`/listening-exercises/${id}`, 'PATCH', payload, audioFile);
  },
  remove(id) {
    return apiRequest(`/listening-exercises/${id}`, 'DELETE');
  }
};
