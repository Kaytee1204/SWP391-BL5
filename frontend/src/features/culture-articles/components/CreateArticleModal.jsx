import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { ARTICLE_COVER_PRESETS } from '../../../assets/constants';

/**
 * ============================================================================
 * MODAL COMPONENT: CreateArticleModal
 * NGHIỆP VỤ: Tác giả (Author) soạn thảo và xuất bản bài viết văn hóa mới
 * CÁC BƯỚC THỰC HIỆN:
 *  1. Nhập tiêu đề bài viết (tối đa 200 ký tự).
 *  2. Chọn ảnh bìa Preset Nhật Bản hoặc nhập link ảnh tùy chỉnh (URL).
 *  3. Chọn trạng thái xuất bản: 'published' (Công khai) hoặc 'draft' (Lưu nháp).
 *  4. Soạn nội dung bài viết chi tiết.
 *  5. Gửi POST /api/v1/culture-articles lên Backend.
 * ============================================================================
 */
export default function CreateArticleModal({ onClose, onCreateSuccess }) {
  // --- FORM STATE ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(ARTICLE_COVER_PRESETS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Xử lý đăng tải bài viết mới
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Ưu tiên sử dụng URL tự nhập nếu có, ngược lại dùng ảnh preset đã chọn
      const finalCover = customUrl.trim() ? customUrl.trim() : coverImageUrl;
      const body = {
        title: title.trim(),
        content: content.trim(),
        coverImageUrl: finalCover,
        status: status ? status.toLowerCase() : 'published'
      };

      if (content.trim().length < 10) {
        setError('Nội dung bài viết quá ngắn. Vui lòng nhập tối thiểu 10 ký tự!');
        setLoading(false);
        return;
      }

      // Gọi API tạo bài viết mới
      const res = await apiRequest('/culture-articles', 'POST', body);
      alert('Đăng bài viết văn hóa thành công!');
      onCreateSuccess(res.data); // Báo cho component cha tải lại danh sách
      onClose();                 // Đóng modal
    } catch (err) {
      setError(err.message || 'Không thể xuất bản bài viết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={e => e.stopPropagation()}>
        {/* TIÊU ĐỀ MODAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            🌸 Publish New Cultural & Slang Article
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* THÔNG BÁO LỖI (NẾU CÓ) */}
        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          {/* NHẬP TIÊU ĐỀ BÀI VIẾT */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Article Title *</span>
              <span style={{ color: title.length > 180 ? '#e11d48' : 'var(--text-muted)', fontWeight: 600 }}>
                {title.length}/200
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Essential Japanese Business Etiquette & Email Guidelines"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              maxLength={200}
              required
            />
          </div>

          {/* CHỌN ẢNH BÌA PRESET HOẶC NHẬP URL */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Choose Cover Image:</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>or enter a custom URL (max 500 chars)</span>
            </label>
            <div className="cover-preset-grid">
              {ARTICLE_COVER_PRESETS.map(p => (
                <div
                  key={p.id}
                  className={`cover-preset-item ${coverImageUrl === p.url && !customUrl ? 'selected' : ''}`}
                  onClick={() => { setCoverImageUrl(p.url); setCustomUrl(''); }}
                >
                  <img src={p.url} alt={p.label} />
                  <div className="cover-preset-label">{p.label}</div>
                </div>
              ))}
            </div>

            <input
              type="url"
              placeholder="Or paste custom image URL (https://...)"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="form-input"
              maxLength={500}
              style={{ marginTop: '0.45rem' }}
            />
          </div>

          {/* CHỌN TRẠNG THÁI XUẤT BẢN */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Publication Status *</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
              <option value="published">Published (Public to all learners & readers)</option>
              <option value="draft">Draft (Private - visible only to author and managers)</option>
            </select>
          </div>

          {/* SOẠN NỘI DUNG BÀI VIẾT */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Article Content * (Min 10 - Max 50,000 chars)</span>
              <span style={{ color: content.trim().length > 0 && content.trim().length < 10 ? '#e11d48' : 'var(--text-muted)', fontWeight: 600 }}>
                {content.length}/50,000
              </span>
            </label>
            <textarea
              placeholder="Write cultural insights, youth slangs, everyday Japanese etiquette, or life tips (tối thiểu 10 ký tự)..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="form-textarea"
              style={{
                minHeight: '180px',
                borderColor: content.trim().length > 0 && content.trim().length < 10 ? '#f43f5e' : undefined
              }}
              required
            />
          </div>

          {/* HÀNH ĐỘNG */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Publishing...' : '✨ Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
