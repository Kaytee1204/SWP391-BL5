import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';

export default function GrammarExercisePracticeView({ currentUser, onOpenAuth }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('N5');
  
  // Track student's answers: { [exerciseId]: 'A' | 'B' | 'C' | 'D' }
  const [userAnswers, setUserAnswers] = useState({});

  const fetchExercises = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedLevel) params.append('jlptLevel', selectedLevel);
      params.append('size', '50');

      const res = await apiRequest(`/grammar-exercises?${params.toString()}`, 'GET');
      setExercises(res.data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load grammar exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchExercises();
    }
  }, [selectedLevel, currentUser]);

  const handleSelectOption = (exerciseId, optionKey) => {
    // If already answered this exercise, don't allow changing
    if (userAnswers[exerciseId]) return;

    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: optionKey
    }));
  };

  const handleResetQuiz = () => {
    if (window.confirm('Do you want to reset your practice answers for this level?')) {
      setUserAnswers({});
    }
  };

  // Stats
  const totalCount = exercises.length;
  const answeredCount = Object.keys(userAnswers).filter(id => exercises.some(e => e.exerciseId === Number(id))).length;
  const correctCount = exercises.filter(e => userAnswers[e.exerciseId] === e.correctOption).length;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem' }}>
            Grammar Practice Quiz is Locked
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Please log in with your Student, Lecturer, or Manager account to practice JLPT grammar multiple-choice exercises and track your score.
          </p>
          <button
            onClick={() => onOpenAuth && onOpenAuth('login')}
            className="btn-primary-purple"
            style={{ padding: '0.75rem 2rem' }}
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
        color: '#fff',
        padding: '2.25rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          padding: '0.3rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '1px',
          marginBottom: '0.65rem',
          border: '1px solid rgba(255,255,255,0.25)'
        }}>
          JLPT GRAMMAR QUIZ • 4-CHOICE PRACTICE
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
          Interactive Grammar Exercises
        </h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.92, fontSize: '0.92rem', lineHeight: 1.6 }}>
          Test your Japanese grammar mastery with instant grading, feedback, and in-depth explanations.
        </p>

        {/* Level Selector Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedLevel('')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: selectedLevel === '' ? '#fff' : 'rgba(255,255,255,0.18)',
              color: selectedLevel === '' ? '#0f766e' : '#fff'
            }}
          >
            All Levels
          </button>
          {JLPT_LEVELS.map(lvl => (
            <button
              key={lvl.value}
              onClick={() => setSelectedLevel(lvl.value)}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: selectedLevel === lvl.value ? '#fff' : 'rgba(255,255,255,0.18)',
                color: selectedLevel === lvl.value ? '#0f766e' : '#fff'
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score Tracker Bar */}
      {totalCount > 0 && (
        <div className="card" style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#f0fdfa',
          borderColor: '#ccfbf1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>Progress:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {answeredCount} / {totalCount} answered
              </div>
            </div>
            {answeredCount > 0 && (
              <div>
                <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: scorePercent >= 70 ? '#16a34a' : '#ea580c' }}>
                  {correctCount} / {answeredCount} ({scorePercent}%)
                </div>
              </div>
            )}
          </div>

          {answeredCount > 0 && (
            <button
              onClick={handleResetQuiz}
              style={{
                background: '#fff',
                border: '1px solid #99f6e4',
                color: '#0f766e',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Reset Answers
            </button>
          )}
        </div>
      )}

      {/* Exercises List */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading exercises...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
          ⚠️ {error}
        </div>
      ) : exercises.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.5rem' }}>
            No exercises available for this level
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            Check back soon or select another JLPT level to practice!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {exercises.map((ex, index) => {
            const selectedOpt = userAnswers[ex.exerciseId];
            const isAnswered = Boolean(selectedOpt);
            const isCorrect = selectedOpt === ex.correctOption;

            const options = [
              { key: 'A', text: ex.optionA },
              { key: 'B', text: ex.optionB },
              { key: 'C', text: ex.optionC },
              { key: 'D', text: ex.optionD }
            ];

            return (
              <div
                key={ex.exerciseId}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: isAnswered
                    ? (isCorrect ? '1.5px solid #86efac' : '1.5px solid #fca5a5')
                    : '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      background: ex.jlptLevel === 'N5' ? '#dcfce7' : ex.jlptLevel === 'N4' ? '#e0e7ff' : ex.jlptLevel === 'N3' ? '#fef3c7' : ex.jlptLevel === 'N2' ? '#ffedd5' : '#fee2e2',
                      color: ex.jlptLevel === 'N5' ? '#15803d' : ex.jlptLevel === 'N4' ? '#4338ca' : ex.jlptLevel === 'N3' ? '#b45309' : ex.jlptLevel === 'N2' ? '#c2410c' : '#b91c1c'
                    }}>
                      {ex.jlptLevel}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      Question #{index + 1}
                    </span>
                  </div>

                  {isAnswered && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      background: isCorrect ? '#dcfce7' : '#fee2e2',
                      color: isCorrect ? '#166534' : '#991b1b'
                    }}>
                      {isCorrect ? '✓ Correct (+10 pts)' : '✕ Incorrect'}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {ex.questionText}
                </div>

                {/* 4 Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {options.map((opt) => {
                    let optBg = '#f8fafc';
                    let optBorder = '#e2e8f0';
                    let optColor = 'var(--text-heading)';

                    if (isAnswered) {
                      if (opt.key === ex.correctOption) {
                        // The correct option is ALWAYS highlighted in green after answering
                        optBg = '#dcfce7';
                        optBorder = '#86efac';
                        optColor = '#15803d';
                      } else if (opt.key === selectedOpt) {
                        // The wrongly selected option is highlighted in red
                        optBg = '#fee2e2';
                        optBorder = '#fca5a5';
                        optColor = '#b91c1c';
                      } else {
                        optBg = '#f8fafc';
                        optColor = '#94a3b8';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(ex.exerciseId, opt.key)}
                        disabled={isAnswered}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: `1.5px solid ${optBorder}`,
                          background: optBg,
                          color: optColor,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: isAnswered ? 'default' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: isAnswered && opt.key === ex.correctOption ? '#16a34a' : (isAnswered && opt.key === selectedOpt ? '#dc2626' : '#e2e8f0'),
                          color: isAnswered && (opt.key === ex.correctOption || opt.key === selectedOpt) ? '#fff' : '#475569',
                          fontSize: '0.82rem',
                          fontWeight: 900
                        }}>
                          {opt.key}
                        </span>
                        <span style={{ flex: 1 }}>{opt.text}</span>
                        {isAnswered && opt.key === ex.correctOption && <span>✓</span>}
                        {isAnswered && opt.key === selectedOpt && !isCorrect && <span>✕</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box (Revealed after answering) */}
                {isAnswered && (
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '1rem 1.25rem',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.6
                  }}>
                    <div style={{ fontWeight: 800, color: '#0f766e', marginBottom: '0.3rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      💡 Grammar Explanation:
                    </div>
                    {ex.explanation || 'Correct answer is ' + ex.correctOption + '.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
