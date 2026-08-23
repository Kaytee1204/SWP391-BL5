import React, { useState } from 'react';
import { JLPT_LEVELS } from '../../assets/constants';

export default function CourseFormModal({ course, onClose, onSave }) {
  const [title, setTitle] = useState(course?.title || '');
  const [jlptLevel, setJlptLevel] = useState(course?.jlptLevel || 'N5');
  const [price, setPrice] = useState(course?.price !== undefined ? course.price : 0);
  const [description, setDescription] = useState(course?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên khóa học');
      return;
    }
    if (price < 0) {
      setError('Giá khóa học không được nhỏ hơn 0 VNĐ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        jlptLevel,
        price: Number(price),
        description: description.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể lưu khóa học.');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {course ? '✏️ Chỉnh Sửa Khóa Học' : '✨ Thêm Khóa Học Mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tên khóa học */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span>Tên khóa học * (Không được trùng)</span>
              <span style={{ color: title.length > 180 ? '#e11d48' : 'var(--text-muted)' }}>{title.length}/200</span>
            </label>
            <input
              type="text"
              placeholder="VD: Khóa Học Tiếng Nhật N5 Toàn Diện Cho Người Mới Bắt Đầu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              maxLength={200}
              required
            />
          </div>

          {/* Cấp độ JLPT & Giá khóa học */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Cấp độ JLPT *
              </label>
              <select
                value={jlptLevel}
                onChange={(e) => setJlptLevel(e.target.value)}
                className="form-select"
                required
              >
                {JLPT_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Giá khóa học (VNĐ) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="0 = Miễn phí"
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="form-input"
                required
              />
              <div style={{ fontSize: '0.78rem', color: price === 0 ? '#10b981' : '#7c3aed', fontWeight: 700, marginTop: '0.25rem' }}>
                {price === 0 ? '🎁 Khóa học Miễn phí (0 VNĐ)' : `💵 Xem trước giá: ${formatVND(price)}`}
              </div>
            </div>
          </div>

          {/* Mô tả khóa học */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Mô tả nội dung & Lộ trình học
            </label>
            <textarea
              placeholder="Giới thiệu mục tiêu khóa học, các kỹ năng từ vựng, ngữ pháp, kanji và bài kiểm tra thực hành..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '120px' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Đang lưu...' : (course ? '💾 Lưu Thay Đổi' : '✨ Tạo Khóa Học')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
