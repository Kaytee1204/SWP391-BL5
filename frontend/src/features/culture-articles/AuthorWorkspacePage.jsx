import React from 'react';
import Navbar from '../../components/common/Navbar';
import CultureArticleManagementView from './CultureArticleManagementView';

export default function AuthorWorkspacePage({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenArticleDetail,
  onLogout
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar Chuẩn Hóa */}
      <Navbar
        currentView="culture_articles"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1240px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-heading)' }}>
            Không Gian Làm Việc Của Tác Giả (Author Workspace)
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.92rem' }}>
            Tạo mới, xuất bản và quản lý các bài viết văn hóa, tiếng lóng giới trẻ cho học viên tiếng Nhật.
          </p>
        </div>

        <CultureArticleManagementView
          currentUser={currentUser}
          onReadArticle={(art) => onOpenArticleDetail(art, 'culture_articles')}
        />
      </main>
    </div>
  );
}
