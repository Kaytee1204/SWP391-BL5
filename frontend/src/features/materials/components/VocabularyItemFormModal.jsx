import React, { useState, useEffect } from 'react';

/**
 * Form nhập một mục từ vựng. Component chỉ quản lý state/validate phía giao diện rồi gọi onSave;
 * view cha mới quyết định create hay update. Khi sửa, version của item được gửi nguyên về backend
 * để thực hiện optimistic locking; khi tạo, version là null.
 */
export default function VocabularyItemFormModal({
  isOpen,
  item,
  categories = [],
  defaultCategoryId = '',
  onClose,
  onSave
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [word, setWord] = useState('');
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mỗi lần mở/đổi item, reset form từ props để dữ liệu lần mở trước không bị giữ lại.
    if (item) {
      setCategoryId(String(item.categoryId || ''));
      setWord(item.word || '');
      setKanji(item.kanji || '');
      setReading(item.reading || '');
      setMeaning(item.meaning || '');
      setExampleSentence(item.exampleSentence || '');
      setExampleTranslation(item.exampleTranslation || '');
    } else {
      setCategoryId(defaultCategoryId || (categories[0]?.categoryId ? String(categories[0].categoryId) : ''));
      setWord('');
      setKanji('');
      setReading('');
      setMeaning('');
      setExampleSentence('');
      setExampleTranslation('');
    }
    setError(null);
  }, [item, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    // Validate nhanh cho UX; Bean Validation ở backend vẫn là lớp kiểm tra bắt buộc.
    e.preventDefault();
    if (!categoryId) {
      setError('Vui lòng chọn Danh mục bài học cho từ vựng này.');
      return;
    }
    if (!word.trim()) {
      setError('Vui lòng nhập từ vựng (Hiragana/Katakana).');
      return;
    }
    if (!reading.trim()) {
      setError('Vui lòng nhập cách đọc (Romaji / Reading).');
      return;
    }
    if (!meaning.trim()) {
      setError('Vui lòng nhập ý nghĩa tiếng Việt của từ vựng.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        categoryId: Number(categoryId),
        word: word.trim(),
        kanji: kanji.trim() || null,
        reading: reading.trim(),
        meaning: meaning.trim(),
        exampleSentence: exampleSentence.trim() || null,
        exampleTranslation: exampleTranslation.trim() || null,
        version: item?.version ?? null
      });
      onClose();
    } catch (err) {
      setError(err.status === 409
        ? 'This content was updated by another lecturer. Please refresh the page before editing it again.'
        : (err.message || 'Lỗi khi lưu từ vựng.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        backdropFilter: 'blur(4px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {item ? `✏️ Chỉnh Sửa Từ Vựng [${item.word}]` : '✨ Thêm Từ Vựng Mới'}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Nhập từ vựng tiếng Nhật, Kanji, cách đọc, ý nghĩa và câu ví dụ
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.35rem',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '2px 6px',
              borderRadius: '6px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Category Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Thuộc Danh Mục Từ Vựng *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
              required
            >
              <option value="">-- Chọn danh mục từ vựng --</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  [{c.jlptLevel}] {c.name} ({c.itemCount || (c.items ? c.items.length : 0)} từ)
                </option>
              ))}
            </select>
          </div>

          {/* Word & Kanji Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Từ (Hiragana / Katakana) *
              </label>
              <input
                type="text"
                placeholder="VD: たべる, こんにちは"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                maxLength={100}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Chữ Hán Tự / Kanji (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: 食べる"
                value={kanji}
                onChange={(e) => setKanji(e.target.value)}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Reading & Meaning Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Cách đọc (Romaji / Reading) *
              </label>
              <input
                type="text"
                placeholder="VD: taberu"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                maxLength={100}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Ý nghĩa tiếng Việt *
              </label>
              <input
                type="text"
                placeholder="VD: Ăn, Dùng bữa"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                maxLength={250}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Example Sentence */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Câu ví dụ tiếng Nhật (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: 毎朝パンを食べます。"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Example Translation */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Dịch nghĩa câu ví dụ (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Mỗi sáng tôi đều ăn bánh mì."
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                transition: 'opacity 0.2s ease'
              }}
            >
              {loading ? 'Đang lưu...' : (item ? 'Lưu Thay Đổi' : 'Thêm Từ Vựng')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
