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

          {/* Khu vực Danh mục từ vựng (Thay thế nút test cũ) */}
          <div style={{
            marginTop: '40px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '32px'
          }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: 'var(--text-heading)',
              marginBottom: '16px'
            }}>
              📚 Danh mục từ vựng
            </div>

            <div>
              <button
                onClick={() => {
                  if (typeof onNavigate === 'function') {
                    onNavigate('vocabulary_category'); // Đã bỏ chữ 's' để khớp 100% với App.jsx
                  }
                }}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25), 0 4px 6px -4px rgba(16, 185, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 14px 20px -3px rgba(16, 185, 129, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.25)';
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>📥</span>
                Tải từ vựng mới
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}