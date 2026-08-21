import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { ARTICLE_COVER_PRESETS, AVATAR_PRESETS } from '../../assets/constants';
import Navbar from '../../components/common/Navbar';

/**
 * ============================================================================
 * NGHIỆP VỤ: Tạp chí Đọc Văn hóa, Đời sống & Tiếng lóng Nhật Bản (Culture Reader)
 * ĐỐI TƯỢNG SỬ DỤNG:
 *  - Dành cho tất cả mọi người (Khách vãng lai, Học viên, Giảng viên, v.v.).
 * CHỨC NĂNG CHÍNH:
 *  1. Tải danh sách các bài viết đã được xuất bản (status=published).
 *  2. Tìm kiếm tức thì theo tiêu đề, nội dung, hoặc tên tác giả.
 *  3. Hiển thị bài viết mới nhất dưới dạng Thẻ nổi bật (Hero Featured Card).
 *  4. Hiển thị danh sách các bài viết khác dưới dạng Lưới thẻ (Article Cards Grid).
 *  5. Click vào bất kỳ bài viết nào để mở trang đọc toàn màn hình (ArticleDetailPage).
 * ============================================================================
 */
export default function CultureSlangReaderPage({
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onReadArticle,
  onLogout
}) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [articles, setArticles] = useState([]);     // Danh sách bài viết đã xuất bản
  const [loading, setLoading] = useState(true);     // Trạng thái đang tải dữ liệu
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm bài viết

  /**
   * [CHỨC NĂNG 1]: Tải các bài viết đã xuất bản (status=published)
   * - Endpoint: GET /api/v1/culture-articles?status=published&size=50&sort=createdAt,desc
   */
  const fetchPublishedArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/culture-articles?status=published&size=50&sort=createdAt,desc');
      setArticles(res.data.content || []);
    } catch (e) {
      console.error('Lỗi khi tải bài viết văn hóa:', e);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublishedArticles();
  }, [fetchPublishedArticles]);

  /**
   * [CHỨC NĂNG 2]: Lọc danh sách bài viết theo từ khóa tìm kiếm
   */
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.authorName && a.authorName.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  // Bài viết mới nhất (được đặt ở vị trí Hero Card nổi bật đầu trang)
  const latestArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  // Danh sách các bài viết còn lại để hiển thị dạng lưới
  const otherArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="culture-reader-page">
      {/* 1. THANH ĐIỀU HƯỚNG NAVBAR */}
      <Navbar
        currentView="culture_reader"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      {/* 2. HEADER BANNER GIỚI THIỆU CHUYÊN MỤC */}
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

      {/* 3. NỘI DUNG CHÍNH (LOADING / EMPTY / GRID BÀI VIẾT) */}
      {loading ? (
        /* Trạng thái đang tải */
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
          <p>Loading the latest cultural articles...</p>
        </div>
      ) : articles.length === 0 ? (
        /* Trạng thái chưa có bài viết nào trong hệ thống */
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
              Log in to Explore More
            </button>
          ) : null}
        </div>
      ) : (
        /* Danh sách bài viết & Thanh tìm kiếm */
        <main className="culture-reader-content">
          {/* Thanh tìm kiếm bài viết */}
          <div className="culture-search-toolbar">
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search cultural topics, Japanese slangs, business etiquette, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="culture-search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
            <div className="articles-count-badge">
              Found <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'article' : 'articles'}
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            /* Không tìm thấy bài viết khớp với từ khóa */
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
              <h3 style={{ color: 'var(--text-heading)', fontWeight: 800 }}>No matching articles</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>Try searching with another keyword.</p>
            </div>
          ) : (
            <>
              {/* THẺ BÀI VIẾT NỔI BẬT NHẤT (HERO ARTICLE CARD) */}
              {latestArticle && (
                <section className="featured-hero-card" onClick={() => onReadArticle && onReadArticle(latestArticle)}>
                  <div className="featured-hero-image-wrap">
                    <img
                      src={latestArticle.coverImageUrl || ARTICLE_COVER_PRESETS[0].url}
                      alt={latestArticle.title}
                      className="featured-hero-image"
                    />
                    <div className="featured-pill-badge">🌟 LATEST FEATURED ESSAY</div>
                  </div>

                  <div className="featured-hero-content">
                    <div className="culture-badge">
                      <span>⛩️</span>
                      <span>Japanese Culture & Insights</span>
                    </div>

                    <h2 className="featured-hero-title">
                      {latestArticle.title}
                    </h2>

                    <p className="featured-hero-snippet">
                      {latestArticle.content ? (latestArticle.content.slice(0, 220) + '...') : ''}
                    </p>

                    <div className="featured-hero-footer">
                      <div className="article-author-info">
                        <img
                          src={latestArticle.authorAvatarUrl || AVATAR_PRESETS[0].url}
                          alt={latestArticle.authorName}
                          className="author-avatar-img"
                        />
                        <div>
                          <div className="author-name-text">{latestArticle.authorName}</div>
                          <div className="article-date-text">
                            {latestArticle.publishedAt ? new Date(latestArticle.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn-read-now"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReadArticle && onReadArticle(latestArticle);
                        }}
                      >
                        Read Full Article →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* LƯỚI CÁC BÀI VIẾT CÒN LẠI (OTHER ARTICLES GRID) */}
              {otherArticles.length > 0 && (
                <div className="articles-grid">
                  {otherArticles.map((art) => (
                    <article
                      key={art.articleId}
                      className="article-card"
                      onClick={() => onReadArticle && onReadArticle(art)}
                    >
                      <div className="article-card-cover-wrap">
                        <img
                          src={art.coverImageUrl || ARTICLE_COVER_PRESETS[0].url}
                          alt={art.title}
                          className="article-card-cover"
                        />
                      </div>

                      <div className="article-card-body">
                        <div className="article-card-tag">🌸 ESSAY & INSIGHTS</div>
                        <h3 className="article-card-title">{art.title}</h3>
                        <p className="article-card-excerpt">
                          {art.content ? (art.content.slice(0, 120) + '...') : ''}
                        </p>

                        <div className="article-card-footer">
                          <div className="article-author-info">
                            <img
                              src={art.authorAvatarUrl || AVATAR_PRESETS[0].url}
                              alt={art.authorName}
                              className="author-avatar-img"
                            />
                            <div>
                              <div className="author-name-text">{art.authorName}</div>
                              <div className="article-date-text">
                                {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                              </div>
                            </div>
                          </div>

                          <span className="read-more-link">Read →</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}
