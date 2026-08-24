import { API_BASE, apiRequest } from './apiRequest';

// Khởi tạo BASE_URL an toàn, tránh hoàn toàn lỗi thiếu export từ apiRequest.js
const RESOLVED_BASE_URL = API_BASE ? `${API_BASE}/system-flashcards` : '/system-flashcards';

// Lấy JWT đúng với hệ thống đang lưu trong app
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleResponse = async (response) => {
    // Nếu status là 204 No Content hoặc response không có body thì trả về thành công luôn
    if (response.status === 204 || response.status === 200) {
        const text = await response.text();
        if (!text || text.trim() === "") {
            return { code: response.status, message: "Success" };
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            return { code: response.status, message: text };
        }
    }

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        data = { message: text };
    }

    if (!response.ok) {
        const errorMsg = data?.message || `Lỗi yêu cầu (${response.status})`;
        const err = new Error(errorMsg);
        err.response = { data, status: response.status };
        throw err;
    }
    return data;
};

export const flashcardDeckApi = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `${RESOLVED_BASE_URL}?${queryParams}` : RESOLVED_BASE_URL;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    create: async (data) => {
        const response = await fetch(RESOLVED_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    update: async (id, data) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    // ===== ĐỦ BỘ CRUD CHO THẺ CON (ITEMS / TỪ VỰNG) =====
    
    getItems: async (deckId) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/items/${deckId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    addItem: async (data) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    updateItem: async (data) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/items`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    removeItem: async (deckId, itemType, itemId) => {
        const response = await fetch(`${RESOLVED_BASE_URL}/items?deckId=${deckId}&itemType=${itemType}&itemId=${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};