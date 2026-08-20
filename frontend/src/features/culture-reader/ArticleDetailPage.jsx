import React, { useEffect } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';
import Navbar from '../../components/common/Navbar';

/**
 * ============================================================================
 * NGHIỆP VỤ: Đọc Toàn Bộ Bài Viết Văn Hóa / Tiếng Lóng Nhật Bản Chi Tiết
 * ĐẶC ĐIỂM:
 *  1. Hiển thị toàn màn hình bài viết với hình ảnh cover banner lớn.
 *  2. Tự động cuộn lên đầu trang khi mở bài viết (`window.scrollTo(0, 0)`).
 *  3. Hiển thị thông tin tác giả, ngày đăng, thời lượng đọc ước tính.
 *  4. Format nội dung bài viết thành từng đoạn văn rõ ràng.
 *  5. Nút "← Back to Articles" quay về đúng trang danh sách trước đó mà người đọc vừa đứng.
 * ============================================================================
 */
export default function ArticleDetailPage({
  article,          // Dữ liệu bài viết cần hiển thị
  previousView,     // View trước đó (ví dụ 'culture_reader', 'culture_articles', 'dashboard')
  currentUser,      // Thông tin người dùng hiện tại
  onNavigate,       // Hàm điều hướng
  onViewProfile,    // Hàm mở modal thông tin cá nhân
  onLogout          // Hàm đăng xuất
}) {
  // Trạng thái nếu bài viết không tồn tại hoặc bị lỗi
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

  // Tự động cuộn lên đầu trang khi tải bài viết
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  // Xác định view quay về (mặc định là culture_reader nếu không truyền)
  const returnTarget = previousView || 'culture_reader';

  return (
    <div className="article-detail-page">
      {/* 1. THANH NAVBAR TRÊN CÙNG CÓ NÚT QUAY LẠI NHANH */}
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
        {/* NÚT QUAY LẠI TRANG TRƯỚC */}
        <button className="article-back-btn" onClick={() => onNavigate(returnTarget)}>
          <span>←</span>
          <span>Back to Articles</span>
        </button>

        {/* ẢNH BÌA HERO BANNER LỚN */}
        {article.coverImageUrl && (
          <div className="article-hero-cover-wrap">
            <img src={article.coverImageUrl} alt={article.title} className="article-hero-cover" />
          </div>
        )}

        {/* PHẦN TIÊU ĐỀ & META THÔNG TIN TÁC GIẢ */}
        <div className="article-header-block">
          <div className="culture-badge">
            <span>⛩️</span>
            <span>Japanese Culture & Lifestyle</span>
          </div>

          <h1 className="article-main-title">
            {article.title}
          </h1>

          <div className="article-meta-card">
            {/* THÔNG TIN TÁC GIẢ */}
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

            {/* THỜI GIAN ĐĂNG BÀI & TRẠNG THÁI */}
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

        {/* NỘI DUNG CHI TIẾT BÀI VIẾT (TÁCH THÀNH CÁC ĐOẠN VĂN ĐẸP MẮT) */}
        <article className="article-body-content">
          {article.content ? article.content.split('\n\n').map((para, idx) => (
            <p key={idx} className="article-paragraph">
              {para}
            </p>
          )) : null}
        </article>

        {/* KHUNG CHỮ KÝ TÁC GIẢ DƯỚI CHÂN BÀI VIẾT */}
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
