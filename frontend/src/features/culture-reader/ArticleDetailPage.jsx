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
        <h2>Article not found</h2>
        <button className="btn-primary-purple" style={{ marginTop: '1rem' }} onClick={() => onNavigate('culture_reader')}>
          ← Back to Articles
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
      {/* Top Navbar */}
      <Navbar
        currentView="culture_reader"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
        extraAction={
          <button className="btn-secondary-glass" onClick={() => onNavigate(returnTarget)}>
            ← Back to list
          </button>
        }
      />

      <main className="article-detail-container">
        <button className="article-back-btn" onClick={() => onNavigate(returnTarget)}>
          <span>←</span>
          <span>Back to Articles</span>
        </button>

        {article.coverImageUrl && (
          <div className="article-hero-cover-wrap">
            <img src={article.coverImageUrl} alt={article.title} className="article-hero-cover" />
          </div>
        )}

        <div className="article-header-block">
          <div className="culture-badge">
            <span>⛩️</span>
            <span>Japanese Culture & Lifestyle</span>
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
                  {article.authorEmail || 'JLMS Author'} • Role: Author
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div>
                📅 <strong>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US') : 'Recent')}</strong>
              </div>
              <span>•</span>
              <div>📖 4 min read</div>
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
                Author & Educator in Japanese Culture & Slang at JLMS.
              </p>
            </div>
          </div>

          <button className="btn-primary-purple" onClick={() => onNavigate('culture_reader')}>
            Explore More Articles →
          </button>
        </div>
      </main>
    </div>
  );
}
