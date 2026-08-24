// src/api/vocabularyItemApi.js
import { apiRequest } from './apiRequest';

/**
 * Adapter cũ được màn quản lý item theo category sử dụng. Nó cùng gọi /vocab-items như vocabApi,
 * nhưng tự bóc ApiResponse qua apiRequest. Không truyền createdBy/updatedBy vì backend lấy từ JWT.
 */
export const vocabularyItemApi = {
    getByCategory: async (categoryId) => {
        // categoryId giới hạn item thuộc đúng danh mục đang được mở.
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
