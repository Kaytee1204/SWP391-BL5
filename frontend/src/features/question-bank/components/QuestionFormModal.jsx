import React, { useMemo, useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { JLPT_LEVELS } from '../../../assets/constants';

const SKILL_OPTIONS = [
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'listening', label: 'Nghe hiểu' },
  { value: 'reading', label: 'Đọc hiểu' }
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
      ? (question.choices?.length ? [...question.choices] : ['', ''])
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
      choices: prev.choices.length >= 2 ? prev.choices : ['', ''],
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

    if (isMultipleChoice && choices.length < 2) {
      setError('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn.');
      return;
    }
    if (correctAnswers.length === 0) {
      setError('Vui lòng nhập hoặc chọn ít nhất một đáp án đúng.');
      return;
    }
    if (isMultipleChoice && !correctAnswers.every(answer => choices.includes(answer))) {
      setError('Mọi đáp án đúng phải nằm trong danh sách lựa chọn.');
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
      setError(err.message || 'Không thể lưu câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={event => event.stopPropagation()}>
        <div className="question-modal-header">
          <div>
            <div className="question-modal-eyebrow">QUESTION BANK</div>
            <h3>{question ? `Chỉnh sửa câu hỏi #${question.questionId}` : 'Tạo câu hỏi mới'}</h3>
          </div>
          <button type="button" className="question-close-btn" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        {error && <div className="question-alert">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="question-form">
          <div className="question-form-grid question-form-grid-3">
            <label>
              <span>Kỹ năng</span>
              <select className="form-select" value={form.skillType} onChange={e => setForm({ ...form, skillType: e.target.value })}>
                {SKILL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Trình độ JLPT</span>
              <select className="form-select" value={form.jlptLevel} onChange={e => setForm({ ...form, jlptLevel: e.target.value })}>
                {JLPT_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </label>
            <label>
              <span>Loại câu hỏi</span>
              <select className="form-select" value={form.questionType} onChange={e => handleTypeChange(e.target.value)}>
                <option value="multiple_choice">Trắc nghiệm</option>
                <option value="fill_blank">Điền vào chỗ trống</option>
              </select>
            </label>
          </div>

          <label>
            <span>Nội dung câu hỏi</span>
            <textarea
              className="form-textarea question-textarea"
              value={form.questionText}
              onChange={e => setForm({ ...form, questionText: e.target.value })}
              placeholder="Nhập nội dung câu hỏi tiếng Nhật..."
              required
            />
          </label>

          {isMultipleChoice ? (
            <fieldset className="question-choices-fieldset">
              <div className="question-section-heading">
                <div>
                  <strong>Các lựa chọn</strong>
                  <small>Đánh dấu một hoặc nhiều đáp án đúng.</small>
                </div>
                <button
                  type="button"
                  className="btn-dash btn-dash-secondary"
                  onClick={() => setForm(prev => ({ ...prev, choices: [...prev.choices, ''] }))}
                >
                  ＋ Thêm lựa chọn
                </button>
              </div>
              <div className="question-choice-list">
                {form.choices.map((choice, index) => {
                  const checked = form.correctAnswers.includes(choice) && Boolean(choice.trim());
                  return (
                    <div className={`question-choice-row ${checked ? 'is-correct' : ''}`} key={index}>
                      <label className="question-correct-toggle" title="Đánh dấu đáp án đúng">
                        <input type="checkbox" checked={checked} onChange={() => toggleCorrectAnswer(choice)} disabled={!choice.trim()} />
                        <span>{String.fromCharCode(65 + index)}</span>
                      </label>
                      <input
                        className="form-input"
                        value={choice}
                        onChange={e => updateChoice(index, e.target.value)}
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <button
                        type="button"
                        className="question-remove-choice"
                        onClick={() => removeChoice(index)}
                        disabled={form.choices.length <= 2}
                        aria-label="Xóa lựa chọn"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <label>
              <span>Đáp án chấp nhận</span>
              <textarea
                className="form-textarea question-answer-textarea"
                value={blankAnswers}
                onChange={e => setBlankAnswers(e.target.value)}
                placeholder={'Nhập mỗi đáp án trên một dòng\nVí dụ: 日本語'}
                required
              />
              <small className="question-field-hint">Mỗi dòng là một cách trả lời được chấp nhận.</small>
            </label>
          )}

          <label>
            <span>Giải thích</span>
            <textarea
              className="form-textarea"
              value={form.explanation}
              onChange={e => setForm({ ...form, explanation: e.target.value })}
              placeholder="Giải thích đáp án, quy tắc hoặc lưu ý cho người học..."
              maxLength={5000}
            />
          </label>

          <div className="question-modal-actions">
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-dash btn-dash-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : question ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
