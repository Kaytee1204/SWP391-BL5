import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import QuestionFormModal from './components/QuestionFormModal';

const SKILLS = [
  { value: '', label: 'All Skills (Tất cả kỹ năng)' },
  { value: 'vocabulary', label: '📖 Vocabulary (Từ vựng)' },
  { value: 'grammar', label: '✍️ Grammar (Ngữ pháp)' },
  { value: 'listening', label: '🎧 Listening (Nghe hiểu)' },
  { value: 'reading', label: '📑 Reading (Đọc hiểu)' }
];

const SKILL_CONFIG = {
  vocabulary: { label: 'Vocabulary', icon: '📖', color: '#0284c7', bg: '#e0f2fe' },
  grammar: { label: 'Grammar', icon: '✍️', color: '#7c3aed', bg: '#ede9fe' },
  listening: { label: 'Listening', icon: '🎧', color: '#059669', bg: '#d1fae5' },
  reading: { label: 'Reading', icon: '📑', color: '#d97706', bg: '#fef3c7' }
};

const LEVEL_COLORS = {
  N5: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  N4: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  N3: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  N2: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  N1: { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' }
};

export default function QuestionBankManagementView({ currentUser }) {
  const [questions, setQuestions] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ keyword: '', skillType: '', jlptLevel: '', questionType: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), size: '10', sort: 'createdAt,desc' });
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value && value.trim()) params.set(key, value.trim());
    });
    try {
      const response = await apiRequest(`/question-bank?${params.toString()}`);
      const data = response.data || {};
      setQuestions(data.content || []);
      setPageInfo({
        page: data.page || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      });
    } catch (err) {
      setError(err.message || 'Unable to load question bank.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const empty = { keyword: '', skillType: '', jlptLevel: '', questionType: '' };
    setFilters(empty);
    setPage(0);
    setAppliedFilters(empty);
  };

  const handleDelete = async (question) => {
    if (!window.confirm(`Delete question #${question.questionId}? This action cannot be undone.`)) return;
    try {
      await apiRequest(`/question-bank/${question.questionId}`, 'DELETE');
      if (questions.length === 1 && page > 0) setPage(page - 1);
      else fetchQuestions();
    } catch (err) {
      window.alert(`Failed to delete question: ${err.message}`);
    }
  };

  const handleSaved = () => {
    setPage(0);
    if (page === 0) fetchQuestions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 60%, #581c87 100%)',
        color: '#fff',
        padding: '1.75rem 2rem',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(76, 29, 149, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            color: '#fed7aa'
          }}>
            {currentUser?.role === 'Manager' ? '🛡️ MANAGER WORKSPACE' : '🎓 LECTURER WORKSPACE'}
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
            JLPT Multi-Skill Question Bank
          </h2>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.85, fontSize: '0.9rem', maxWidth: '600px' }}>
            Manage and curate test questions across all JLPT levels (Vocabulary, Grammar, Listening, Reading).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            padding: '0.65rem 1.25rem',
            borderRadius: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fef08a' }}>{pageInfo.totalElements}</div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Total Questions</div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '0.75rem 1.4rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>➕</span>
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <form onSubmit={applyFilters} style={{
        background: '#fff',
        padding: '1.2rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            className="form-input"
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Search question text or explanation..."
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          className="form-select"
          value={filters.skillType}
          onChange={e => setFilters({ ...filters, skillType: e.target.value })}
        >
          {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select
          className="form-select"
          value={filters.jlptLevel}
          onChange={e => setFilters({ ...filters, jlptLevel: e.target.value })}
        >
          <option value="">All Levels (Tất cả cấp độ)</option>
          {JLPT_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        <select
          className="form-select"
          value={filters.questionType}
          onChange={e => setFilters({ ...filters, questionType: e.target.value })}
        >
          <option value="">All Types (Tất cả dạng)</option>
          <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
          <option value="fill_blank">Fill in the Blank (Điền từ)</option>
        </select>

        <button type="submit" className="btn-dash btn-dash-primary" style={{ padding: '0.6rem 1.1rem' }}>
          Filter
        </button>

        <button type="button" onClick={resetFilters} className="btn-dash btn-dash-secondary" style={{ padding: '0.6rem 0.9rem' }}>
          Reset
        </button>
      </form>

      {/* 3. Question List Table Card */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600 }}>Loading question bank...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#e11d48' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <div style={{ fontWeight: 700 }}>{error}</div>
            <button className="btn-dash btn-dash-secondary" onClick={fetchQuestions} style={{ marginTop: '1rem' }}>Retry</button>
          </div>
        ) : questions.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗂️</div>
            <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>No Questions Found</h4>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or click "+ Add New Question" to create one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '45%' }}>Question Content</th>
                  <th style={{ padding: '1rem 1rem' }}>Classification</th>
                  <th style={{ padding: '1rem 1rem' }}>Correct Answer</th>
                  <th style={{ padding: '1rem 1rem' }}>Author / Date</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => {
                  const isExpanded = expandedId === q.questionId;
                  const levelCfg = LEVEL_COLORS[q.jlptLevel] || LEVEL_COLORS.N5;
                  const skillCfg = SKILL_CONFIG[q.skillType] || { label: q.skillType, icon: '📌', color: '#475569', bg: '#f1f5f9' };

                  return (
                    <React.Fragment key={q.questionId}>
                      <tr style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isExpanded ? '#faf5ff' : idx % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background 0.2s'
                      }}>
                        {/* Question Text */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              background: '#f1f5f9',
                              color: '#64748b',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}>
                              #{q.questionId}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div
                                onClick={() => setExpandedId(isExpanded ? null : q.questionId)}
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-heading)',
                                  fontSize: '0.95rem',
                                  cursor: 'pointer',
                                  marginBottom: '0.25rem'
                                }}
                                title="Click to expand details & options"
                              >
                                {q.questionText}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                <span>Type: <strong>{q.questionType === 'multiple_choice' ? 'Multiple Choice' : 'Fill in Blank'}</strong></span>
                                <span>•</span>
                                <span
                                  onClick={() => setExpandedId(isExpanded ? null : q.questionId)}
                                  style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Skill & Level Badges */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                            <span style={{
                              padding: '0.2rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: levelCfg.color,
                              background: levelCfg.bg,
                              border: `1px solid ${levelCfg.border}`
                            }}>
                              {q.jlptLevel}
                            </span>
                            <span style={{
                              padding: '0.2rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: skillCfg.color,
                              background: skillCfg.bg
                            }}>
                              {skillCfg.icon} {skillCfg.label}
                            </span>
                          </div>
                        </td>

                        {/* Correct Answer */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {(q.correctAnswers || []).map((ans, aIdx) => (
                              <span
                                key={aIdx}
                                style={{
                                  padding: '0.25rem 0.6rem',
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  borderRadius: '8px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  border: '1px solid #a7f3d0'
                                }}
                              >
                                ✓ {ans}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Created By & Date */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.85rem' }}>
                            {q.createdByName || 'Lecturer'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {q.updatedAt ? new Date(q.updatedAt).toLocaleDateString('en-US') : '—'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => setEditingQuestion(q)}
                              style={{
                                padding: '0.45rem 0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                color: '#334155',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Edit Question"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(q)}
                              style={{
                                padding: '0.45rem 0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #fecdd3',
                                background: '#fff1f2',
                                color: '#e11d48',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Delete Question"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Drawer */}
                      {isExpanded && (
                        <tr style={{ background: '#fdfbfe', borderBottom: '2px solid #e9d5ff' }}>
                          <td colSpan="5" style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{
                              background: '#fff',
                              borderRadius: '12px',
                              padding: '1.25rem',
                              border: '1px solid #e9d5ff',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem'
                            }}>
                              {/* Choices for Multiple Choice */}
                              {q.choices && q.choices.length > 0 && (
                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b21a8', marginBottom: '0.5rem' }}>
                                    Answer Choices ({q.choices.length} options):
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                                    {q.choices.map((c, cIdx) => {
                                      const isCorrect = q.correctAnswers?.includes(c);
                                      const labelChar = String.fromCharCode(65 + cIdx);
                                      return (
                                        <div
                                          key={cIdx}
                                          style={{
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '10px',
                                            background: isCorrect ? '#ecfdf5' : '#f8fafc',
                                            border: `1.5px solid ${isCorrect ? '#10b981' : '#e2e8f0'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.65rem'
                                          }}
                                        >
                                          <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: isCorrect ? '#10b981' : '#cbd5e1',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: '0.75rem'
                                          }}>
                                            {labelChar}
                                          </span>
                                          <span style={{ flex: 1, fontWeight: isCorrect ? 800 : 500, color: isCorrect ? '#065f46' : '#334155' }}>
                                            {c}
                                          </span>
                                          {isCorrect && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                              CORRECT
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Explanation Box */}
                              <div style={{
                                background: '#fffbeb',
                                border: '1px solid #fef08a',
                                borderRadius: '10px',
                                padding: '0.85rem 1.1rem'
                              }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span>💡</span>
                                  <span>Grammar & Context Explanation:</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f', lineHeight: 1.5 }}>
                                  {q.explanation || 'No explanation provided for this question.'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination */}
        {!loading && !error && questions.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
            <PaginationBar page={pageInfo.page} totalPages={pageInfo.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* 5. Modals */}
      {showCreate && <QuestionFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editingQuestion && <QuestionFormModal question={editingQuestion} onClose={() => setEditingQuestion(null)} onSaved={handleSaved} />}
    </div>
  );
}
