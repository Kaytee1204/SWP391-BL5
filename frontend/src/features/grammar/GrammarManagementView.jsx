import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import CreateGrammarModal from './components/CreateGrammarModal';
import EditGrammarModal from './components/EditGrammarModal';

export default function GrammarManagementView({ currentUser }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [onlyMyPatterns, setOnlyMyPatterns] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = onlyMyPatterns ? '/grammar-patterns/my-patterns' : '/grammar-patterns';
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (selectedLevel) params.append('jlptLevel', selectedLevel);
      params.append('size', '50');

      const url = `${endpoint}?${params.toString()}`;
      const res = await apiRequest(url, 'GET');
      setPatterns(res.data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load grammar patterns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [selectedLevel, onlyMyPatterns]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatterns();
  };

  const handleDelete = async (pattern) => {
    if (!window.confirm(`Are you sure you want to delete "${pattern.title}"?`)) {
      return;
    }

    try {
      await apiRequest(`/grammar-patterns/${pattern.patternId}`, 'DELETE');
      setPatterns(prev => prev.filter(p => p.patternId !== pattern.patternId));
      alert('Grammar pattern deleted successfully!');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const isLecturer = currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#fff',
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.18)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            📖 Japanese Grammar Patterns Management
          </h2>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
            Manage and publish comprehensive JLPT grammar formulas, rules, and example sentences
          </p>
        </div>
        {isLecturer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-dash"
            style={{
              background: '#fff',
              color: '#6d28d9',
              fontWeight: 800,
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ➕ Add Grammar Pattern
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          {/* Level Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.3rem' }}>
              Level:
            </span>
            <button
              onClick={() => setSelectedLevel('')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: selectedLevel === '' ? '#7C3AED' : '#e2e8f0',
                background: selectedLevel === '' ? '#7C3AED' : '#fff',
                color: selectedLevel === '' ? '#fff' : 'var(--text-body)',
                cursor: 'pointer'
              }}
            >
              All Levels
            </button>
            {JLPT_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                onClick={() => setSelectedLevel(lvl.value)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: selectedLevel === lvl.value ? '#7C3AED' : '#e2e8f0',
                  background: selectedLevel === lvl.value ? '#7C3AED' : '#fff',
                  color: selectedLevel === lvl.value ? '#fff' : 'var(--text-body)',
                  cursor: 'pointer'
                }}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Toggle "My Patterns" for Lecturers / Managers */}
          {isLecturer && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyMyPatterns}
                onChange={e => setOnlyMyPatterns(e.target.checked)}
                style={{ accentColor: '#7C3AED', width: '16px', height: '16px' }}
              />
              Show Only My Created Patterns
            </label>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            placeholder="Search grammar title, formula structure, or meaning..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-dash btn-dash-primary" style={{ padding: '0.55rem 1.25rem' }}>
            🔍 Search
          </button>
          {keyword && (
            <button
              type="button"
              className="btn-dash btn-dash-secondary"
              onClick={() => {
                setKeyword('');
                fetchPatterns();
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Grammar Patterns Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading Japanese grammar patterns...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
            ⚠️ {error}
          </div>
        ) : patterns.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
            <div style={{ fontWeight: 700 }}>No grammar patterns found.</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Try adjusting your search criteria or add a new pattern above.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="clean-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Level</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Grammar Pattern</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Structure Formula</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Author / Creator</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Updated</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p) => {
                  const isOwner = currentUser && (
                    p.createdByAccountId === currentUser.accountId ||
                    p.createdById === currentUser.accountId ||
                    currentUser.role === 'Manager'
                  );
                  const canEdit = isOwner;

                  return (
                    <tr key={p.patternId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: p.jlptLevel === 'N1' ? '#fee2e2' : p.jlptLevel === 'N2' ? '#fef3c7' : p.jlptLevel === 'N3' ? '#dcfce7' : p.jlptLevel === 'N4' ? '#e0e7ff' : '#ede9fe',
                          color: p.jlptLevel === 'N1' ? '#991b1b' : p.jlptLevel === 'N2' ? '#92400e' : p.jlptLevel === 'N3' ? '#166534' : p.jlptLevel === 'N4' ? '#3730a3' : '#5b21b6'
                        }}>
                          {p.jlptLevel}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                          {p.title}
                        </div>
                        {p.usageNote && (
                          <div style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.2rem',
                            maxWidth: '320px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.usageNote}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <code style={{
                          background: '#f1f5f9',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          fontSize: '0.82rem',
                          color: '#0f172a',
                          fontWeight: 600
                        }}>
                          {p.structure || '—'}
                        </code>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <img
                            src={p.createdByAvatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.createdByName || 'Sensei'}`}
                            alt="avt"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.85rem', lineHeight: 1.2 }}>
                              {p.createdByName || 'System'}
                            </strong>
                            {p.createdByEmail && (
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {p.createdByEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => setEditingPattern(p)}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  color: '#334155',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p)}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #fecdd3',
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem', alignSelf: 'center' }}>Read-only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGrammarModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => fetchPatterns()}
        />
      )}

      {editingPattern && (
        <EditGrammarModal
          pattern={editingPattern}
          onClose={() => setEditingPattern(null)}
          onUpdateSuccess={() => fetchPatterns()}
        />
      )}
    </div>
  );
}