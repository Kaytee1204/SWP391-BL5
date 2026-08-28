import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { ARTICLE_COVER_PRESETS } from '../../../assets/constants';

/**
 * ============================================================================
 * MODAL COMPONENT: EditArticleModal
 * NGHIỆP VỤ: Tác giả chỉnh sửa bài viết văn hóa của chính mình
 * CHỨC NĂNG:
 *  1. Tải sẵn dữ liệu cũ (tiêu đề, ảnh bìa, trạng thái, nội dung).
 *  2. Chỉnh sửa tiêu đề, đổi ảnh bìa preset hoặc link ảnh tùy chỉnh.
 *  3. Chuyển đổi trạng thái từ Draft sang Published.
 *  4. Gửi PUT /api/v1/culture-articles/{articleId} lên Backend.
 *  5. Backend thực hiện kiểm tra quyền sở hữu (Ownership check) trước khi lưu.
 * ============================================================================
 */
export default function EditArticleModal({ article, onClose, onSaveSuccess }) {
  // --- FORM STATE KHỞI TẠO TỪ BÀI VIẾT HIỆN TẠI ---
  const [title, setTitle] = useState(article.title || '');
  const [content, setContent] = useState(article.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(article.coverImageUrl || ARTICLE_COVER_PRESETS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [status, setStatus] = useState(article.status || 'published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Xử lý lưu các chỉnh sửa của bài viết
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
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

      // Gửi request cập nhật bài viết lên Backend
      const res = await apiRequest(`/culture-articles/${article.articleId}`, 'PUT', body);
      alert('Cập nhật bài viết thành công!');
      onSaveSuccess(res.data); // Báo component cha cập nhật danh sách
      onClose();               // Đóng modal
    } catch (err) {
      setError(err.message || 'Không thể cập nhật bài viết.');
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
            ✏️ Edit Article #{article.articleId}
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
          {/* CHỈNH SỬA TIÊU ĐỀ */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Article Title *</span>
              <span style={{ color: title.length > 180 ? '#e11d48' : 'var(--text-muted)', fontWeight: 600 }}>
                {title.length}/200
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              maxLength={200}
              required
            />
          </div>

          {/* CHỈNH SỬA ẢNH BÌA */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Cover Image:</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>or enter custom URL (max 500 chars)</span>
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
              placeholder="Or paste custom image URL..."
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="form-input"
              maxLength={500}
              style={{ marginTop: '0.45rem' }}
            />
          </div>

          {/* CHỈNH SỬA TRẠNG THÁI */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Publication Status *</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* CHỈNH SỬA NỘI DUNG */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Article Content * (Min 10 - Max 50,000 chars)</span>
              <span style={{ color: content.trim().length > 0 && content.trim().length < 10 ? '#e11d48' : 'var(--text-muted)', fontWeight: 600 }}>
                {content.length}/50,000
              </span>
            </label>
            <textarea
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
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
