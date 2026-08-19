// URL gốc của backend
const BASE_URL = 'http://localhost:8080/api/v1/vocabulary-categories';

// Lấy JWT đúng với hệ thống đang lưu trong app
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Hàm hỗ trợ đọc response an toàn, tránh lỗi SyntaxError khi server trả về dữ liệu rỗng hoặc không phải JSON
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