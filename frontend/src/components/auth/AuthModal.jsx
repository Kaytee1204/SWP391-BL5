import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthModal({ initialMode, onLoginSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [jlptTargetLevel, setJlptTargetLevel] = useState('N5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (showForgot) {
    return (
      <ForgotPasswordModal
        onClose={onClose}
        onSwitchToLogin={() => setShowForgot(false)}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const cleanName = fullName.trim();
        if (cleanName.length < 2) {
          setError('Họ và tên phải có tối thiểu 2 ký tự');
          setLoading(false);
          return;
        }
        if (cleanName.length > 200) {
          setError(`Họ và tên không được vượt quá 200 ký tự (Hiện tại: ${cleanName.length} ký tự)`);
          alert(`⚠️ Họ và tên không được vượt quá 200 ký tự! (Hiện tại: ${cleanName.length} ký tự)`);
          setLoading(false);
          return;
        }

        const res = await apiRequest('/auth/register', 'POST', {
          email: email.trim(),
          password: password.trim(),
          fullName: cleanName,
          jlptTargetLevel,
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji',
          role: 'Student'
        });
        alert('Đăng ký tài khoản thành công!');
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

  const isNameExceeded = fullName.length > 200;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isRegister ? 'Create JLMS Account' : 'Log In to JLMS'}
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
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <span>Full Name *</span>
                <span style={{ color: isNameExceeded ? '#e11d48' : '#64748b', fontWeight: isNameExceeded ? 800 : 600 }}>
                  {fullName.length}/200 {isNameExceeded && '⚠️ (Vượt quá 200 ký tự)'}
                </span>
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="form-input"
                style={{
                  borderColor: isNameExceeded ? '#ef4444' : undefined,
                  boxShadow: isNameExceeded ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : undefined
                }}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email Address *</label>
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Password *</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>JLPT Target Level</label>
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
            {loading ? 'Processing...' : isRegister ? 'Create Free Account' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer' }}>
                Log in now
              </button>
            </span>
          ) : (
            <div>
              <div>
                Don't have an account?{' '}
                <button onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer' }}>
                  Sign up free
                </button>
              </div>
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
