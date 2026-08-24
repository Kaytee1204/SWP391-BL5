import { API_BASE } from './apiRequest';

const BASE_URL = `${API_BASE}/vocabulary-categories`;

// Lấy JWT từ localStorage và đưa vào Authorization để backend xác định user/role.
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Đọc body thành text trước: DELETE có thể trả body rỗng, gọi response.json() trực tiếp sẽ phát sinh SyntaxError.
const handleResponse = async (response) => {
    const text = await response.text();
    if (!text || text.trim() === "") {
        return { code: response.status, message: "Success (No Content)" };
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Phản hồi từ server không phải định dạng JSON hợp lệ:", text);
        throw new Error(text || "Lỗi phản hồi từ server");
    }
};

export const vocabularyCategoryApi = {
    getAll: async () => {
        const response = await fetch(BASE_URL, { headers: getAuthHeaders() });
        return handleResponse(response);
    },
    
    getById: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
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
