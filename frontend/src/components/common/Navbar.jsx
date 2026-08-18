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

        {/* Các tab chức năng ở giữa (Đã bỏ button Home) */}
        <ul className="nav-links">
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'culture_reader' ? 'active' : ''}`}
              onClick={() => onNavigate('culture_reader')}
              title="Khám phá tạp chí văn hóa & tiếng lóng"
            >
              🌸 Culture & Slang
            </a>
          </li>
          {currentUser?.role === 'Author' && (
            <li>
              <a
                className={`nav-link ${currentView === 'culture_articles' ? 'active' : ''}`}
                onClick={() => onNavigate('culture_articles')}
              >
                ✍️ Author Workspace
              </a>
            </li>
          )}
          {currentUser?.role === 'Lecturer' && (
            <li>
              <a
                className={`nav-link ${currentView === 'materials' ? 'active' : ''}`}
                onClick={() => onNavigate('materials')}
              >
                📚 Learning Materials
              </a>
            </li>
          )}
          {currentUser?.role === 'Manager' && (
            <li>
              <a
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
              >
                👑 Manager Portal
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
