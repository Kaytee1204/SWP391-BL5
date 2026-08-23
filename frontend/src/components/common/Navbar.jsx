import React from 'react';
import FbProfileDropdown from './FbProfileDropdown';

export default function Navbar({
  currentView,
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onLogout,
  extraAction
}) {
  // currentView và onNavigate tạo thành cơ chế điều hướng dùng chung của ứng dụng:
  // Navbar không tự quản lý trang hiện tại mà chỉ phát tên view về App.jsx.
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Click vào Logo là về thẳng Trang Chủ */}
        <div
          className="brand-group"
          onClick={() => onNavigate('landing')}
          title="JLMS - Về Trang Chủ"
        >
          <div className="brand-icon">⛩️</div>
          <div className="brand-title">
            <span>JLMS</span>
          </div>
        </div>

        {/* Các tab chức năng ở giữa */}
        <ul className="nav-links">
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'landing' || currentView === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('landing')}
              title="Return to Homepage"
            >
              Home
            </a>
          </li>
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'culture_reader' ? 'active' : ''}`}
              onClick={() => onNavigate('culture_reader')}
              title="Khám phá tạp chí văn hóa & tiếng lóng"
            >
              Culture Article
            </a>
          </li>
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'grammar_reader' ? 'active' : ''}`}
              onClick={() => onNavigate('grammar_reader')}
              title="Master Japanese JLPT Grammar Patterns"
            >
              Grammar (文法)
            </a>
          </li>
          <li>
            
          </li>
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'vocab' ? 'active' : ''}`}
              onClick={() => onNavigate('vocab')}
              title="Japanese Vocabulary"
            >
              Vocabulary
            </a>
          </li>
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'kanji' ? 'active' : ''}`}
              onClick={() => onNavigate('kanji')}
              title="Japanese Kanji"
            >
              Kanji
            </a>
          </li>
          {currentUser?.role === 'Student' && (
            // Personal Deck gắn với tài khoản học viên, vì vậy không hiển thị cho role khác.
            // Đây chỉ là kiểm soát giao diện; API vẫn xác định chủ deck từ JWT.
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'decks' ? 'active' : ''}`}
                onClick={() => onNavigate('decks')}
                title="Manage your personal decks"
              >
                Decks
              </a>
            </li>
          )}
          {currentUser && (currentUser.role === 'Student' || currentUser.role === 'Lecturer' || currentUser.role === 'Manager') && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'exercise_practice' ? 'active' : ''}`}
                onClick={() => onNavigate('exercise_practice')}
                title="Practice Japanese Grammar Multiple-Choice Quizzes"
              >
                📝 Practice Quiz
              </a>
            </li>
          )}
          {currentUser?.role === 'Author' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'culture_articles' ? 'active' : ''}`}
                onClick={() => onNavigate('culture_articles')}
              >
                Author Workspace
              </a>
            </li>
          )}
          {currentUser?.role === 'Lecturer' && (
            // Các màn hình quản trị Vocab/Kanji nằm bên trong Learning Materials.
            // Chỉ Lecturer thấy lối vào này; backend tiếp tục bảo vệ API thay đổi dữ liệu.
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'materials' ? 'active' : ''}`}
                onClick={() => onNavigate('materials')}
              >
                Learning Materials
              </a>
            </li>
          )}
          {currentUser?.role === 'Manager' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
              >
                Manager Portal
              </a>
            </li>
          )}
        </ul>

        {/* Nhóm button CTA góc phải chuẩn hóa đồng nhất */}
        <div className="nav-cta-group">
          {extraAction}

          {currentUser ? (
            <FbProfileDropdown
              currentUser={currentUser}
              onViewProfile={onViewProfile}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          ) : (
            <>
              <button className="btn-login" onClick={() => onOpenAuth('login')}>
                Log In
              </button>
              <button className="btn-primary-purple" onClick={() => onOpenAuth('register')}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
