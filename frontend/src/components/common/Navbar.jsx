import React from 'react';
import FbProfileDropdown from './FbProfileDropdown';

export default function Navbar({
  currentView,
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onLogout,
  extraAction,
}) {
  // currentView và onNavigate tạo thành cơ chế điều hướng dùng chung của ứng dụng:
  // Navbar không tự quản lý trang hiện tại mà chỉ phát tên view về App.jsx.
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Group */}
        <div className="brand-group" onClick={() => onNavigate('home')}>
          <div className="brand-icon">⛩️</div>
          <span className="brand-title">
            JLMS

          </span>
        </div>

        {/* Nav Links */}
        <ul className="nav-links">
          <li>
            <a
              className={`nav-link ${currentView === 'home' || currentView === 'landing' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
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
              className={`nav-link highlight-tab ${currentView === 'courses' ? 'active' : ''}`}
              onClick={() => onNavigate('courses')}
              title="Khám phá và đăng ký các khóa học tiếng Nhật JLPT"
            >
              Courses
            </a>
          </li>
          <li>
            <a
              className={`nav-link highlight-tab ${(currentView === 'free_courses' || currentView === 'grammar_reader' || currentView === 'kanji' || currentView === 'kanji-decks' || currentView === 'exercise_practice') ? 'active' : ''}`}
              onClick={() => onNavigate('free_courses')}
              title="Khóa học & Tài nguyên học tiếng Nhật miễn phí (Grammar, Kanji, Quiz)"
            >
              🎁 Free Courses
            </a>
          </li>

          {/* Phân hệ Role */}
          {currentUser?.role === 'Student' && (
            <>
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'decks' ? 'active' : ''}`}
                onClick={() => onNavigate('decks')}
                title="Manage your personal decks"
              >
                Decks
              </a>
            </li>
            <li><a className={`nav-link highlight-tab ${currentView === 'student_exams' ? 'active' : ''}`}
              onClick={() => onNavigate('student_exams')} title="Làm đề và xem lịch sử điểm">Mock Exams</a></li>
            </>
          )}
          {currentUser && (currentUser.role === 'Student' || currentUser.role === 'Lecturer' || currentUser.role === 'Manager') && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'exercise_practice' ? 'active' : ''}`}
                onClick={() => onNavigate('exercise_practice')}
                title="Practice Japanese Grammar Multiple-Choice Quizzes"
              >
                 Practice Quiz
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

        {/* CTA Group */}
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
