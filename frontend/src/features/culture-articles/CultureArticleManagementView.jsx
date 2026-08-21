import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { ARTICLE_COVER_PRESETS, AVATAR_PRESETS } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import CreateArticleModal from './components/CreateArticleModal';
import EditArticleModal from './components/EditArticleModal';

/**
 * ============================================================================
 * NGHIỆP VỤ: Quản lý Bài viết Văn hóa & Tiếng lóng Nhật Bản (Culture Articles)
 * ĐỐI TƯỢNG SỬ DỤNG:
 *  - Tác giả (Author): Được đăng bài, chỉnh sửa bài của mình, xóa bài của mình.
 *  - Quản lý (Manager): Được xem toàn bộ bài viết, kiểm duyệt, xóa bài viết vi phạm.
 * CHỨC NĂNG CHÍNH:
 *  1. Xem danh sách bài viết phân trang kèm 4 thẻ thống kê số lượng bài.
 *  2. Tìm kiếm bài viết theo tiêu đề và nội dung.
 *  3. Lọc theo trạng thái xuất bản (Published, Draft).
 *  4. Lọc bài viết cá nhân (Authored by Me) vs bài viết toàn hệ thống (All System Articles).
 *  5. Nút "+ Write New Article" mở modal đăng bài mới.
 *  6. Nút "📖 Read" xem bài viết toàn màn hình.
 *  7. Nút "✏️ Edit" chỉnh sửa bài viết của tác giả.
 *  8. Nút "🗑️ Delete" xóa bài viết vĩnh viễn (yêu cầu xác nhận an toàn).
 * ============================================================================
 */
