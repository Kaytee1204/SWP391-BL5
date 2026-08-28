import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { questionSetApi } from '../../../api/questionSetApi';
import { QUESTION_SET_LEVELS, QUESTION_SET_SKILLS } from '../questionSetConstants';

const EMPTY_FORM = {
  title: '',
  description: '',
  skillType: 'vocabulary',
  jlptLevel: 'N5',
  durationMinutes: 60
};

export default function QuestionSetFormModal({ questionSet, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(questionSet?.questionSetId);
  const classificationLocked = isEditing && questionSet.questionCount > 0;

  useEffect(() => {
    if (!questionSet) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      title: questionSet.title || '',
      description: questionSet.description || '',
      skillType: questionSet.skillType || 'vocabulary',
      jlptLevel: questionSet.jlptLevel || 'N5',
      durationMinutes: questionSet.durationMinutes || 60
    });
  }, [questionSet]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Tên bộ câu hỏi không được để trống.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        skillType: form.skillType,
        jlptLevel: form.jlptLevel,
        durationMinutes: Number(form.durationMinutes)
      };

      const response = isEditing
        ? await questionSetApi.update(questionSet.questionSetId, payload)
        : await questionSetApi.create(payload);

      onSaved(response.data);
    } catch (err) {
      setError(err.message || 'Không thể lưu bộ câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qs-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="qs-modal qs-form-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="qs-modal-header">
          <div>
            <span className="qs-eyebrow">Question set</span>
            <h3>{isEditing ? 'Chỉnh sửa bộ câu hỏi' : 'Tạo bộ câu hỏi mới'}</h3>
          </div>
          <button type="button" className="qs-icon-button" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="qs-modal-body">
            {error && <div className="qs-alert qs-alert-error">{error}</div>}

            <label className="qs-field">
              <span>Tên bộ câu hỏi <b>*</b></span>
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                maxLength={200}
                placeholder="Ví dụ: Tổng hợp từ vựng N5 - Bài 1"
                autoFocus
              />
            </label>

            <label className="qs-field">
              <span>Mô tả</span>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                maxLength={1000}
                rows={4}
                placeholder="Mục tiêu và phạm vi của bộ câu hỏi..."
              />
              <small>{form.description.length}/1000 ký tự</small>
            </label>

            <div className="qs-form-grid">
              <label className="qs-field">
                <span>Kỹ năng <b>*</b></span>
                <select name="skillType" value={form.skillType} onChange={updateField} disabled={classificationLocked}>
                  {QUESTION_SET_SKILLS.filter((skill) => skill.value)
                    .filter((skill) => !classificationLocked || skill.value === form.skillType || skill.value === 'mixed')
                    .map((skill) => (
                    <option key={skill.value} value={skill.value}>{skill.icon} {skill.label}</option>
                  ))}
                </select>
              </label>

              <label className="qs-field">
                <span>JLPT level <b>*</b></span>
                <select name="jlptLevel" value={form.jlptLevel} onChange={updateField}>
                  {QUESTION_SET_LEVELS.filter(Boolean).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="qs-field">
              <span>Thời lượng làm bài (phút) <b>*</b></span>
              <input type="number" name="durationMinutes" min="1" max="300"
                value={form.durationMinutes} onChange={updateField} />
            </label>

            {classificationLocked && (
              <p className="qs-help-text">
                Level đã được khóa vì bộ đề có câu hỏi. Bạn vẫn có thể chuyển bộ đề sang Full JLPT để thêm câu hỏi từ mọi kỹ năng.
              </p>
            )}
          </div>

          <footer className="qs-modal-footer">
            <button type="button" className="qs-button qs-button-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="qs-button qs-button-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bộ câu hỏi'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
