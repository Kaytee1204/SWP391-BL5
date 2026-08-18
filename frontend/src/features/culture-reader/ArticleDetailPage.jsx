import React, { useEffect } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';
import Navbar from '../../components/common/Navbar';

export default function ArticleDetailPage({
  article,
  previousView,
  currentUser,
  onNavigate,
  onViewProfile,
  onLogout
}) {
  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2>Không tìm thấy bài viết</h2>
        <button className="btn-primary-purple" style={{ marginTop: '1rem' }} onClick={() => onNavigate('culture_reader')}>
          ← Quay lại danh sách bài viết
        </button>
      </div>
    );
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  const returnTarget = previousView || 'culture_reader';

  return (
    <div className="article-detail-page">
      {/* Top Navbar Chuẩn Hóa */}
      <Navbar
        currentView="culture_reader"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
        extraAction={
          <button className="btn-secondary-glass" onClick={() => onNavigate(returnTarget)}>
            ← Quay lại danh sách
          </button>
        }
      />

      <main className="article-detail-container">
        <button className="article-back-btn" onClick={() => onNavigate(returnTarget)}>
          <span>←</span>
          <span>Quay lại danh sách bài viết</span>
        </button>

        {article.coverImageUrl && (
          <div className="article-hero-cover-wrap">
            <img src={article.coverImageUrl} alt={article.title} className="article-hero-cover" />
          </div>
        )}

        <div className="article-header-block">
          <div className="culture-badge">
            <span>⛩️</span>
            <span>Văn Hóa & Phong Cách Sống Nhật Bản</span>
          </div>

          <h1 className="article-main-title">
            {article.title}
          </h1>

          <div className="article-meta-card">
            <div className="article-author-info-large">
              <img
                src={article.authorAvatarUrl || AVATAR_PRESETS[0].url}
                alt={article.authorName}
                className="article-author-avatar-large"
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                  {article.authorName}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {article.authorEmail || 'Tác giả JLMS'} • Vai trò: Author
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div>
                📅 <strong>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : (article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng')}</strong>
              </div>
              <span>•</span>
              <div>📖 4 phút đọc</div>
              <span className={`status-badge ${article.status}`}>
                {article.status}
              </span>
            </div>
          </div>
        </div>

        {/* Formatted Article Body with Natural Scrolling */}
        <article className="article-body-content">
          {article.content ? article.content.split('\n\n').map((para, idx) => (
            <p key={idx} className="article-paragraph">
              {para}
            </p>
          )) : null}
        </article>

        {/* Bottom Footer Card */}
        <div className="article-footer-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={article.authorAvatarUrl || AVATAR_PRESETS[0].url}
              alt="author"
              style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid var(--primary-orange-border)', background: '#fff7ed' }}
            />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{article.authorName}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                Tác giả chuyên mục Văn hóa & Tiếng lóng Nhật Bản tại JLMS.
              </p>
            </div>
          </div>

          <button className="btn-primary-purple" onClick={() => onNavigate('culture_reader')}>
            Khám phá thêm các bài viết khác →
          </button>
        </div>
      </main>
    </div>
  );
}
