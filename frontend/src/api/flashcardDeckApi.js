import { API_BASE } from './apiRequest';

const BASE_URL = `${API_BASE}/system-flashcards`;

// Lấy JWT đúng với hệ thống đang lưu trong app
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Hàm hỗ trợ đọc response an toàn
const handleResponse = async (response) => {
    if (response.status === 204) {
        return { code: 204, message: "Success (No Content)" };
    }
    const text = await response.text();
    if (!text || text.trim() === "") {
        return { code: response.status, message: "Success" };
    }
    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        console.error("Phản hồi từ server không phải định dạng JSON hợp lệ:", text);
        throw new Error(text || "Lỗi phản hồi từ server");
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
        const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    create: async (data) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    update: async (id, data) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};