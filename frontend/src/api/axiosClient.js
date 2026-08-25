import axios from 'axios';

const axiosClient = axios.create({
  // Mọi API của ứng dụng dùng chung prefix; Vite proxy chuyển /api sang backend ở môi trường dev.
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  // Request interceptor chạy trước mỗi call và gắn JWT nếu user đã đăng nhập.
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  // Backend bọc kết quả trong ApiResponse; unwrap data giúp page nhận trực tiếp array/object cần render.
  (response) => response.data?.data,
  (error) => {
    // 401 nghĩa là token hết hạn/không hợp lệ; xóa local session để tránh tiếp tục gửi token hỏng.
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
    }
    // Chuẩn hóa mọi lỗi thành Error(message), nhờ đó page chỉ cần đọc err.message trong catch.
    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    const normalizedError = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    // Giu HTTP status de man edit nhan biet 409 va yeu cau refresh, tuyet doi khong tu ghi de.
    normalizedError.status = error.response?.status;
    normalizedError.rawResponse = error.response?.data;
    return Promise.reject(normalizedError);
  },
);

export default axiosClient;