export default function CultureArticleManagementView({ currentUser, onReadArticle }) {
  // --- STATE QUẢN LÝ DỮ LIỆU & BỘ LỌC ---
  const [articles, setArticles] = useState([]); // Danh sách bài viết trên trang
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 }); // Dữ liệu phân trang
  const [keyword, setKeyword] = useState('');           // Từ khóa tìm kiếm bài viết
  const [statusFilter, setStatusFilter] = useState(''); // Lọc trạng thái (published, draft)
  const [authorFilter, setAuthorFilter] = useState('all'); // 'all' (toàn hệ thống) hoặc 'my' (bài của tôi)
  const [page, setPage] = useState(0);                  // Trang hiện tại

  // --- STATE MODAL TẠO & SỬA BÀI VIẾT ---
  const [editingArticle, setEditingArticle] = useState(null);   // Bài viết đang sửa
  const [showCreateModal, setShowCreateModal] = useState(false); // Trạng thái mở modal tạo mới

  /**
   * [CHỨC NĂNG 1]: Tải danh sách bài viết từ Backend API
   * - Nếu tác giả chọn 'my' -> Gọi GET /api/v1/culture-articles/my-articles
   * - Nếu chọn 'all' -> Gọi GET /api/v1/culture-articles
   */
  const fetchArticles = useCallback(async () => {
    try {
      const endpoint = authorFilter === 'my' ? '/culture-articles/my-articles' : '/culture-articles';
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('size', 10);
      params.append('sort', 'createdAt,desc');

      const res = await apiRequest(`${endpoint}?${params.toString()}`);
      setArticles(res.data.content || []);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      });
    } catch (e) {
      console.error('Lỗi khi tải danh sách bài viết:', e);
    }
  }, [keyword, statusFilter, authorFilter, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /**
   * [CHỨC NĂNG 2]: Xóa bài viết vĩnh viễn
   * - Endpoint: DELETE /api/v1/culture-articles/{articleId}
   * - Phân quyền Backend: Chỉ chủ bài viết (Author) hoặc Quản lý (Manager) mới được xóa
   */
  const handleDeleteArticle = async (article) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết: "${article.title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await apiRequest(`/culture-articles/${article.articleId}`, 'DELETE');
      alert('Đã xóa bài viết thành công!');
      fetchArticles(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      alert(`Lỗi khi xóa bài viết: ${err.message}`);
    }
  };

  // Tính toán số lượng bài Published và Draft trên trang hiện tại
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="content-card">
      {/* KHU VỰC 1: 4 THẺ THỐNG KÊ NHANH TRÊN ĐẦU TRANG */}
      <div className="stats-grid-4">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>📰</div>
          <div>
            <div className="stat-mini-num">{pageInfo.totalElements}</div>
            <div className="stat-mini-label">Total Articles</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🟢</div>
          <div>
            <div className="stat-mini-num">{publishedCount}</div>
            <div className="stat-mini-label">Published (Page)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fef3c7', color: '#b45309' }}>🟡</div>
          <div>
            <div className="stat-mini-num">{draftCount}</div>
            <div className="stat-mini-label">Drafts (Page)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>✍️</div>
          <div>
            <div className="stat-mini-num">Author</div>
            <div className="stat-mini-label">Role Allowed</div>
          </div>
        </div>
      </div>

      {/* KHU VỰC 2: THANH HEADER & CÔNG CỤ LỌC / TÌM KIẾM */}
      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>⛩️ Culture & Educational Articles Management</h3>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
            Manage Japanese culture essays, modern youth slang, and life insights in Japan
          </div>
        </div>

        <div className="card-actions-group">
          {/* Ô nhập tìm kiếm bài viết */}
          <input
            type="text"
            placeholder="Search by title or keywords..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            className="search-pill-input"
          />

          {/* Dropdown chuyển đổi xem bài của tôi vs xem bài toàn hệ thống (Dành cho Tác giả) */}
          {currentUser?.role === 'Author' && (
            <select
              value={authorFilter}
              onChange={e => { setAuthorFilter(e.target.value); setPage(0); }}
              className="select-pill"
            >
              <option value="all">View: All System Articles</option>
              <option value="my">View: Authored by Me</option>
            </select>
          )}

          {/* Dropdown lọc theo trạng thái xuất bản */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Status: All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Nút bấm mở Modal viết bài mới (Chỉ Author mới hiển thị) */}
          {currentUser?.role === 'Author' && (
            <button className="btn-dash btn-dash-primary" onClick={() => setShowCreateModal(true)}>
              + Write New Article
            </button>
          )}
        </div>
      </div>

      {/* KHU VỰC 3: BẢNG DANH SÁCH BÀI VIẾT VĂN HÓA */}
      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Article</th>
              <th>Author</th>
              <th>Created At</th>
              <th>Published At</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              /* Trạng thái không có bài viết nào */
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
                  <div>No articles found. {currentUser?.role === 'Author' ? 'Click "+ Write New Article" to publish your first post!' : ''}</div>
                </td>
              </tr>
            ) : (
              /* Render từng dòng bài viết */
              articles.map(art => {
                // Kiểm tra xem user hiện tại có phải chủ bài viết không
                const isAuthorOwner = currentUser?.role === 'Author' && art.authorId === currentUser?.accountId;
                // Quyền xóa: Cho phép chủ bài viết hoặc Quản lý
                const canDelete = isAuthorOwner || currentUser?.role === 'Manager';

                return (
                  <tr key={art.articleId}>
                    {/* Cột 1: Ảnh bìa + Tiêu đề + ID */}
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={art.coverImageUrl || ARTICLE_COVER_PRESETS[0].url}
                          alt="cover"
                          style={{ width: '56px', height: '42px', borderRadius: '8px', objectFit: 'cover', background: '#ede9fe' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {art.title}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            ID: #{art.articleId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thông tin Tác giả */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <img src={art.authorAvatarUrl || AVATAR_PRESETS[0].url} alt="avt" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{art.authorName}</span>
                      </div>
                    </td>

                    {/* Cột 3: Ngày tạo */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {art.createdAt ? new Date(art.createdAt).toLocaleDateString('en-US') : '-'}
                    </td>

                    {/* Cột 4: Ngày xuất bản */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US') : 'Unpublished'}
                    </td>

                    {/* Cột 5: Trạng thái (Published / Draft) */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${art.status}`}>
                        {art.status}
                      </span>
                    </td>

                    {/* Cột 6: Các nút hành động (Đọc, Sửa, Xóa) */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* Nút Đọc bài chi tiết */}
                        <button
                          className="btn-action-view"
                          onClick={() => onReadArticle && onReadArticle(art)}
                          title="Read full article"
                        >
                          📖 Read
                        </button>

                        {/* Nút Chỉnh sửa bài viết (Chỉ chủ bài viết mới có quyền) */}
                        {isAuthorOwner && (
                          <button
                            className="btn-action-edit"
                            onClick={() => setEditingArticle(art)}
                            title="Edit article content"
                          >
                            ✏️ Edit
                          </button>
                        )}

                        {/* Nút Xóa bài viết */}
                        {canDelete && (
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteArticle(art)}
                            title="Delete article"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* KHU VỰC 4: THANH PHÂN TRANG */}
      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* MODAL 1: TẠO BÀI VIẾT MỚI */}
      {showCreateModal && (
        <CreateArticleModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => fetchArticles()}
        />
      )}

      {/* MODAL 2: CHỈNH SỬA BÀI VIẾT */}
      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSaveSuccess={() => fetchArticles()}
        />
      )}
    </div>
  );
}
