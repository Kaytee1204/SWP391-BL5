// ============================================================================
// API REQUEST HELPER DÙNG CHUNG TOÀN HỆ THỐNG
// ============================================================================
export const API_BASE = (function () {
  if (typeof window !== 'undefined') {
    if (window.location.port === '8080') {
      return `${window.location.origin}/api/v1`;
    }
    const host = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
    return `http://${host}:8080/api/v1`;
  }
  return 'http://localhost:8080/api/v1';
})();

/**
 * Hàm gọi API tổng quát, tự động đính kèm Token JWT nếu có
 * @param {string} endpoint - ví dụ: '/auth/login', '/culture-articles'
 * @param {string} method - 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
 * @param {object|null} body - payload gửi lên
 * @param {string|null} token - JWT token nếu muốn chỉ định riêng
 */
export async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null);
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || `Lỗi hệ thống (${res.status})`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.fieldErrors = data?.data || {};
      err.rawResponse = data;
      console.error(`[API ERROR] ${method} ${endpoint} (${res.status}):`, data || res.statusText);
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Không thể kết nối đến Backend tại ${API_BASE}. Hãy đảm bảo Spring Boot đang chạy ở cổng 8080!`);
    }
    throw err;
  }
}