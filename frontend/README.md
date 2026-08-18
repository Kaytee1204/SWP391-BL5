# ⛩️ JLMS Frontend — Kiến Trúc React Theo Tính Năng (Feature-First Architecture)

Chào mừng bạn đến với mã nguồn Frontend của **JLMS (Japanese Learning Management System)**. Dự án được xây dựng bằng **React 18 + Vite** theo cấu trúc **Feature-First (Module theo từng chức năng)**, giúp nhóm phát triển dễ dàng mở rộng, phân chia công việc, bảo trì và không bị xung đột code (conflict).

---

## 📁 Cấu Trúc Thư Mục Chuẩn (Feature-Based Structure)

```
frontend/
├── package.json               # Cấu hình dependencies & scripts (React, Vite)
├── vite.config.js             # Cấu hình build & Proxy kết nối Backend (Port 8080)
├── index.html                 # File HTML gốc (Template)
├── src/
│   ├── api/                   # [SHARED] Quản lý gọi API tập trung
│   │   └── apiRequest.js      # Helper gọi fetch, tự động đính kèm Bearer JWT Token
│   │
│   ├── assets/                # [SHARED] CSS, constants, presets
│   │   ├── constants.js       # Danh sách Avatar presets, Cover presets, Enum vai trò, JLPT Level
│   │   └── styles.css         # Toàn bộ CSS giao diện, Palette màu Jasper.ai, Dark/Light Glow, Animation
│   │
│   ├── components/            # [SHARED COMPONENTS] Các UI component dùng chung nhiều nơi
│   │   ├── common/
│   │   │   ├── Navbar.jsx              # Thanh điều hướng trên cùng
│   │   │   ├── FbProfileDropdown.jsx   # Menu tài khoản góc phải (Avatar + Role badge + Options)
│   │   │   └── PaginationBar.jsx       # Thanh chuyển trang (Pagination)
│   │   └── auth/
│   │       ├── AuthModal.jsx           # Modal Đăng nhập / Đăng ký tài khoản
│   │       └── MyProfileModal.jsx      # Modal Xem & Cập nhật Hồ sơ cá nhân + Đổi Avatar
│   │
│   ├── features/              # 🚀 CÁC TÍNH NĂNG CHÍNH CỦA DỰ ÁN (CHIA THEO FEATURE)
│   │   │
│   │   ├── landing/                    # Feature 1: Trang chủ giới thiệu nền tảng
│   │   │   ├── components/
│   │   │   │   └── IsometricStage.jsx  # Khối 3D tương tác các môn học (Kanji, Speaking, Chokai)
│   │   │   └── LandingPage.jsx         # Giao diện Landing Page
│   │   │
│   │   ├── culture-reader/             # Feature 2: Tạp chí Đọc Văn Hóa & Tiếng Lóng (Dành cho Học viên & Độc giả)
│   │   │   ├── CultureSlangReaderPage.jsx # Danh sách bài đọc, bài mới nhất (Hero card) & bộ lọc tìm kiếm
│   │   │   └── ArticleDetailPage.jsx     # Trang đọc bài viết chuyên sâu toàn màn hình (Hỗ trợ cuộn chuột)
│   │   │
│   │   ├── culture-articles/           # Feature 3: Quản Lý & Xuất Bản Bài Viết (Dành cho Author / Manager)
│   │   │   ├── components/
│   │   │   │   ├── CreateArticleModal.jsx # Modal tạo và xuất bản bài viết mới
│   │   │   │   └── EditArticleModal.jsx   # Modal chỉnh sửa nội dung bài viết
│   │   │   ├── CultureArticleManagementView.jsx # Bảng quản lý bài viết dạng bảng chuẩn CRM
│   │   │   └── AuthorWorkspacePage.jsx          # Không gian làm việc riêng của Tác giả (Author)
│   │   │
│   │   ├── account-management/         # Feature 4: Quản Lý Người Dùng & Phân Quyền (Dành cho Manager)
│   │   │   ├── components/
│   │   │   │   ├── CreateAccountModal.jsx # Modal thêm tài khoản mới
│   │   │   │   └── EditAccountModal.jsx   # Modal chỉnh sửa quyền, trạng thái & thông tin user
│   │   │   └── AccountManagementView.jsx  # Bảng danh sách tài khoản, tìm kiếm, lọc theo vai trò
│   │   │
│   │   ├── materials/                  # Feature 5: Tài Liệu Giảng Dạy (Dành cho Lecturer)
│   │   │   └── LearningMaterialsView.jsx # Giao diện xem và quản lý tài liệu học tập
│   │   │
│   │   └── dashboard/                  # Feature 6: Dashboard Quản Trị Hệ Thống (Manager Portal)
│   │       └── ManagerDashboardPage.jsx  # Giao diện Sidebar & quản lý toàn bộ phân hệ
│   │
│   ├── App.jsx                # Router chính điều hướng các View & quản lý Auth State
│   └── main.jsx               # Entrypoint nạp ReactDOM vào thẻ #root
```

---

## 🛠️ Hướng Dẫn Chạy Dự Án Cho Thành Viên Nhóm

### 1. Cài đặt thư viện:
```bash
cd frontend
npm install
```

### 2. Chạy môi trường phát triển (Hot Reload):
```bash
npm run dev
```
* Ứng dụng chạy tại: `http://localhost:3000`
* Tự động Proxy tất cả các request `/api/...` về Spring Boot Backend đang chạy ở cổng `http://localhost:8080`.

### 3. Build đóng gói cho Spring Boot:
```bash
npm run build
```
* Lệnh này sẽ biên dịch toàn bộ React component thành bundle tối ưu và tự động xuất ra thư mục `backend/src/main/resources/static/`.

---

## 💡 Quy Chuẩn Khi Thêm Một Tính Năng Mới (New Feature Guide)

Khi bạn được giao phát triển một chức năng mới (Ví dụ: `flashcards` hoặc `mock-test`):

1. **Tạo thư mục mới trong `src/features/`:**
   ```
   src/features/flashcards/
   ├── components/
   │   ├── FlashcardCard.jsx
   │   └── FlashcardDeckModal.jsx
   └── FlashcardPageView.jsx
   ```
2. **Import View vào `src/App.jsx`:**
   - Khai báo state hoặc view route trong `App.jsx`.
   - Kết nối với `Navbar.jsx` hoặc `ManagerDashboardPage.jsx` khi cần hiển thị menu.
3. **Gọi API bằng `apiRequest`:**
   - Sử dụng hàm chuẩn từ `import { apiRequest } from '../../api/apiRequest';` để được tự động đính kèm JWT token và xử lý lỗi hệ thống đồng nhất.
