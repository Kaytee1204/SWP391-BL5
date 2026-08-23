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
        <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
              style={{ whiteSpace: 'nowrap' }}
            >
              Culture Article
            </a>
          </li>

          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'courses' ? 'active' : ''}`}
              onClick={() => onNavigate('courses')}
              title="Khám phá và đăng ký các khóa học tiếng Nhật JLPT"
              style={{ whiteSpace: 'nowrap' }}
            >
              Courses
            </a>
          </li>

          <li>
            <a
              className={`nav-link highlight-tab ${
                currentView === 'free_courses' ||
                currentView === 'grammar_reader' ||
                currentView === 'kanji' ||
                currentView === 'kanji-decks' ||
                currentView === 'exercise_practice'
                  ? 'active'
                  : ''
              }`}
              onClick={() => onNavigate('free_courses')}
              title="Khóa học & Tài nguyên học tiếng Nhật miễn phí (Grammar, Kanji, Quiz)"
              style={{ whiteSpace: 'nowrap' }}
            >
              🎁 Free Courses
            </a>
          </li>
          
          {currentUser?.role === 'Student' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'kanji-decks' ? 'active' : ''}`}
                onClick={() => onNavigate('kanji-decks')}
                title="Manage your personal Kanji decks"
                style={{ whiteSpace: 'nowrap' }}
              >
                Kanji Decks
              </a>
            </li>
          )}
          
          {currentUser && (currentUser.role === 'Student' || currentUser.role === 'Lecturer' || currentUser.role === 'Manager') && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'exercise_practice' ? 'active' : ''}`}
                onClick={() => onNavigate('exercise_practice')}
                title="Practice Japanese Grammar Multiple-Choice Quizzes"
                style={{ whiteSpace: 'nowrap' }}
              >
                 Practice Quiz
              </a>
            </li>
          )}

          {/* Báo lỗi button */}
          {currentUser?.role === 'Student' && (
            <li>
              <a
                className="nav-link"
                onClick={() => onNavigate('error-reports')}
                title="Theo dõi lịch sử báo lỗi"
                style={{
                  whiteSpace: 'nowrap',
                  color: '#e11d48',
                  backgroundColor: currentView === 'error-reports' ? '#ffe4e6' : '#fff1f2',
                  border: `1px solid ${currentView === 'error-reports' ? '#fb7185' : '#fecdd3'}`,
                  fontWeight: '600',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
              >
                ⚠️ Báo lỗi
              </a>
            </li>
          )}

          {/* Phân hệ Role */}
          {currentUser?.role === 'Author' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'culture_articles' ? 'active' : ''}`}
                onClick={() => onNavigate('culture_articles')}
                style={{ whiteSpace: 'nowrap' }}
              >
                Author Workspace
              </a>
            </li>
          )}
          
          {currentUser?.role === 'Lecturer' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'materials' ? 'active' : ''}`}
                onClick={() => onNavigate('materials')}
                style={{ whiteSpace: 'nowrap' }}
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
                style={{ whiteSpace: 'nowrap' }}
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