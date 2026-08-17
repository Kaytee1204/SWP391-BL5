# Spring Boot 3 Enterprise Base Code (Traditional Layered Architecture)

Dự án mẫu Backend chuẩn doanh nghiệp theo mô hình **Layered Architecture (Phân lớp truyền thống)** sử dụng **Spring Boot 3.3.x**, **Java 17+**, **Spring Security 6**, **JWT**, **Spring Data JPA**, và **Swagger OpenAPI 3**.

---

## 📁 Cấu trúc thư mục phân lớp truyền thống (Package by Layer)

```
springboot-base-template/
├── pom.xml
├── src/main/
│   ├── resources/
│   │   ├── application.yml                 # Cấu hình hệ thống (JWT, Swagger UI, Port)
│   │   └── application-dev.yml             # Cấu hình DB dev (H2 in-memory)
│   └── java/com/example/base/
│       ├── SpringBootBaseApplication.java  # Main Application Class
│       │
│       ├── controller/                     # 🌐 TẦNG TIẾP NHẬN HTTP REQUEST (REST API)
│       │   ├── AuthController.java
│       │   └── UserController.java
│       │
│       ├── service/                        # ⚙️ TẦNG LOGIC NGHIỆP VỤ (Business Logic)
│       │   ├── AuthService.java
│       │   ├── UserService.java
│       │   └── impl/                       # Class thực thi Service
│       │       ├── AuthServiceImpl.java
│       │       └── UserServiceImpl.java
│       │
│       ├── repository/                     # 🗄️ TẦNG TRUY VẤN CƠ SỞ DỮ LIỆU (JPA Repository)
│       │   └── UserRepository.java
│       │
│       ├── entity/                         # 📦 TẦNG THỰC THỂ DỮ LIỆU (Database Tables)
│       │   ├── BaseEntity.java             # Entity cha (id, createdAt, updatedAt, createdBy, isDeleted)
│       │   ├── Role.java
│       │   └── User.java
│       │
│       ├── dto/                            # 📨 TẦNG ĐỐI TƯỢNG TRUYỀN TẢI DỮ LIỆU (Data Transfer Object)
│       │   ├── request/                    # Dữ liệu Client gửi lên Server (có Validation)
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── UserCreateRequest.java
│       │   │   └── UserUpdateRequest.java
│       │   └── response/                   # Dữ liệu Server trả về cho Client
│       │       ├── ApiResponse.java        # Wrapper chuẩn {code, message, data, timestamp}
│       │       ├── PageResponse.java       # Chuẩn phân trang {page, size, totalElements, content}
│       │       ├── AuthResponse.java
│       │       └── UserResponse.java
│       │
│       ├── mapper/                         # 🔄 TẦNG CHUYỂN ĐỔI (Entity ⬌ DTO)
│       │   └── UserMapper.java
│       │
│       ├── exception/                      # ⚠️ TẦNG BẮT VÀ XỬ LÝ LỖI TOÀN CỤC
│       │   ├── ErrorCode.java              # Enum mã lỗi và thông báo
│       │   ├── AppException.java           # Base Runtime Exception
│       │   ├── ResourceNotFoundException.java
│       │   ├── BadRequestException.java
│       │   └── GlobalExceptionHandler.java # @RestControllerAdvice bắt lỗi tự động
│       │
│       ├── security/                       # 🔒 TẦNG BẢO MẬT & XÁC THỰC JWT (Spring Security 6)
│       │   ├── JwtTokenProvider.java       # Tạo & giải mã JWT Token
│       │   ├── JwtAuthenticationFilter.java# Filter chặn và xác thực Bearer token
│       │   ├── JwtAuthenticationEntryPoint.java # Xử lý lỗi 401 Unauthorized trả JSON
│       │   ├── CustomUserDetailsService.java
│       │   └── UserPrincipal.java          # UserDetails của Spring Security
│       │
│       └── config/                         # 🛠️ CẤU HÌNH HỆ THỐNG
│           ├── OpenApiConfig.java          # Cấu hình Swagger / OpenAPI 3 (JWT Bearer button)
│           ├── WebMvcConfig.java           # Cấu hình CORS
│           ├── AuditingConfig.java         # Tự động gán createdBy / updatedBy
│           ├── SecurityConfig.java         # SecurityFilterChain cấu hình phân quyền
│           └── DataInitializer.java        # Tự động tạo tài khoản Admin & User mẫu
```

---

## 🚀 Hướng dẫn chạy và Test nhanh

### 1. Khởi chạy dự án
```bash
mvn clean spring-boot:run
```

### 2. Thông tin truy cập
- **Base URL:** `http://localhost:8080/api/v1`
- **Swagger UI:** `http://localhost:8080/api/v1/swagger-ui/index.html`
- **H2 Database Console:** `http://localhost:8080/api/v1/h2-console` (JDBC URL: `jdbc:h2:mem:devdb`, User: `sa`, Pass: trống)

### 3. Tài khoản mẫu sẵn có:
- **Admin:** `admin` / `admin123` (Có quyền `ROLE_ADMIN`, `ROLE_USER`)
- **User:** `user` / `user123` (Có quyền `ROLE_USER`)
