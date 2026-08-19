import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { JLPT_LEVELS } from '../../../assets/constants';

export default function CreateGrammarModal({ onClose, onCreateSuccess }) {
  const [jlptLevel, setJlptLevel] = useState('N5');
  const [title, setTitle] = useState('');
  const [structure, setStructure] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        jlptLevel,
        title: title.trim(),
        structure: structure.trim(),
        usageNote: usageNote.trim()
      };

      const res = await apiRequest('/grammar-patterns', 'POST', body);
      alert('Grammar pattern created successfully!');
      if (onCreateSuccess) onCreateSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create grammar pattern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              📝 Add New Grammar Pattern
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Create a Japanese grammar point for learners (N1 - N5)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                JLPT Level *
              </label>
              <select
                value={jlptLevel}
                onChange={e => setJlptLevel(e.target.value)}
                className="form-select"
                required
              >
                {JLPT_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Grammar Title / Pattern Name *
              </label>
              <input
                type="text"
                placeholder="e.g. 〜てもいいです (Permission: May / Can do)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Grammar Formation / Structure Formula *
            </label>
            <input
              type="text"
              placeholder="e.g. V-て + もいいです"
              value={structure}
              onChange={e => setStructure(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Usage Notes, Explanations & Examples
            </label>
            <textarea
              placeholder="Describe usage rules, nuances, and sample sentences with readings and translations..."
              value={usageNote}
              onChange={e => setUsageNote(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '140px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Creating...' : '✨ Save Grammar Pattern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
