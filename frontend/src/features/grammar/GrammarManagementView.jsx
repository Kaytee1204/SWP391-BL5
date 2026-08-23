import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import CreateGrammarModal from './components/CreateGrammarModal';
import EditGrammarModal from './components/EditGrammarModal';
import ManageExamplesModal from './components/ManageExamplesModal'; // 1. IMPORT MODAL VÍ DỤ

export default function GrammarManagementView({ currentUser }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [onlyMyPatterns, setOnlyMyPatterns] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  
  // 2. KHAI BÁO STATE QUẢN LÝ MODAL VÍ DỤ
  const [selectedPatternForExamples, setSelectedPatternForExamples] = useState(null);

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
                {lvl.value}
              </button>
            ))}
          </div>

          {/* Toggle for Lecturer */}
          {currentUser?.role === 'Lecturer' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#6d28d9' }}>
              <input
                type="checkbox"
                checked={onlyMyPatterns}
                onChange={e => setOnlyMyPatterns(e.target.checked)}
                style={{ accentColor: '#7C3AED', width: '16px', height: '16px' }}
              />
              Show only my patterns
            </label>
          )}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by pattern name, structure formula, or usage explanation..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-dash btn-dash-primary" style={{ padding: '0.6rem 1.25rem' }}>
            🔍 Search
          </button>
        </form>
      </div>

      {/* Table Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading grammar patterns...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
            ⚠️ {error}
          </div>
        ) : patterns.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No grammar patterns found. Click <strong>"➕ Add Grammar Pattern"</strong> to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '60px' }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', width: '90px' }}>JLPT</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Pattern Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Structure Formula</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Created By</th>
                  <th style={{ padding: '0.85rem 1rem', width: '120px' }}>Updated</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p) => {
                  const canEdit = currentUser?.role === 'Manager' || (currentUser?.role === 'Lecturer' && p.createdById === currentUser?.accountId);

                  return (
                    <tr key={p.patternId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#94a3b8' }}>
                        #{p.patternId}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: p.jlptLevel === 'N5' ? '#dcfce7' : p.jlptLevel === 'N4' ? '#e0e7ff' : p.jlptLevel === 'N3' ? '#fef3c7' : p.jlptLevel === 'N2' ? '#ffedd5' : '#fee2e2',
                          color: p.jlptLevel === 'N5' ? '#15803d' : p.jlptLevel === 'N4' ? '#4338ca' : p.jlptLevel === 'N3' ? '#b45309' : p.jlptLevel === 'N2' ? '#c2410c' : '#b91c1c'
                        }}>
                          {p.jlptLevel}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {p.title}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <code style={{
                          background: '#f1f5f9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.84rem',
                          color: '#6d28d9',
                          fontWeight: 600,
                          fontFamily: 'monospace'
                        }}>
                          {p.structure}
                        </code>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-body)' }}>
                        {p.createdByName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          
                          {/* 3. NÚT MỞ MODAL VÍ DỤ (Tất cả mọi người đều được xem, nhưng CRUD phụ thuộc vào Modal) */}
                          <button
                            onClick={() => setSelectedPatternForExamples(p)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #c7d2fe',
                              background: '#e0e7ff',
                              color: '#4f46e5',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            💬 Ví dụ
                          </button>

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

      {/* 4. RENDER MODAL QUẢN LÝ VÍ DỤ (Sẽ chỉ render khi selectedPatternForExamples có giá trị) */}
      {selectedPatternForExamples && (
        <ManageExamplesModal
          pattern={selectedPatternForExamples}
          currentUser={currentUser}
          onClose={() => setSelectedPatternForExamples(null)}
        />
      )}
    </div>
  );
}