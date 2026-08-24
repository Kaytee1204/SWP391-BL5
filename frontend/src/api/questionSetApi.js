import { apiRequest } from './apiRequest';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value).trim());
    }
  });

  return query.toString();
};

export const questionSetApi = {
  search(params) {
    const query = buildQuery(params);
    return apiRequest(`/question-sets${query ? `?${query}` : ''}`);
  },

  getById(questionSetId) {
    return apiRequest(`/question-sets/${questionSetId}`);
  },

  create(payload) {
    return apiRequest('/question-sets', 'POST', payload);
  },

  update(questionSetId, payload) {
    return apiRequest(`/question-sets/${questionSetId}`, 'PUT', payload);
  },

  replaceQuestions(questionSetId, questionIds) {
    return apiRequest(`/question-sets/${questionSetId}/questions`, 'PUT', {
      questionIds
    });
  },

  createQuestionInsideSet(questionSetId, payload) {
    return apiRequest(`/question-sets/${questionSetId}/questions`, 'POST', payload);
  },

  remove(questionSetId) {
    return apiRequest(`/question-sets/${questionSetId}`, 'DELETE');
  }
};
