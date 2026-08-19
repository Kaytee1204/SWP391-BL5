import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { JLPT_LEVELS } from '../../../assets/constants';

export default function EditGrammarExerciseModal({ exercise, onClose, onUpdateSuccess }) {
  const [jlptLevel, setJlptLevel] = useState(exercise.jlptLevel || 'N5');
  const [questionText, setQuestionText] = useState(exercise.questionText || '');
  const [optionA, setOptionA] = useState(exercise.optionA || '');
  const [optionB, setOptionB] = useState(exercise.optionB || '');
  const [optionC, setOptionC] = useState(exercise.optionC || '');
  const [optionD, setOptionD] = useState(exercise.optionD || '');
  const [correctOption, setCorrectOption] = useState(exercise.correctOption || 'A');
  const [explanation, setExplanation] = useState(exercise.explanation || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        jlptLevel,
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption,
        explanation: explanation.trim()
      };

      const res = await apiRequest(`/grammar-exercises/${exercise.exerciseId}`, 'PUT', body);
      alert('Grammar exercise updated successfully!');
      if (onUpdateSuccess) onUpdateSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              ✏️ Edit Grammar Exercise
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Exercise #{exercise.exerciseId} • Last updated {new Date(exercise.updatedAt || exercise.createdAt).toLocaleDateString()}
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
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem' }}>
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
                Correct Answer *
              </label>
              <select
                value={correctOption}
                onChange={e => setCorrectOption(e.target.value)}
                className="form-select"
                style={{ fontWeight: 800, color: '#16a34a' }}
                required
              >
                <option value="A">Option A is Correct</option>
                <option value="B">Option B is Correct</option>
                <option value="C">Option C is Correct</option>
                <option value="D">Option D is Correct</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Question Stem / Sentence with Gap *
            </label>
            <input
              type="text"
              placeholder="e.g. わたしは パン (  ) たべます。"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* 4 Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: correctOption === 'A' ? '#16a34a' : 'inherit' }}>
                Option A * {correctOption === 'A' && '✓ (Correct)'}
              </label>
              <input
                type="text"
                value={optionA}
                onChange={e => setOptionA(e.target.value)}
                className="form-input"
                style={{ borderColor: correctOption === 'A' ? '#86efac' : undefined, background: correctOption === 'A' ? '#f0fdf4' : undefined }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: correctOption === 'B' ? '#16a34a' : 'inherit' }}>
                Option B * {correctOption === 'B' && '✓ (Correct)'}
              </label>
              <input
                type="text"
                value={optionB}
                onChange={e => setOptionB(e.target.value)}
                className="form-input"
                style={{ borderColor: correctOption === 'B' ? '#86efac' : undefined, background: correctOption === 'B' ? '#f0fdf4' : undefined }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: correctOption === 'C' ? '#16a34a' : 'inherit' }}>
                Option C * {correctOption === 'C' && '✓ (Correct)'}
              </label>
              <input
                type="text"
                value={optionC}
                onChange={e => setOptionC(e.target.value)}
                className="form-input"
                style={{ borderColor: correctOption === 'C' ? '#86efac' : undefined, background: correctOption === 'C' ? '#f0fdf4' : undefined }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: correctOption === 'D' ? '#16a34a' : 'inherit' }}>
                Option D * {correctOption === 'D' && '✓ (Correct)'}
              </label>
              <input
                type="text"
                value={optionD}
                onChange={e => setOptionD(e.target.value)}
                className="form-input"
                style={{ borderColor: correctOption === 'D' ? '#86efac' : undefined, background: correctOption === 'D' ? '#f0fdf4' : undefined }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Grammar Explanation & Notes
            </label>
            <textarea
              placeholder="Explain grammar rules and reasoning..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '110px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
