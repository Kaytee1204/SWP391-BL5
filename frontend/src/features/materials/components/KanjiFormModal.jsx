import React, { useState, useEffect } from 'react';

export default function KanjiFormModal({
  isOpen,
  kanji,
  modules = [],
  defaultModuleId = '',
  onClose,
  onSave
}) {
  const [moduleId, setModuleId] = useState(defaultModuleId);
  const [character, setCharacter] = useState('');
  const [meaning, setMeaning] = useState('');
  const [onyomi, setOnyomi] = useState('');
  const [kunyomi, setKunyomi] = useState('');
  const [compoundWords, setCompoundWords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (kanji) {
      setModuleId(String(kanji.moduleId || ''));
      setCharacter(kanji.character || '');
      setMeaning(kanji.meaning || '');
      setOnyomi(kanji.onyomi || '');
      setKunyomi(kanji.kunyomi || '');
      setCompoundWords(kanji.compoundWords || '');
    } else {
      setModuleId(defaultModuleId || (modules[0]?.moduleId ? String(modules[0].moduleId) : ''));
      setCharacter('');
      setMeaning('');
      setOnyomi('');
      setKunyomi('');
      setCompoundWords('');
    }
    setError(null);
  }, [kanji, defaultModuleId, modules, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleId) {
      setError('Vui lòng chọn Module bài học cho chữ Kanji này.');
      return;
    }
    if (!character.trim()) {
      setError('Vui lòng nhập chữ Kanji.');
      return;
    }
    if (!meaning.trim()) {
      setError('Vui lòng nhập ý nghĩa của chữ Kanji.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        moduleId: Number(moduleId),
        character: character.trim(),
        meaning: meaning.trim(),
        onyomi: onyomi.trim() || null,
        kunyomi: kunyomi.trim() || null,
        compoundWords: compoundWords.trim() || null,
        version: kanji?.version ?? null
      });
      onClose();
    } catch (err) {
      setError(err.status === 409
        ? 'This content was updated by another lecturer. Please refresh the page before editing it again.'
        : (err.message || 'Lỗi khi lưu chữ Kanji.'));
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
          maxWidth: '640px',
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
              {kanji ? `✏️ Chỉnh Sửa Chữ Kanji [${kanji.character}]` : '✨ Thêm Chữ Kanji Mới'}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Nhập thông tin Hán tự, âm đọc On/Kun, nghĩa và từ ghép cho học viên
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
          
          {/* Module Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Thuộc Module Bài Học *
            </label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
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
              <option value="">-- Chọn Module bài học Kanji --</option>
              {modules.map((m) => (
                <option key={m.moduleId} value={m.moduleId}>
                  [{m.jlptLevel}] {m.title} ({m.kanjiCount || 0} chữ)
                </option>
              ))}
            </select>
          </div>

          {/* Character & Meaning Grid + Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.85rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Chữ Kanji *
              </label>
              <input
                type="text"
                placeholder="VD: 日"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                maxLength={10}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <span>Ý nghĩa Hán Việt / Tiếng Việt *</span>
                <span style={{ color: meaning.length > 250 ? '#e11d48' : '#94a3b8', fontSize: '0.75rem' }}>
                  {meaning.length}/300
                </span>
              </label>
              <input
                type="text"
                placeholder="VD: Nhật, Ngày, Mặt trời"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                maxLength={300}
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

          {/* On / Kun Readings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Âm On (Katakana)
              </label>
              <input
                type="text"
                placeholder="VD: ニチ, ジツ"
                value={onyomi}
                onChange={(e) => setOnyomi(e.target.value)}
                maxLength={200}
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
                Âm Kun (Hiragana)
              </label>
              <input
                type="text"
                placeholder="VD: ひ, -び, -か"
                value={kunyomi}
                onChange={(e) => setKunyomi(e.target.value)}
                maxLength={200}
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

          {/* Compound Words */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Từ ghép & Ví dụ thông dụng (Compounds)
            </label>
            <textarea
              placeholder="VD: 日本 (Nihon - Nhật Bản), 日曜日 (Nichiyoubi - Chủ nhật), 毎日 (Mainichi - Mỗi ngày)"
              rows={3}
              value={compoundWords}
              onChange={(e) => setCompoundWords(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
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
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                transition: 'opacity 0.2s ease'
              }}
            >
              {loading ? 'Đang lưu...' : (kanji ? 'Lưu Thay Đổi' : 'Tạo Chữ Kanji')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
