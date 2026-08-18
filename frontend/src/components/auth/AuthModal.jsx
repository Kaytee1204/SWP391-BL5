import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';

export default function AuthModal({ initialMode, onLoginSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [jlptTargetLevel, setJlptTargetLevel] = useState('N5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await apiRequest('/auth/register', 'POST', {
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          jlptTargetLevel,
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji',
          role: 'Student'
        });
        alert('Tài khoản đã được đăng ký thành công!');
        onLoginSuccess(res.data);
      } else {
        const res = await apiRequest('/auth/login', 'POST', {
          email: email.trim(),
          password: password.trim()
        });
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isRegister ? 'Tạo Tài Khoản JLMS' : 'Đăng Nhập JLMS'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Họ và tên *</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Địa chỉ Email *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mật khẩu *</label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mục tiêu JLPT</label>
              <select
                value={jlptTargetLevel}
                onChange={e => setJlptTargetLevel(e.target.value)}
                className="form-select"
              >
                {JLPT_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-purple"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Tạo Tài Khoản Miễn Phí' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
          {isRegister ? (
            <span>
              Đã có tài khoản?{' '}
              <button onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer' }}>
                Đăng nhập ngay
              </button>
            </span>
          ) : (
            <span>
              Chưa có tài khoản?{' '}
              <button onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer' }}>
                Đăng ký miễn phí
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
