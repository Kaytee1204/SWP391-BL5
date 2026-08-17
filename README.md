# Japanese Learning Platform - Backend API (Spring Boot 3 + SQL Server)

Dự án Backend chuẩn doanh nghiệp cho **Nền tảng Học tiếng Nhật (Japanese Learning Platform)** sử dụng **Spring Boot 3.3.x**, **Java 17+**, **Spring Security 6**, **JWT**, **Spring Data JPA**, **Microsoft SQL Server (Database: DemoCourse)**, và **Swagger OpenAPI 3 (KhanhTB)**.

---

## 🗄️ Cấu hình Microsoft SQL Server

- **Database:** `DemoCourse`
- **Tài khoản:** `sa`
- **Mật khẩu:** `123`
- **Chế độ JPA:** `spring.jpa.hibernate.ddl-auto: none` (Chỉ kết nối đọc/ghi với database sẵn có, không tự tạo hay can thiệp vào schema DB).

---

## 🚀 Các Feature chính đang hoạt động

### 🔹 1. Authentication & Profile (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Đăng nhập (validate email, password, kiểm tra active/inactive, trả về JWT Access Token).
- `POST /api/v1/auth/register`: Đăng ký tài khoản học viên mới (Role mặc định: `Student`).
- `POST /api/v1/auth/logout`: Đăng xuất và xóa Security Context.
- `GET /api/v1/auth/me`: Lấy thông tin profile của tài khoản đang đăng nhập.
- **Tài khoản Admin tạo sẵn:** `admin@japanlearning.com` / `admin123` (Role: `Manager`).

### 🔹 2. Account Management (`/api/v1/accounts`) *(Dành riêng cho Manager)*
- `GET /api/v1/accounts`: Xem danh sách tài khoản (hỗ trợ lọc theo `role`, `status`, tìm kiếm `keyword` theo Họ tên / Email, phân trang & sắp xếp).
- `GET /api/v1/accounts/{id}`: Xem chi tiết 1 tài khoản theo ID.
- `POST /api/v1/accounts`: Manager tạo tài khoản thủ công (gán vai trò `Student`, `Lecturer`, `Manager`, `Author` và trình độ mục tiêu).
- `PUT /api/v1/accounts/{id}`: Chỉnh sửa thông tin tài khoản & thay đổi vai trò.
- `PATCH /api/v1/accounts/{id}/status`: Kích hoạt hoặc Vô hiệu hóa tài khoản (`active` ⬌ `inactive`).
- `DELETE /api/v1/accounts/{id}`: Xóa mềm tài khoản khỏi hệ thống (`status = 'deleted'`).

---

## 🚀 Khởi chạy và Test API

1. Chạy ứng dụng:
   ```bash
   mvn clean spring-boot:run
   ```
2. Mở Swagger UI để test trực tiếp các API:
   👉 **`http://localhost:8080/api/v1/swagger-ui/index.html`**
