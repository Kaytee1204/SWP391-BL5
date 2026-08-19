import React from 'react';
import { BookOpen, Layers, LogOut, Users, Sparkles } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, currentUser }) => {
  const isStudent = currentUser?.role === 'Student';

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.replace('/login.html?returnTo=learning.html');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo" onClick={() => setCurrentTab('vocab')}>
          <div className="brand-icon">日</div>
          <div>
            <span className="brand-name">Nihongo Platform</span>
            <span className="brand-tag">CRUD Studio</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button className={`nav-btn ${currentTab === 'vocab' ? 'active' : ''}`} onClick={() => setCurrentTab('vocab')}>
                <BookOpen size={18} />
                <span>Từ vựng</span>
              </button>
            </li>
            <li>
              <button className={`nav-btn ${currentTab === 'kanji' ? 'active' : ''}`} onClick={() => setCurrentTab('kanji')}>
                <span className="jp-font font-bold">漢</span>
                <span>Kanji</span>
              </button>
            </li>
            {isStudent && <li>
              <button className={`nav-btn ${currentTab === 'vocab-decks' ? 'active' : ''}`} onClick={() => setCurrentTab('vocab-decks')}>
                <Layers size={18} />
                <span>Decks Từ vựng</span>
              </button>
            </li>}
            {isStudent && <li>
              <button className={`nav-btn ${currentTab === 'kanji-decks' ? 'active' : ''}`} onClick={() => setCurrentTab('kanji-decks')}>
                <Sparkles size={18} />
                <span>Decks Kanji</span>
              </button>
            </li>}
            {currentUser?.role === 'Manager' && <li>
              <button className={`nav-btn ${currentTab === 'accounts' ? 'active' : ''}`} onClick={() => setCurrentTab('accounts')}>
                <Users size={18} />
                <span>Quản lý Account</span>
              </button>
            </li>}
            <li>
              <button className="nav-btn" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất">
                <LogOut size={18} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
