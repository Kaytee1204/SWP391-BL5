import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { AVATAR_PRESETS, JLPT_LEVELS } from '../../assets/constants';

export default function MyProfileModal({ currentUser, onClose, onUpdateSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0].url);
  const [jlptTargetLevel, setJlptTargetLevel] = useState(currentUser?.jlptTargetLevel || 'N5');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        email: email.trim(),
        fullName: fullName.trim(),
        avatarUrl,
        jlptTargetLevel
      };
      if (newPassword.trim()) body.newPassword = newPassword.trim();
      
      // Mọi role (Student, Lecturer, Author, Manager) đều gọi endpoint /auth/me
      const res = await apiRequest('/auth/me', 'PUT', body);
      onUpdateSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h4 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 800 }}>
          {isEditing ? 'Chỉnh Sửa Hồ Sơ & Avatar' : 'Thông Tin Tài Khoản Cá Nhân'}
        </h4>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        {!isEditing ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url}
              alt="avt"
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                margin: '0 auto 0.75rem',
                border: '3px solid var(--primary-orange-border)',
                background: '#fff7ed',
                boxShadow: '0 6px 16px rgba(249, 115, 22, 0.15)'
              }}
            />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{currentUser?.fullName}</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>{currentUser?.email}</p>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`role-badge role-${currentUser?.role?.toLowerCase()}`}>{currentUser?.role}</span>
            </div>

            <div style={{
              background: '#fbf9f5',
              borderRadius: '14px',
              padding: '1.1rem',
              margin: '1.25rem 0',
              textAlign: 'left',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.88rem'
            }}>
              <div><strong>Mã Tài Khoản:</strong> #{currentUser?.accountId}</div>
              <div><strong>Mục tiêu JLPT:</strong> <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>{currentUser?.jlptTargetLevel || 'N5'}</span></div>
              <div><strong>Trạng thái:</strong> <span className="status-badge active">{currentUser?.status}</span></div>
              <div><strong>Ngày tham gia:</strong> {currentUser?.createdAt ? new Date(currentUser?.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button className="btn-dash btn-dash-secondary" onClick={onClose}>Đóng</button>
              <button className="btn-dash btn-dash-primary" onClick={() => setIsEditing(true)}>
                ✏️ Chỉnh Sửa Profile & Avatar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-body)' }}>Chọn Avatar:</label>
              <div style={{ margin: '0.5rem auto' }}>
                <img src={avatarUrl} alt="prev" style={{ width: '74px', height: '74px', borderRadius: '50%', border: '3px solid var(--primary-orange)', background: '#fff7ed' }} />
              </div>
              <div className="avatar-grid">
                {AVATAR_PRESETS.map(p => (
                  <div
                    key={p.id}
                    className={`avatar-option ${avatarUrl === p.url ? 'selected' : ''}`}
                    onClick={() => setAvatarUrl(p.url)}
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Họ và tên *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Địa chỉ Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mục tiêu JLPT</label>
              <select value={jlptTargetLevel} onChange={e => setJlptTargetLevel(e.target.value)} className="form-select">
                {JLPT_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mật khẩu mới (Để trống nếu không đổi)</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự..." className="form-input" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button type="button" className="btn-dash btn-dash-secondary" onClick={() => setIsEditing(false)}>Hủy</button>
              <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
                {loading ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
