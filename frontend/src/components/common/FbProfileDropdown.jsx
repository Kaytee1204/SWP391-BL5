import React, { useState, useEffect, useRef } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';
import { ChevronDown, User, Shield, BookOpen, Compass, LogOut } from 'lucide-react';

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

  const getRoleConfig = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return {
          label: 'Manager',
          color: '#6d28d9',
          background: '#ede9fe',
          border: '1px solid #ddd6fe',
          iconBg: '#ede9fe',
          iconColor: '#6d28d9'
        };
      case 'lecturer':
        return {
          label: 'Lecturer',
          color: '#b45309',
          background: '#fef3c7',
          border: '1px solid #fde68a',
          iconBg: '#fef3c7',
          iconColor: '#b45309'
        };
      case 'author':
        return {
          label: 'Author',
          color: '#be185d',
          background: '#fce7f3',
          border: '1px solid #fbcfe8',
          iconBg: '#fce7f3',
          iconColor: '#be185d'
        };
      default:
        return {
          label: 'Student',
          color: '#059669',
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          iconBg: '#dcfce7',
          iconColor: '#059669'
        };
    }
  };

  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Profile Pill Button */}
      <button
        className={`fb-profile-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`${currentUser?.fullName || 'User'} (${roleConfig.label})`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 14px 4px 6px',
          borderRadius: '9999px',
          border: isOpen ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
          background: isOpen ? '#faf5ff' : '#ffffff',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 4px 14px rgba(124, 58, 237, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        {/* Avatar */}
        <div style={{ width: '36px', height: '36px', position: 'relative', flexShrink: 0 }}>
          <img
            src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url}
            alt="avt"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          />
          {/* Active Status Dot */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #ffffff'
          }} />
        </div>

        {/* Name & Role Badge Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          gap: '2px'
        }}>
          <span style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            maxWidth: '220px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em'
          }}>
            {currentUser?.fullName || 'User'}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '1.5px 7px',
              borderRadius: '6px',
              lineHeight: 1.2,
              color: roleConfig.color,
              background: roleConfig.background,
              border: roleConfig.border
            }}
          >
            {roleConfig.label}
          </span>
        </div>

        {/* Dropdown Chevron Arrow */}
        <ChevronDown
          size={16}
          style={{
            color: isOpen ? '#7c3aed' : '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, color 0.2s ease',
            marginLeft: '2px'
          }}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="fb-dropdown-menu" style={{ minWidth: '280px' }}>
          {/* User Card */}
          <div className="fb-user-card" style={{ padding: '0.85rem' }}>
            <div className="fb-user-card-header" style={{ gap: '0.75rem' }}>
              <img
                src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url}
                alt="avt"
                className="fb-user-card-avatar"
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', wordBreak: 'break-word' }}>
                  {currentUser?.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                  {currentUser?.email}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      color: roleConfig.color,
                      background: roleConfig.background,
                      border: roleConfig.border
                    }}
                  >
                    {roleConfig.label}
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
              <User size={15} />
              <span>View & Edit Profile</span>
            </button>
          </div>

          {/* Role-specific Portals */}
          {currentUser?.role === 'Manager' && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('dashboard');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                  <Shield size={16} />
                </div>
                <div>
                  <div className="fb-menu-title">Manager Dashboard</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>System Management Portal</div>
                </div>
              </div>
              <span className="fb-menu-arrow">›</span>
            </div>
          )}

          {(currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager') && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('materials');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="fb-menu-title">Learning Materials</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Grammar, Exercises, Vocab & Courses</div>
                </div>
              </div>
              <span className="fb-menu-arrow">›</span>
            </div>
          )}

          {(currentUser?.role === 'Author' || currentUser?.role === 'Manager') && (
            <div
              className="fb-menu-item"
              onClick={() => {
                setIsOpen(false);
                onNavigate('culture_articles');
              }}
            >
              <div className="fb-menu-item-left">
                <div className="fb-menu-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                  🌸
                </div>
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
              <div className="fb-menu-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>
                <Compass size={16} />
              </div>
              <div>
                <div className="fb-menu-title">Culture & Slang</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Reader Magazine</div>
              </div>
            </div>
            <span className="fb-menu-arrow">›</span>
          </div>

          <div className="fb-divider"></div>

          {/* Log out item */}
          <div
            className="fb-menu-item fb-menu-logout"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <div className="fb-menu-item-left">
              <div className="fb-menu-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                <LogOut size={16} />
              </div>
              <div className="fb-menu-title" style={{ color: '#e11d48', fontWeight: 700 }}>Log Out</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
