import React, { useMemo, useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { JLPT_LEVELS } from '../../../assets/constants';

const SKILL_OPTIONS = [
  { value: 'vocabulary', label: '📖 Vocabulary (Từ vựng)' },
  { value: 'grammar', label: '✍️ Grammar (Ngữ pháp)' },
  { value: 'listening', label: '🎧 Listening (Nghe hiểu)' },
  { value: 'reading', label: '📑 Reading (Đọc hiểu)' }
];

const isChoiceType = (questionType) =>
  questionType === 'multiple_choice' || questionType === 'multiple_select';
const normalizeChoice = (value) =>
    value
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase();
const emptyQuestion = {
  skillType: 'vocabulary',
  jlptLevel: 'N5',
  questionType: 'multiple_choice',
  questionText: '',
  choices: ['', '', '', ''],
  correctAnswers: [],
  explanation: ''
};

export default function QuestionFormModal({
  question,
  onClose,
  onSaved,
  fixedClassification,
  onCreateRequest,
  contextLabel
}) {
  const initial = useMemo(() => question ? {
    skillType: question.skillType || 'vocabulary',
    jlptLevel: question.jlptLevel || 'N5',
    questionType: question.questionType || 'multiple_choice',
    questionText: question.questionText || '',
    choices: isChoiceType(question.questionType)
      ? (question.choices?.length ? [...question.choices] : ['', '', '', ''])
      : ['', ''],
    correctAnswers: question.correctAnswers?.length ? [...question.correctAnswers] : [],
    explanation: question.explanation || ''
  } : {
    ...emptyQuestion,
    skillType: fixedClassification?.skillType || emptyQuestion.skillType,
    jlptLevel: fixedClassification?.jlptLevel || emptyQuestion.jlptLevel
  }, [fixedClassification, question]);

  const [form, setForm] = useState(initial);
  const [blankAnswers, setBlankAnswers] = useState(
    question?.questionType === 'fill_blank' ? (question.correctAnswers || []).join('\n') : ''
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isSingleChoice =
      form.questionType === 'multiple_choice';

  const isMultipleSelect =
      form.questionType === 'multiple_select';

  const isChoiceQuestion =
      isSingleChoice || isMultipleSelect;

  const updateChoice = (index, value) => {
    const previousValue = form.choices[index];

    const nextChoices = [...form.choices];
    nextChoices[index] = value;

    const normalizedChoices = nextChoices
        .map(normalizeChoice)
        .filter(Boolean);

    const hasDuplicate =
        new Set(normalizedChoices).size
        !== normalizedChoices.length;

    setError(
        hasDuplicate
            ? 'Các lựa chọn đáp án không được trùng nội dung.'
            : ''
    );

    setForm(prev => ({
      ...prev,
      choices: nextChoices,

      /*
       * Nếu lựa chọn đang là đáp án đúng và nội dung
       * bị thay đổi, cập nhật lại correctAnswers.
       */
      correctAnswers: prev.correctAnswers.map(
          answer =>
              answer === previousValue
                  ? value
                  : answer
      )
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

    setForm(prev => {
      if (prev.questionType === 'multiple_choice') {
        return {
          ...prev,
          correctAnswers: [choice]
        };
      }

      if (prev.questionType === 'multiple_select') {
        const selected =
            prev.correctAnswers.includes(choice);

        return {
          ...prev,
          correctAnswers: selected
              ? prev.correctAnswers.filter(
                  answer => answer !== choice
              )
              : [...prev.correctAnswers, choice]
        };
      }

      return prev;
    });
  };

  const handleTypeChange = (questionType) => {
    setError('');

    if (questionType === 'fill_blank' && isChoiceType(form.questionType)) {
      setBlankAnswers(form.correctAnswers.join('\n'));
    }

    setForm(prev => ({
      ...prev,
      questionType,
      choices: isChoiceType(questionType) && prev.choices.length < 2
        ? ['', '', '', '']
        : prev.choices,
      correctAnswers: isChoiceType(questionType) ? [] : prev.correctAnswers
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const choices = form.choices.map(value => value.trim()).filter(Boolean);
    const normalizedChoices =
        choices.map(normalizeChoice);

    const hasDuplicateChoices =
        new Set(normalizedChoices).size
        !== normalizedChoices.length;
    const correctAnswers = isChoiceQuestion
      ? form.correctAnswers.map(value => value.trim()).filter(Boolean)
      : blankAnswers.split('\n').map(value => value.trim()).filter(Boolean);

    if (!form.questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }
    if (isChoiceQuestion && choices.length < 2) {
      setError('Câu hỏi lựa chọn phải có ít nhất 2 lựa chọn.');
      return;
    }
    if (
        isChoiceQuestion
        && hasDuplicateChoices
    ) {
      setError(
          'Các lựa chọn đáp án không được trùng nội dung.'
      );
      return;
    }
    if (correctAnswers.length === 0) {
      setError('Please select or input at least one correct answer.');
      return;
    }
    if (isSingleChoice && correctAnswers.length !== 1) {
      setError('Câu hỏi chọn một phải có đúng một đáp án đúng.');
      return;
    }
    if (isMultipleSelect && correctAnswers.length < 2) {
      setError('Câu hỏi chọn nhiều phải có ít nhất 2 đáp án đúng.');
      return;
    }
    if (isChoiceQuestion && !correctAnswers.every(answer => choices.includes(answer))) {
      setError('Tất cả đáp án đúng phải nằm trong danh sách lựa chọn.');
      return;
    }

    const payload = {
      skillType: form.skillType,
      jlptLevel: form.jlptLevel,
      questionType: form.questionType,
      questionText: form.questionText.trim(),
      choices: isChoiceQuestion ? choices : [],
      correctAnswers: [...new Set(correctAnswers)],
      explanation: form.explanation.trim()
    };

    setSaving(true);
    try {
      let response;
      if (!question && onCreateRequest) {
        response = await onCreateRequest(payload);
      } else {
        const endpoint = question ? `/question-bank/${question.questionId}` : '/question-bank';
        response = await apiRequest(endpoint, question ? 'PUT' : 'POST', payload);
      }
      onSaved(response.data);
      onClose();
    } catch (err) {
      if(err.status === 409){
        setError( 'A question with the same content and answer already exists. ' +
            'Please check the question bank.');
        return;
      }
      setError(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={onCreateRequest ? { zIndex: 1200 } : undefined}>
      <div className="modal-card" onClick={event => event.stopPropagation()} style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {contextLabel ? '🧩 QUESTION SET BUILDER' : '🗂️ JLPT QUESTION BANK'}
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0 0', color: 'var(--text-heading)' }}>
              {question ? `Edit Question #${question.questionId}` : contextLabel || 'Create New Question'}
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
              <select
                className="form-select"
                value={form.skillType}
                onChange={e => setForm({ ...form, skillType: e.target.value })}
                disabled={Boolean(fixedClassification?.skillType)}
              >
                {SKILL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                JLPT Level (Cấp độ) *
              </label>
              <select
                className="form-select"
                value={form.jlptLevel}
                onChange={e => setForm({ ...form, jlptLevel: e.target.value })}
                disabled={Boolean(fixedClassification?.jlptLevel)}
              >
                {JLPT_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '0.35rem' }}>
                Question Type (Dạng bài) *
              </label>
              <select className="form-select" value={form.questionType} onChange={e => handleTypeChange(e.target.value)}>
                <option value="multiple_choice">
                  Single Choice (Chọn một đáp án)
                </option>
                <option value="multiple_select">Multiple Select (Chọn nhiều đáp án)</option>
                <option value="fill_blank">Fill in the Blank (Điền từ)</option>
              </select>
            </div>
          </div>

          {fixedClassification && (
            <div style={{ marginTop: '-0.55rem', padding: '0.6rem 0.75rem', color: '#4338ca', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 650 }}>
              Skill và JLPT level được lấy tự động từ bộ câu hỏi hiện tại.
            </div>
          )}

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
          {isChoiceQuestion ? (
            <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>Answer Choices & Correct Answer:</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {isSingleChoice
                      ? 'Chọn đúng một đáp án.'
                      : 'Chọn từ hai đáp án đúng trở lên.'}
                  </div>
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
                  const labelChar =
                      String.fromCharCode(65 + index);

                  const normalizedCurrentChoice =
                      normalizeChoice(choice);

                  const isDuplicateChoice =
                      Boolean(normalizedCurrentChoice)
                      && form.choices.some(
                          (otherChoice, otherIndex) =>
                              otherIndex !== index
                              && normalizeChoice(otherChoice)
                              === normalizedCurrentChoice
                      );

                  const isChecked =
                      !isDuplicateChoice
                      && form.correctAnswers.includes(choice)
                      && Boolean(choice.trim());
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: isDuplicateChoice ? 'flex-start' : 'center',
                        gap: '0.65rem',
                        background: isChecked ? '#ecfdf5' : '#fff',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${
                          isDuplicateChoice
                            ? '#fecaca'
                            : isChecked
                              ? '#10b981'
                              : '#e2e8f0'
                        }`
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: choice.trim() && !isDuplicateChoice ? 'pointer' : 'not-allowed',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          background: isChecked ? '#10b981' : '#f1f5f9',
                          color: isChecked ? '#fff' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}
                        title={
                          isDuplicateChoice
                            ? 'Lựa chọn này đang bị trùng nội dung'
                            : choice.trim()
                              ? 'Chọn làm đáp án đúng'
                              : 'Hãy nhập nội dung trước'
                        }
                      >
                        <input
                            type={isSingleChoice ? 'radio' : 'checkbox'}
                            name={
                              isSingleChoice
                                  ? 'correctAnswer'
                                  : `correctAnswer-${index}`
                            }
                            checked={isChecked}
                            onChange={() => toggleCorrectAnswer(choice)}
                            disabled={!choice.trim() || isDuplicateChoice}
                        />
                        <span>{labelChar}</span>
                      </label>

                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}
                      >
                        <input
                          type="text"
                          className="form-input"
                          value={choice}
                          onChange={e => updateChoice(index, e.target.value)}
                          placeholder={`Choice ${labelChar}...`}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem',
                            border: isDuplicateChoice
                              ? '1px solid #dc2626'
                              : '1px solid #cbd5e1'
                          }}
                          required
                        />

                        {isDuplicateChoice && (
                          <span
                            style={{
                              color: '#dc2626',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            Lựa chọn này bị trùng nội dung
                          </span>
                        )}
                      </div>

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
