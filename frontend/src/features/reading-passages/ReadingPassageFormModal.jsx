import React, { useEffect, useRef, useState } from 'react';
import { Bold, Eye, Italic, Languages, Plus, Text, X } from 'lucide-react';
import { JLPT_LEVELS } from '../../assets/constants';
import { readingPassageApi } from '../../api/readingPassageApi';
import './readingPassage.css';

const EMPTY_FORM = {
  jlptLevel: 'N5',
  title: '',
  contentHtml: '<p></p>',
  translation: '',
  isPreview: false
};

const wrapSelection = (value, start, end, before, after = '') => {
  const selected = value.slice(start, end);
  return {
    value: `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`,
    start: start + before.length,
    end: start + before.length + selected.length
  };
};

export default function ReadingPassageFormModal({ passage, onClose, onSaved }) {
  const isEditing = Boolean(passage?.passageId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    if (passage) {
      setForm({
        jlptLevel: passage.jlptLevel || 'N5',
        title: passage.title || '',
        contentHtml: passage.contentHtml || '<p></p>',
        translation: passage.translation || '',
        isPreview: Boolean(passage.isPreview)
      });
    }
  }, [passage]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const applyMarkup = (before, after = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    const result = wrapSelection(
      form.contentHtml,
      editor.selectionStart,
      editor.selectionEnd,
      before,
      after
    );

    updateField('contentHtml', result.value);
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(result.start, result.end);
    });
  };

  const addFurigana = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selected = form.contentHtml.slice(editor.selectionStart, editor.selectionEnd);
    if (!selected) {
      setError('Hãy bôi đen phần Kanji cần thêm Furigana trong ô nội dung.');
      editor.focus();
      return;
    }

    const reading = window.prompt(`Nhập cách đọc Furigana cho “${selected}”:`);
    if (!reading?.trim()) return;

    const replacement = `<ruby>${selected}<rt>${reading.trim()}</rt></ruby>`;
    const nextValue = `${form.contentHtml.slice(0, editor.selectionStart)}${replacement}${form.contentHtml.slice(editor.selectionEnd)}`;
    updateField('contentHtml', nextValue);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Tiêu đề không được để trống.');
      return;
    }

    if (!form.contentHtml.trim()) {
      setError('Nội dung bài đọc không được để trống.');
      return;
    }

    const payload = {
      jlptLevel: form.jlptLevel,
      title: form.title.trim(),
      contentHtml: form.contentHtml.trim(),
      translation: form.translation.trim(),
      isPreview: form.isPreview
    };

    setSaving(true);
    try {
      const response = isEditing
        ? await readingPassageApi.update(passage.passageId, payload)
        : await readingPassageApi.create(payload);

      onSaved(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu bài đọc.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rp-modal-backdrop" onMouseDown={onClose}>
      <section className="rp-editor-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="rp-modal-header">
          <div>
            <span className="rp-eyebrow">READING PASSAGE</span>
            <h3>{isEditing ? 'Chỉnh sửa bài đọc' : 'Tạo bài đọc mới'}</h3>
            <p>Soạn nội dung tiếng Nhật, Furigana và bản dịch trong cùng một nơi.</p>
          </div>
          <button type="button" className="rp-icon-button" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="rp-modal-body">
            {error && <div className="rp-alert rp-alert-error">{error}</div>}

            <div className="rp-form-grid">
              <label className="rp-field rp-level-field">
                <span>JLPT level *</span>
                <select
                  className="form-select"
                  value={form.jlptLevel}
                  onChange={(event) => updateField('jlptLevel', event.target.value)}
                >
                  {JLPT_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </label>

              <label className="rp-field">
                <span>Tiêu đề *</span>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Ví dụ: 私の学校"
                  maxLength={200}
                />
              </label>
            </div>

            <div className="rp-compose-grid">
              <div className="rp-editor-column">
                <div className="rp-field-heading">
                  <div>
                    <strong>Nội dung có Furigana *</strong>
                    <small>Bôi đen Kanji rồi chọn “Furigana”.</small>
                  </div>
                  <button
                    type="button"
                    className={`rp-preview-toggle ${showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview((value) => !value)}
                  >
                    <Eye size={16} /> Xem trước
                  </button>
                </div>

                <div className="rp-editor-shell">
                  <div className="rp-toolbar">
                    <button type="button" onClick={() => applyMarkup('<strong>', '</strong>')} title="In đậm">
                      <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => applyMarkup('<em>', '</em>')} title="In nghiêng">
                      <Italic size={16} />
                    </button>
                    <button type="button" onClick={() => applyMarkup('<p>', '</p>')} title="Đoạn văn">
                      <Text size={16} />
                    </button>
                    <button type="button" className="rp-furigana-button" onClick={addFurigana}>
                      <Languages size={16} /> Furigana
                    </button>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={form.contentHtml}
                    onChange={(event) => updateField('contentHtml', event.target.value)}
                    className="rp-html-editor"
                    spellCheck={false}
                    placeholder="<p>私は学校へ行きます。</p>"
                  />
                </div>

                <p className="rp-editor-hint">
                  Ví dụ: <code>&lt;ruby&gt;学校&lt;rt&gt;がっこう&lt;/rt&gt;&lt;/ruby&gt;</code>
                </p>
              </div>

              {showPreview && (
                <div className="rp-live-preview">
                  <div className="rp-preview-label">Bản xem trước</div>
                  <iframe
                    title="Xem trước bài đọc"
                    sandbox=""
                    srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:'Noto Sans JP',sans-serif;padding:18px;color:#172033;line-height:2;font-size:17px}ruby rt{font-size:10px;color:#e11d48}p{margin:0 0 14px}h1,h2,h3{line-height:1.4}</style></head><body>${form.contentHtml}</body></html>`}
                  />
                </div>
              )}
            </div>

            <label className="rp-field">
              <span>Bản dịch</span>
              <textarea
                className="form-textarea rp-translation-input"
                value={form.translation}
                onChange={(event) => updateField('translation', event.target.value)}
                placeholder="Nhập bản dịch tiếng Việt (không bắt buộc)..."
              />
            </label>

            <label className="rp-preview-check">
              <input
                type="checkbox"
                checked={form.isPreview}
                onChange={(event) => updateField('isPreview', event.target.checked)}
              />
              <span>
                <strong>Cho phép xem thử</strong>
                <small>Đánh dấu bài đọc này là nội dung preview.</small>
              </span>
            </label>
          </div>

          <footer className="rp-modal-footer">
            <button type="button" className="rp-button rp-button-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="rp-button rp-button-primary" disabled={saving}>
              <Plus size={17} />
              {saving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài đọc'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
