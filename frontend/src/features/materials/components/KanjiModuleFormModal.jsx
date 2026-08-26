import React, { useState, useEffect } from 'react';
import { JLPT_LEVELS } from '../../../assets/constants';

/**
 * Form tạo/sửa module Kanji. Props module có giá trị là chế độ sửa; null là chế độ tạo.
 * version chỉ có ý nghĩa khi sửa và được backend so với @Version hiện tại trước khi lưu.
 */
export default function KanjiModuleFormModal({
  isOpen,
  module,
  defaultLevel = 'N5',
  onClose,
  onSave
}) {
  const [title, setTitle] = useState('');
  const [jlptLevel, setJlptLevel] = useState(defaultLevel);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Đồng bộ local state mỗi lần chọn module khác hoặc mở lại modal.
    if (module) {
      setTitle(module.title || '');
      setJlptLevel(module.jlptLevel || 'N5');
      setDescription(module.description || '');
    } else {
      setTitle('');
      setJlptLevel(defaultLevel === 'ALL' ? 'N5' : defaultLevel);
      setDescription('');
    }
    setError(null);
  }, [module, defaultLevel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    // Modal chuẩn hóa chuỗi; service backend tiếp tục validate và xác định người cập nhật từ JWT.
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề module bài học Kanji.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        jlptLevel,
        description: description.trim() || null,
        version: module?.version ?? null
      });
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setError('This content was updated by another lecturer. Please refresh the page before editing it again.');
      } else {
      setError(err.message || 'Lỗi khi lưu module Kanji.');
      }
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
          maxWidth: '560px',
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
              {module ? '✏️ Chỉnh Sửa Module Kanji' : '✨ Thêm Module Kanji Mới'}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Thiết lập bài học Kanji theo cấp độ JLPT cho học viên
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
          
          {/* Level + Title Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Cấp độ JLPT *
              </label>
              <select
                value={jlptLevel}
                onChange={(e) => setJlptLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
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
                {JLPT_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <span>Tên Module Bài Học *</span>
                <span style={{ color: title.length > 130 ? '#e11d48' : '#94a3b8', fontSize: '0.75rem' }}>
                  {title.length}/150
                </span>
              </label>
              <input
                type="text"
                placeholder="VD: Bài 1: Chữ Hán cơ bản về Tự nhiên & Số đếm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
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

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Mô tả nội dung bài học (Tùy chọn)
            </label>
            <textarea
              placeholder="VD: Tổng hợp các chữ Kanji căn bản giúp bạn nhận diện các hiện tượng tự nhiên và số đếm..."
              rows={3}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                transition: 'opacity 0.2s ease'
              }}
            >
              {loading ? 'Đang lưu...' : (module ? 'Lưu Thay Đổi' : 'Tạo Module Mới')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
