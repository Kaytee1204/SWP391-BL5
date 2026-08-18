import React, { useState } from 'react';
import { apiRequest } from '../../../api/apiRequest';
import { ARTICLE_COVER_PRESETS } from '../../../assets/constants';

export default function CreateArticleModal({ onClose, onCreateSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(ARTICLE_COVER_PRESETS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const res = await apiRequest('/culture-articles', 'POST', body);
      alert('Đăng bài viết văn hóa thành công!');
      onCreateSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            🌸 Đăng Bài Viết Văn Hóa & Tiếng Lóng Mới
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Tiêu đề bài viết *</label>
            <input
              type="text"
              placeholder="Ví dụ: Bí quyết ứng xử & viết email chuẩn doanh nghiệp Nhật Bản"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Chọn ảnh bìa bài viết:</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>hoặc nhập URL ảnh bên dưới</span>
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
              placeholder="Hoặc dán URL ảnh tùy chỉnh (https://...)"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="form-input"
              style={{ marginTop: '0.45rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Trạng thái xuất bản *</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
              <option value="published">Published (Công khai cho toàn bộ học viên & độc giả)</option>
              <option value="draft">Draft (Bản nháp - chỉ tác giả và quản trị viên xem)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Nội dung bài viết *</label>
            <textarea
              placeholder="Viết nội dung kiến thức văn hóa, từ lóng giới trẻ, kinh nghiệm thực tế tại Nhật Bản..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '180px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" disabled={loading} className="btn-dash btn-dash-primary">
              {loading ? 'Đang xuất bản...' : '✨ Xuất Bản Bài Viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
