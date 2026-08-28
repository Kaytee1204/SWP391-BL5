import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { ARTICLE_COVER_PRESETS, AVATAR_PRESETS } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import CreateArticleModal from './components/CreateArticleModal';
import EditArticleModal from './components/EditArticleModal';

export default function CultureArticleManagementView({ currentUser, onReadArticle }) {
  const [articles, setArticles] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all'); // 'all' hoặc 'my'
  const [page, setPage] = useState(0);

  const [editingArticle, setEditingArticle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    } catch (e) {}
  }, [keyword, statusFilter, authorFilter, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDeleteArticle = async (article) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết: "${article.title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await apiRequest(`/culture-articles/${article.articleId}`, 'DELETE');
      alert('Đã xóa bài viết thành công!');
      fetchArticles();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="content-card">
      {/* Top 4 Summary Stats Cards */}
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

      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>⛩️ Quản Lý Bài Viết Văn Hóa & Giáo Dục</h3>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
            Quản lý các bài viết văn hóa, tiếng lóng giới trẻ và kinh nghiệm làm việc tại Nhật
          </div>
        </div>

        <div className="card-actions-group">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, từ khóa..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            className="search-pill-input"
          />

          {(currentUser?.role === 'Author' || currentUser?.role === 'Manager') && (
            <select
              value={authorFilter}
              onChange={e => { setAuthorFilter(e.target.value); setPage(0); }}
              className="select-pill"
            >
              <option value="all">Xem: Tất cả bài viết hệ thống</option>
              <option value="my">Xem: Bài do tôi viết</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {(currentUser?.role === 'Author' || currentUser?.role === 'Manager') && (
            <button className="btn-dash btn-dash-primary" onClick={() => setShowCreateModal(true)}>
              + Viết Bài Mới
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Bài viết</th>
              <th>Tác giả</th>
              <th>Ngày tạo</th>
              <th>Ngày xuất bản</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
                  <div>Chưa có bài viết nào. {currentUser?.role === 'Author' ? 'Nhấp "+ Viết Bài Mới" để đăng bài viết đầu tiên nhé!' : ''}</div>
                </td>
              </tr>
            ) : (
              articles.map(art => {
                const isAuthorOwner = currentUser?.role === 'Author' && art.authorId === currentUser?.accountId;
                const canEdit = isAuthorOwner || currentUser?.role === 'Manager';
                const canDelete = isAuthorOwner || currentUser?.role === 'Manager';
                return (
                  <tr key={art.articleId}>
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <img src={art.authorAvatarUrl || AVATAR_PRESETS[0].url} alt="avt" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{art.authorName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {art.createdAt ? new Date(art.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${art.status}`}>
                        {art.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-action-view"
                          onClick={() => onReadArticle && onReadArticle(art)}
                          title="Đọc toàn bộ bài viết"
                        >
                          📖 Đọc bài
                        </button>

                        {canEdit && (
                          <button
                            className="btn-action-edit"
                            onClick={() => setEditingArticle(art)}
                            title={currentUser?.role === 'Manager' ? 'Quản lý sửa nội dung bài viết' : 'Tác giả sửa nội dung bài viết'}
                          >
                            ✏️ Edit
                          </button>
                        )}

                        {canDelete && (
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteArticle(art)}
                            title="Xóa bài viết"
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

      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {showCreateModal && (
        <CreateArticleModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => fetchArticles()}
        />
      )}

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
