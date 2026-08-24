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
        <div className="brand-group" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }} title="JLMS - Back to Home">
          <div className="brand-icon">⛩️</div>
          <span className="brand-title">
            JLMS
          </span>
        </div>

        {/* Nav Links */}
        <ul className="nav-links">
          
          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'culture_reader' ? 'active' : ''}`}
              onClick={() => onNavigate('culture_reader')}
              title="Explore Japanese Culture & Slang Articles"
              style={{ whiteSpace: 'nowrap' }}
            >
              Culture Articles
            </a>
          </li>

          <li>
            <a
              className={`nav-link highlight-tab ${currentView === 'courses' ? 'active' : ''}`}
              onClick={() => onNavigate('courses')}
              title="Explore and enroll in JLPT Japanese courses"
            >
              Courses
            </a>
          </li>

          <li>
            <a
              className={`nav-link highlight-tab ${(currentView === 'free_courses' || currentView === 'grammar_reader' || currentView === 'kanji' || currentView === 'vocab' || currentView === 'kanji-decks' || currentView === 'exercise_practice') ? 'active' : ''}`}
              onClick={() => onNavigate('free_courses')}
              title="Free Japanese Learning Hub (Grammar, Vocabulary, Kanji, Practice Quiz)"
            >
              🎁 Free Courses
            </a>
          </li>

          {/* Student Role Items */}
          {currentUser?.role === 'Student' && (
            <>
              <li>
                <a
                  className={`nav-link highlight-tab ${currentView === 'decks' ? 'active' : ''}`}
                  onClick={() => onNavigate('decks')}
                  title="Manage your personal flashcard decks"
                >
                  Decks
                </a>
              </li>
              <li>
                <a
                  className={`nav-link highlight-tab ${currentView === 'student_exams' ? 'active' : ''}`}
                  onClick={() => onNavigate('student_exams')}
                  title="Take mock exams and view score history"
                >
                  Mock Exams
                </a>
              </li>
            </>
          )}

          {/* Error Reports link for Student */}
          {currentUser?.role === 'Student' && (
            <li>
              <a
                className="nav-link"
                onClick={() => onNavigate('error-reports')}
                title="View error report history"
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
                ⚠️ Error Reports
              </a>
            </li>
          )}

          {/* Role Portals */}
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
          
          {(currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager') && (
            <>
              <li>
                <a
                  className={`nav-link highlight-tab ${currentView === 'materials' ? 'active' : ''}`}
                  onClick={() => onNavigate('materials')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Learning Materials
                </a>
              </li>

              <li>
                <a
                  className="nav-link"
                  onClick={() => onNavigate('error-reports')}
                  title="Manage Student Error Reports"
                  style={{
                    whiteSpace: 'nowrap',
                    color: '#e11d48',
                    backgroundColor: currentView === 'error-reports' ? '#ffe4e6' : '#fff1f2',
                    border: `1px solid ${currentView === 'error-reports' ? '#fb7185' : '#fecdd3'}`,
                    fontWeight: '700',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem'
                  }}
                >
                  🚨 Error Reports
                </a>
              </li>
            </>
          )}
          
          {currentUser?.role === 'Manager' && (
            <li>
              <a
                className={`nav-link highlight-tab ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
                style={{ whiteSpace: 'nowrap' }}
              >
                Manager Dashboard
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