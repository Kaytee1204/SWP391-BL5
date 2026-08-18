import React from 'react';
import Navbar from '../../components/common/Navbar';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onLogout
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar Chuẩn Hóa */}
      <Navbar
        currentView="materials"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div className="content-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>Tài Liệu Giảng Dạy & Học Tập</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.65rem' }}>
            Hiện tại chưa có tài liệu giảng dạy nào được nạp vào hệ thống.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button
              className="btn-primary-purple"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
              onClick={() => alert('Tính năng tải lên tài liệu mới cho giảng viên đang được phát triển.')}
            >
              + Tải Lên Tài Liệu Mới
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
