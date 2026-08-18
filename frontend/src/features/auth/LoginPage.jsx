import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';

export default function LoginPage({ onLoginSuccess, onBackHome }) {
  const [isRegister, setIsRegister] = useState(false);
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
      let res;
      if (isRegister) {
        res = await apiRequest('/auth/register', 'POST', {
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          jlptTargetLevel,
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji',
          role: 'Student'
        });
      } else {
        res = await apiRequest('/auth/login', 'POST', {
          email: email.trim(),
          password: password.trim()
        });
      }

      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(180deg, #fff7ed 0%, #fff1f2 30%, #f5f3ff 65%, #ede9fe 100%)',
      position: 'relative'
    }}>
      <div className="bg-canvas-glow"></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem 2.25rem',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 25px 60px -15px rgba(124, 58, 237, 0.2)'
      }}>
        {onBackHome && (
          <button
            onClick={onBackHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-body)',
              marginBottom: '1.25rem',
              cursor: 'pointer'
            }}
          >
            <span>←</span>
            <span>Quay lại Trang Chủ</span>
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #ec4899 100%)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
            marginBottom: '0.75rem'
          }}>
            ⛩️
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
            <span>JLMS</span>
          </h1>
          <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Tạo tài khoản học tiếng Nhật miễn phí' : 'Đăng nhập vào hệ thống JLMS'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#e11d48', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Họ và tên *</label>
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Địa chỉ Email *</label>
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Mật khẩu *</label>
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Mục tiêu JLPT</label>
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

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-body)' }}>
          {isRegister ? (
            <span>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Đăng nhập
              </button>
            </span>
          ) : (
            <span>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Đăng ký miễn phí
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
