// src/api/vocabularyItemApi.js
const API_BASE_URL = 'http://localhost:8080/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};

export const vocabularyItemApi = {
    getByCategory: async (categoryId) => {
        const response = await fetch(`${API_BASE_URL}/vocabulary-categories/${categoryId}/items`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch items');
        return data;
    },

    create: async (categoryId, payload) => {
        const response = await fetch(`${API_BASE_URL}/vocabulary-categories/${categoryId}/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create item');
        return data;
    },

    update: async (itemId, payload) => {
        const response = await fetch(`${API_BASE_URL}/vocabulary-items/${itemId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update item');
        return data;
    },

    delete: async (itemId) => {
        const response = await fetch(`${API_BASE_URL}/vocabulary-items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete item');
        }
        return true;
    }
};