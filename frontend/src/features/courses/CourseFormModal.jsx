import React, { useState } from 'react';
import { JLPT_LEVELS } from '../../assets/constants';

export default function CourseFormModal({ course, onClose, onSave }) {
  const [title, setTitle] = useState(course?.title || '');
  const [jlptLevel, setJlptLevel] = useState(course?.jlptLevel || 'N5');
  const [price, setPrice] = useState(course?.price !== undefined ? course.price : 0);
  const [description, setDescription] = useState(course?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPriceWarningModal, setShowPriceWarningModal] = useState(false);

  const MAX_PRICE = 20000000;

  // Chặn hoàn toàn phím dấu chấm '.', phẩy ',', dấu trừ '-', dấu cộng '+', ký tự số mũ 'e', 'E'
  const handlePriceKeyDown = (e) => {
    if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePriceChange = (e) => {
    const rawVal = e.target.value;
    // Tự động lọc bỏ toàn bộ ký tự không phải số nguyên (kể cả dấu chấm '.', phẩy ',')
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (cleanDigits === '') {
      setPrice('');
      return;
    }

    const val = parseInt(cleanDigits, 10);
    if (isNaN(val)) {
      setPrice(0);
      return;
    }

    if (val > MAX_PRICE) {
      setPrice(val);
      setError('⚠️ Giá khóa học không được vượt quá 20.000.000 VNĐ!');
      setShowPriceWarningModal(true);
    } else if (val < 0) {
      setPrice(0);
      setError('⚠️ Giá khóa học không được nhỏ hơn 0 VNĐ!');
    } else {
      setPrice(val);
      if (error && error.includes('20.000.000')) {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên khóa học');
      return;
    }

    const numericPrice = price === '' ? 0 : Number(price);

    if (numericPrice < 0) {
      const msg = '⚠️ Giá khóa học không được nhỏ hơn 0 VNĐ';
      setError(msg);
      alert(msg);
      return;
    }
    if (numericPrice > MAX_PRICE) {
      const msg = '⚠️ Giá khóa học không được vượt quá 20.000.000 VNĐ (Tối đa 20 triệu đồng)!';
      setError(msg);
      setShowPriceWarningModal(true);
      alert(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        jlptLevel,
        price: numericPrice,
        description: description.trim()
      });
      onClose();
    } catch (err) {
      const errMsg = err.message || 'Không thể lưu khóa học.';
      setError(errMsg);
      alert(`⚠️ Lỗi: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const numericPrice = price === '' ? 0 : Number(price);
  const isPriceExceeded = numericPrice > MAX_PRICE;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      {/* POPUP CẢNH BÁO NỔI BẬT RA NGOÀI KHI GIÁ VƯỢT QUÁ 20 TRIỆU */}
      {showPriceWarningModal && (
        <div 
          className="modal-overlay" 
          onClick={(e) => { e.stopPropagation(); setShowPriceWarningModal(false); }}
          style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '440px', 
              textAlign: 'center', 
              padding: '2rem 1.5rem', 
              borderRadius: '20px', 
              border: '2px solid #ef4444',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.25)',
              animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🚨</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.6rem' }}>
              Vượt Quá Giới Hạn Giá!
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Mức giá tối đa cho phép của một khóa học là <strong>20.000.000 VNĐ</strong> (20 triệu đồng).
              <br />
              Giá bạn vừa nhập là: <strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>{formatVND(numericPrice)}</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-dash btn-dash-primary"
                style={{ background: '#ef4444', borderColor: '#dc2626', padding: '0.6rem 1.5rem', fontWeight: 700 }}
                onClick={() => {
                  setPrice(MAX_PRICE);
                  setShowPriceWarningModal(false);
                  setError(null);
                }}
              >
                Đặt về tối đa (20.000.000 đ)
              </button>
              <button
                type="button"
                className="btn-dash btn-dash-secondary"
                style={{ padding: '0.6rem 1.25rem' }}
                onClick={() => setShowPriceWarningModal(false)}
              >
                Tôi Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM CHÍNH */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {course ? '✏️ Chỉnh Sửa Khóa Học' : '✨ Thêm Khóa Học Mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ 
            padding: '0.85rem 1rem', 
            background: '#fff1f2', 
            color: '#e11d48', 
            borderRadius: '12px', 
            fontSize: '0.88rem', 
            marginBottom: '1rem', 
            border: '1.5px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>{error}</span>
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
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span>Giá khóa học (VNĐ) *</span>
                <span style={{ fontSize: '0.75rem', color: isPriceExceeded ? '#dc2626' : '#64748b' }}>
                  (Tối đa 20.000.000 đ)
                </span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="VD: 20000, 2000000 (0 = Miễn phí)"
                value={price}
                onKeyDown={handlePriceKeyDown}
                onChange={handlePriceChange}
                className="form-input"
                style={{
                  borderColor: isPriceExceeded ? '#ef4444' : undefined,
                  boxShadow: isPriceExceeded ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : undefined,
                  color: isPriceExceeded ? '#dc2626' : undefined,
                  fontWeight: isPriceExceeded ? 800 : undefined
                }}
                required
              />
              
              {/* Thông báo preview giá hoặc cảnh báo vượt mức */}
              {isPriceExceeded ? (
                <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 800, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>❌ Vượt mức tối đa 20 triệu:</span>
                  <span>{formatVND(numericPrice)}</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: numericPrice === 0 ? '#10b981' : '#7c3aed', fontWeight: 700, marginTop: '0.25rem' }}>
                  {numericPrice === 0 ? '🎁 Khóa học Miễn phí (0 VNĐ)' : `💵 Xem trước giá: ${formatVND(numericPrice)}`}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                * Chỉ nhập số nguyên liền nhau (VD: <code>20000</code>, <code>2000000</code>). Không nhập dấu chấm <code>.</code>
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
            <button 
              type="submit" 
              disabled={loading || isPriceExceeded} 
              className="btn-dash btn-dash-primary"
              style={{
                opacity: isPriceExceeded ? 0.6 : 1,
                cursor: isPriceExceeded ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang lưu...' : (course ? '💾 Lưu Thay Đổi' : '✨ Tạo Khóa Học')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
