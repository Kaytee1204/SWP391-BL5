// src/api/vocabularyItemApi.js
import { apiRequest } from './apiRequest';

export const vocabularyItemApi = {
    getByCategory: async (categoryId) => {
        const res = await apiRequest(`/vocab-items?categoryId=${categoryId}`, 'GET');
        return res?.data || [];
    },

    create: async (categoryId, payload) => {
        return await apiRequest('/vocab-items', 'POST', { ...payload, categoryId });
    },

    update: async (itemId, payload) => {
        return await apiRequest(`/vocab-items/${itemId}`, 'PUT', payload);
    },

    delete: async (itemId) => {
        return await apiRequest(`/vocab-items/${itemId}`, 'DELETE');
    }
};