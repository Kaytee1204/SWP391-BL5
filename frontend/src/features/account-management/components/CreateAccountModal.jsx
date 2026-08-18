import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { AVATAR_PRESETS, JLPT_LEVELS, ROLES } from '../../../assets/constants';

export default function CreateAccountModal({ onClose, onCreateSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [jlptTargetLevel, setJlptTargetLevel] = useState('N5');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        role,
        jlptTargetLevel,
        avatarUrl
      };

      const res = await apiRequest('/accounts', 'POST', body);
      alert('Account created successfully!');
      onCreateSuccess(res.data);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            + Add New Account
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)' }}>Choose Avatar:</label>
            <div style={{ margin: '0.4rem auto' }}>
              <img src={avatarUrl} alt="prev" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--primary-orange)', background: '#fff7ed' }} />
            </div>
            <div className="avatar-grid">
              {AVATAR_PRESETS.map(p => (
                <div key={p.id} className={`avatar-option ${avatarUrl === p.url ? 'selected' : ''}`} onClick={() => setAvatarUrl(p.url)} title={p.label}>
                  <img src={p.url} alt={p.label} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Full Name *</label>
            <input type="text" placeholder="e.g. Alex Johnson" value={fullName} onChange={e => setFullName(e.target.value)} className="form-input" required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Email Address *</label>
            <input type="email" placeholder="user@japanlearning.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Initial Password *</label>
            <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Role *</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="form-select">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>JLPT Target Level</label>
              <select value={jlptTargetLevel} onChange={e => setJlptTargetLevel(e.target.value)} className="form-select">
                {JLPT_LEVELS.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Creating...' : '+ Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
