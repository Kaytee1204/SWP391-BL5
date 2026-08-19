import React, { useMemo, useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { JLPT_LEVELS } from '../../../assets/constants';

const SKILL_OPTIONS = [
  { value: 'vocabulary', label: '📖 Vocabulary (Từ vựng)' },
  { value: 'grammar', label: '✍️ Grammar (Ngữ pháp)' },
  { value: 'listening', label: '🎧 Listening (Nghe hiểu)' },
  { value: 'reading', label: '📑 Reading (Đọc hiểu)' }
];

const emptyQuestion = {
  skillType: 'vocabulary',
  jlptLevel: 'N5',
  questionType: 'multiple_choice',
  questionText: '',
  choices: ['', '', '', ''],
  correctAnswers: [],
  explanation: ''
};

export default function QuestionFormModal({ question, onClose, onSaved }) {
  const initial = useMemo(() => question ? {
    skillType: question.skillType || 'vocabulary',
    jlptLevel: question.jlptLevel || 'N5',
    questionType: question.questionType || 'multiple_choice',
    questionText: question.questionText || '',
    choices: question.questionType === 'multiple_choice'
      ? (question.choices?.length ? [...question.choices] : ['', '', '', ''])
      : ['', ''],
    correctAnswers: question.correctAnswers?.length ? [...question.correctAnswers] : [],
    explanation: question.explanation || ''
  } : emptyQuestion, [question]);

  const [form, setForm] = useState(initial);
  const [blankAnswers, setBlankAnswers] = useState(
    question?.questionType === 'fill_blank' ? (question.correctAnswers || []).join('\n') : ''
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isMultipleChoice = form.questionType === 'multiple_choice';

  const updateChoice = (index, value) => {
    const previousValue = form.choices[index];
    const nextChoices = [...form.choices];
    nextChoices[index] = value;
    setForm(prev => ({
      ...prev,
      choices: nextChoices,
      correctAnswers: prev.correctAnswers.map(answer => answer === previousValue ? value : answer)
    }));
  };

  const removeChoice = (index) => {
    const removed = form.choices[index];
    setForm(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
      correctAnswers: prev.correctAnswers.filter(answer => answer !== removed)
    }));
  };

  const toggleCorrectAnswer = (choice) => {
    if (!choice.trim()) return;
    setForm(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers.includes(choice)
        ? prev.correctAnswers.filter(answer => answer !== choice)
        : [...prev.correctAnswers, choice]
    }));
  };

  const handleTypeChange = (questionType) => {
    setError('');
    setForm(prev => ({
      ...prev,
      questionType,
      choices: prev.choices.length >= 2 ? prev.choices : ['', '', '', ''],
      correctAnswers: questionType === 'multiple_choice' ? [] : prev.correctAnswers
    }));
    if (questionType === 'fill_blank' && form.questionType === 'multiple_choice') {
      setBlankAnswers(form.correctAnswers.join('\n'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const choices = form.choices.map(value => value.trim()).filter(Boolean);
    const correctAnswers = isMultipleChoice
      ? form.correctAnswers.map(value => value.trim()).filter(Boolean)
      : blankAnswers.split('\n').map(value => value.trim()).filter(Boolean);

    if (!form.questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }
    if (isMultipleChoice && choices.length < 2) {
      setError('Multiple choice questions require at least 2 choices.');
      return;
    }
    if (correctAnswers.length === 0) {
      setError('Please select or input at least one correct answer.');
      return;
    }
    if (isMultipleChoice && !correctAnswers.every(answer => choices.includes(answer))) {
      setError('All correct answers must be among the provided choices.');
      return;
    }

    const payload = {
      skillType: form.skillType,
      jlptLevel: form.jlptLevel,
      questionType: form.questionType,
      questionText: form.questionText.trim(),
      choices: isMultipleChoice ? choices : [],
      correctAnswers: [...new Set(correctAnswers)],
      explanation: form.explanation.trim()
    };

    setSaving(true);
    try {
      const endpoint = question ? `/question-bank/${question.questionId}` : '/question-bank';
      const response = await apiRequest(endpoint, question ? 'PUT' : 'POST', payload);
      onSaved(response.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={event => event.stopPropagation()} style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              🗂️ JLPT QUESTION BANK
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0 0', color: 'var(--text-heading)' }}>
              {question ? `Edit Question #${question.questionId}` : 'Create New Question'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '1.1rem',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Classification Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                Skill Type (Kỹ năng) *
              </label>
              <select className="form-select" value={form.skillType} onChange={e => setForm({ ...form, skillType: e.target.value })}>
                {SKILL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                JLPT Level (Cấp độ) *
              </label>
              <select className="form-select" value={form.jlptLevel} onChange={e => setForm({ ...form, jlptLevel: e.target.value })}>
                {JLPT_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                Question Type (Dạng bài) *
              </label>
              <select className="form-select" value={form.questionType} onChange={e => handleTypeChange(e.target.value)}>
                <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
                <option value="fill_blank">Fill in the Blank (Điền từ)</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
              Question Content (Nội dung câu hỏi) *
            </label>
            <textarea
              className="form-textarea"
              value={form.questionText}
              onChange={e => setForm({ ...form, questionText: e.target.value })}
              placeholder="e.g. わたしは まいにち 日本語 (  ) べんきょうします。"
              rows={3}
              required
            />
          </div>

          {/* Choices Section */}
          {isMultipleChoice ? (
            <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>Answer Choices & Correct Answer:</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Click checkbox on the left to mark an option as correct.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, choices: [...prev.choices, ''] }))}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: '#ede9fe',
                    color: '#6b21a8',
                    border: '1px solid #ddd6fe',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ＋ Add Choice
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {form.choices.map((choice, index) => {
                  const labelChar = String.fromCharCode(65 + index);
                  const isChecked = form.correctAnswers.includes(choice) && Boolean(choice.trim());
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        background: isChecked ? '#ecfdf5' : '#fff',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${isChecked ? '#10b981' : '#e2e8f0'}`
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: choice.trim() ? 'pointer' : 'not-allowed',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          background: isChecked ? '#10b981' : '#f1f5f9',
                          color: isChecked ? '#fff' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}
                        title={choice.trim() ? 'Click to mark as correct' : 'Enter text first'}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCorrectAnswer(choice)}
                          disabled={!choice.trim()}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{labelChar}</span>
                      </label>

                      <input
                        type="text"
                        className="form-input"
                        value={choice}
                        onChange={e => updateChoice(index, e.target.value)}
                        placeholder={`Choice ${labelChar}...`}
                        style={{ flex: 1, padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1' }}
                        required
                      />

                      {form.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            padding: '0 0.4rem'
                          }}
                          title="Remove option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                Accepted Answers (Đáp án chấp nhận, mỗi đáp án 1 dòng) *
              </label>
              <textarea
                className="form-textarea"
                value={blankAnswers}
                onChange={e => setBlankAnswers(e.target.value)}
                placeholder={'Enter each valid answer on a new line\ne.g.: を\nオ'}
                rows={3}
                required
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
              Explanation & Study Notes (Giải thích ngữ pháp & ngữ cảnh)
            </label>
            <textarea
              className="form-textarea"
              value={form.explanation}
              onChange={e => setForm({ ...form, explanation: e.target.value })}
              placeholder="Explain why the answer is correct, usage nuances, or vocabulary context..."
              rows={3}
              maxLength={5000}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-dash btn-dash-primary" disabled={saving}>
              {saving ? 'Saving...' : question ? '💾 Save Changes' : '✨ Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
