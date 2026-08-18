import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { ARTICLE_COVER_PRESETS, AVATAR_PRESETS } from '../../assets/constants';
import Navbar from '../../components/common/Navbar';

export default function CultureSlangReaderPage({
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onReadArticle,
  onLogout
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPublishedArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/culture-articles?status=published&size=50&sort=createdAt,desc');
      setArticles(res.data.content || []);
    } catch (e) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublishedArticles();
  }, [fetchPublishedArticles]);

  // Lọc bài viết theo từ khóa tìm kiếm
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.authorName && a.authorName.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  // Bài viết mới nhất (Hero card)
  const latestArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  // Các bài viết còn lại trong lưới
  const otherArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="culture-reader-page">
      {/* Top Navbar Chuẩn Hóa */}
      <Navbar
        currentView="culture_reader"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      {/* Header Banner */}
      <header className="culture-header-banner">
        <div className="culture-badge">
          <span>🌸</span>
          <span>Japanese Culture, Slang & Career Insights</span>
        </div>
        <h1 className="culture-page-title">
          Explore Japanese Culture & Modern Slang
        </h1>
        <p className="culture-page-sub">
          Authentic articles on workplace etiquette, youth language (若者言葉), tea ceremonies, and career growth in Japan written by JLMS Authors and Lecturers.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
          <p>Loading the latest cultural articles...</p>
        </div>
      ) : articles.length === 0 ? (
        /* Empty State */
        <div style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌸</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>No articles published yet</h3>
          <p style={{ color: 'var(--text-body)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            There are currently no articles in the system. Log in with an <strong>Author</strong> account to publish the first story!
          </p>
          {currentUser?.role === 'Author' ? (
            <button
              className="btn-primary-purple"
              style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)' }}
              onClick={() => onNavigate('culture_articles')}
            >
              ✍️ Go to Workspace to Write an Article
            </button>
          ) : !currentUser ? (
            <button
              className="btn-primary-purple"
              style={{ marginTop: '1.5rem' }}
              onClick={() => onOpenAuth('login')}
            >
              Sign In as Author
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* LATEST ARTICLE HERO */}
          {latestArticle && (
            <section className="latest-hero-container">
              <div className="latest-hero-card" onClick={() => onReadArticle(latestArticle)}>
                <div className="latest-hero-image-wrap">
                  <img
                    src={latestArticle.coverImageUrl || ARTICLE_COVER_PRESETS[0].url}
                    alt={latestArticle.title}
                    className="latest-hero-image"
                  />
                  <div className="latest-hero-tag">
                    <span>✨</span>
                    <span>LATEST FEATURED STORY</span>
                  </div>
                </div>

                <div className="latest-hero-content">
                  <div>
                    <div className="latest-category-row">
                      <span>⛩️ Featured Culture Story</span>
                      <span>•</span>
                      <span>{latestArticle.publishedAt ? new Date(latestArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
                    </div>
                    <h2 className="latest-hero-title">
                      {latestArticle.title}
                    </h2>
                    <p className="latest-hero-excerpt">
                      {latestArticle.content}
                    </p>
                  </div>

                  <div className="latest-hero-footer">
                    <div className="author-pill">
                      <img
                        src={latestArticle.authorAvatarUrl || AVATAR_PRESETS[0].url}
                        alt="author"
                        className="author-pill-avatar"
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                          {latestArticle.authorName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Author • JLMS Japanese Culture
                        </div>
                      </div>
                    </div>

                    <button className="btn-primary-purple" style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}>
                      Read Full Article →
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ALL OTHER ARTICLES / MORE ARTICLES */}
          <section className="more-articles-wrap">
            <div className="section-header-bar">
              <div className="section-header-title">
                <span>📚</span>
                <span>Discover More Stories ({otherArticles.length})</span>
              </div>

              <input
                type="text"
                placeholder="🔍 Search articles by title or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-pill-input"
                style={{ width: '320px' }}
              />
            </div>

            {otherArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No articles found matching your search query.' : 'The latest article is featured above.'}
                </p>
              </div>
            ) : (
              <div className="article-grid">
                {otherArticles.map(art => (
                  <div key={art.articleId} className="article-card" onClick={() => onReadArticle(art)}>
                    <img
                      src={art.coverImageUrl || ARTICLE_COVER_PRESETS[0].url}
                      alt={art.title}
                      className="article-card-cover"
                    />
                    <div className="article-card-body">
                      <div className="article-meta-row">
                        <span>⛩️ Cultural Story</span>
                        <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
                      </div>

                      <h3 className="article-card-title">{art.title}</h3>
                      <p className="article-card-excerpt">{art.content}</p>

                      <div className="article-author-row">
                        <div className="article-author-info">
                          <img src={art.authorAvatarUrl || AVATAR_PRESETS[0].url} alt="avt" className="article-author-avatar" />
                          <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{art.authorName}</span>
                        </div>
                        <span className="article-read-btn">
                          Read Story →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
