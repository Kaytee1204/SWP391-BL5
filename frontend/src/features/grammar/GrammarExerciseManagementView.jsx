import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import CreateGrammarExerciseModal from './components/CreateGrammarExerciseModal';
import EditGrammarExerciseModal from './components/EditGrammarExerciseModal';

export default function GrammarExerciseManagementView({ currentUser }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [onlyMyExercises, setOnlyMyExercises] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = onlyMyExercises ? '/grammar-exercises/my-exercises' : '/grammar-exercises';
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (selectedLevel) params.append('jlptLevel', selectedLevel);
      params.append('size', '50');

      const res = await apiRequest(`${endpoint}?${params.toString()}`, 'GET');
      setExercises(res.data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedLevel, onlyMyExercises]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExercises();
  };

  const handleDelete = async (exercise) => {
    if (!window.confirm(`Are you sure you want to delete exercise #${exercise.exerciseId}: "${exercise.questionText}"?`)) {
      return;
    }

    try {
      await apiRequest(`/grammar-exercises/${exercise.exerciseId}`, 'DELETE');
      setExercises(prev => prev.filter(e => e.exerciseId !== exercise.exerciseId));
      alert('Exercise deleted successfully!');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const isLecturerOrManager = currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        color: '#fff',
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(13, 148, 136, 0.2)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            📝 Grammar Practice Exercises Management
          </h2>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
            Create and maintain 4-choice JLPT grammar question banks with detailed explanations
          </p>
        </div>
        {isLecturerOrManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-dash"
            style={{
              background: '#fff',
              color: '#0f766e',
              fontWeight: 800,
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ➕ Add Grammar Exercise
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
                borderColor: selectedLevel === '' ? '#0d9488' : '#e2e8f0',
                background: selectedLevel === '' ? '#0d9488' : '#fff',
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
                  borderColor: selectedLevel === lvl.value ? '#0d9488' : '#e2e8f0',
                  background: selectedLevel === lvl.value ? '#0d9488' : '#fff',
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#0f766e' }}>
              <input
                type="checkbox"
                checked={onlyMyExercises}
                onChange={e => setOnlyMyExercises(e.target.checked)}
                style={{ accentColor: '#0d9488', width: '16px', height: '16px' }}
              />
              Show only my exercises
            </label>
          )}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by question text or grammatical explanation..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-dash btn-dash-primary" style={{ padding: '0.6rem 1.25rem', background: '#0d9488' }}>
            🔍 Search
          </button>
        </form>
      </div>

      {/* Table Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading grammar exercises...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
            ⚠️ {error}
          </div>
        ) : exercises.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No grammar exercises found. Click <strong>"➕ Add Grammar Exercise"</strong> to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '50px' }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', width: '80px' }}>JLPT</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Question Stem</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Options (A / B / C / D)</th>
                  <th style={{ padding: '0.85rem 1rem', width: '100px' }}>Answer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Created By</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex) => {
                  const canEdit = currentUser?.role === 'Manager' || (currentUser?.role === 'Lecturer' && ex.createdById === currentUser?.accountId);

                  return (
                    <tr key={ex.exerciseId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#94a3b8' }}>
                        #{ex.exerciseId}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: ex.jlptLevel === 'N5' ? '#dcfce7' : ex.jlptLevel === 'N4' ? '#e0e7ff' : ex.jlptLevel === 'N3' ? '#fef3c7' : ex.jlptLevel === 'N2' ? '#ffedd5' : '#fee2e2',
                          color: ex.jlptLevel === 'N5' ? '#15803d' : ex.jlptLevel === 'N4' ? '#4338ca' : ex.jlptLevel === 'N3' ? '#b45309' : ex.jlptLevel === 'N2' ? '#c2410c' : '#b91c1c'
                        }}>
                          {ex.jlptLevel}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-heading)', maxWidth: '280px' }}>
                        {ex.questionText}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.75rem' }}>
                          <span style={{ color: ex.correctOption === 'A' ? '#16a34a' : 'inherit', fontWeight: ex.correctOption === 'A' ? 800 : 500 }}>
                            A: {ex.optionA}
                          </span>
                          <span style={{ color: ex.correctOption === 'B' ? '#16a34a' : 'inherit', fontWeight: ex.correctOption === 'B' ? 800 : 500 }}>
                            B: {ex.optionB}
                          </span>
                          <span style={{ color: ex.correctOption === 'C' ? '#16a34a' : 'inherit', fontWeight: ex.correctOption === 'C' ? 800 : 500 }}>
                            C: {ex.optionC}
                          </span>
                          <span style={{ color: ex.correctOption === 'D' ? '#16a34a' : 'inherit', fontWeight: ex.correctOption === 'D' ? 800 : 500 }}>
                            D: {ex.optionD}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#dcfce7',
                          color: '#15803d',
                          fontWeight: 900,
                          fontSize: '0.85rem'
                        }}>
                          {ex.correctOption}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-body)' }}>
                        {ex.createdByName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {canEdit ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => setEditingExercise(ex)}
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
                              onClick={() => handleDelete(ex)}
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
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Read-only</span>
                        )}
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
        <CreateGrammarExerciseModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => fetchExercises()}
        />
      )}

      {editingExercise && (
        <EditGrammarExerciseModal
          exercise={editingExercise}
          onClose={() => setEditingExercise(null)}
          onUpdateSuccess={() => fetchExercises()}
        />
      )}
    </div>
  );
}
