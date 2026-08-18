import React, { useState, useEffect, useRef } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';

export default function FbProfileDropdown({ currentUser, onViewProfile, onNavigate, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className={`fb-profile-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="User Profile"
      >
        <div className="fb-avatar-wrap">
          <img src={currentUser.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" />
          <div className="fb-avatar-badge">▼</div>
        </div>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', paddingRight: '4px' }}>
          {currentUser.fullName}
        </span>
      </button>

      {isOpen && (
        <div className="fb-dropdown-menu">
          <div className="fb-user-card">
            <div className="fb-user-card-header">
              <img src={currentUser.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" className="fb-user-card-avatar" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
                <div style={{ marginTop: '3px' }}>
                  <span className={`role-badge role-${currentUser.role?.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="fb-view-profile-btn"
              onClick={() => {
                setIsOpen(false);
                onViewProfile();
              }}
            >
              <span>👤</span>
              <span>View & Edit Profile</span>
            </button>
          </div>

          {currentUser.role === 'Manager' && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('dashboard');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>👑</div>
                <div>
                  <div className="fb-menu-title">Manager Dashboard</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>System Management Portal</div>
                </div>
              </div>
              <span className="fb-menu-arrow">›</span>
            </div>
          )}

          {currentUser.role === 'Lecturer' && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('materials');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#fef3c7', color: '#b45309' }}>📚</div>
                <div>
                  <div className="fb-menu-title">Learning Materials</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Lecturer Area</div>
                </div>
              </div>
              <span className="fb-menu-arrow">›</span>
            </div>
          )}

          {currentUser.role === 'Author' && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('culture_articles');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#fce7f3', color: '#be185d' }}>🌸</div>
                <div>
                  <div className="fb-menu-title">Cultural Articles</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Author Workspace</div>
                </div>
              </div>
              <span className="fb-menu-arrow">›</span>
            </div>
          )}

          <div
            className="fb-menu-item"
            onClick={() => {
              setIsOpen(false);
              onNavigate('culture_reader');
            }}
          >
            <div className="fb-menu-item-left">
              <div className="fb-menu-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>⛩️</div>
              <div>
                <div className="fb-menu-title">Culture & Slang</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Reader Magazine</div>
              </div>
            </div>
            <span className="fb-menu-arrow">›</span>
          </div>

          <div className="fb-divider"></div>

          <div
            className="fb-menu-item fb-menu-logout"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <div className="fb-menu-item-left">
              <div className="fb-menu-icon">🚪</div>
              <div className="fb-menu-title" style={{ color: '#e11d48', fontWeight: 700 }}>Log Out</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
