import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';

export default function ForgotPasswordModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1: Enter Email to get OTP, 2: Enter OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/forgot-password', 'POST', {
        email: email.trim()
      });

      if (res?.data?.demoOtp) {
        setDemoOtpNotice(res.data.demoOtp);
        setOtp(res.data.demoOtp); // Auto-fill demo OTP for convenience
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/auth/reset-password', 'POST', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          onClose();
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              🔑 Reset Password
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {step === 1 ? 'Step 1: Request 6-digit OTP code' : 'Step 2: Enter OTP and create new password'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>Password Reset Successfully!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '0.35rem' }}>
              Redirecting you to the login screen...
            </p>
          </div>
        ) : step === 1 ? (
          /* STEP 1: Enter email */
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Registered Email Address *
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-dash btn-dash-secondary"
                onClick={onSwitchToLogin || onClose}
                style={{ flex: 1 }}
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-purple"
                style={{ flex: 2 }}
              >
                {loading ? 'Sending...' : 'Send OTP Code →'}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Enter OTP & New Password */
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {demoOtpNotice && (
              <div style={{ padding: '0.65rem 0.85rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '0.82rem', color: '#047857' }}>
                💡 <strong>Demo Mode OTP Code:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '2px', fontSize: '1rem' }}>{demoOtpNotice}</span>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.2rem' }}>Valid for 5 minutes. Auto-filled below for testing.</div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Account Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="form-input"
                style={{ background: '#f8fafc', color: '#64748b' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>6-Digit OTP Code *</label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Resend OTP
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 849201"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="form-input"
                style={{ letterSpacing: '4px', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                New Password *
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <button
                type="button"
                className="btn-dash btn-dash-secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-purple"
                style={{ flex: 2 }}
              >
                {loading ? 'Verifying...' : '💾 Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
