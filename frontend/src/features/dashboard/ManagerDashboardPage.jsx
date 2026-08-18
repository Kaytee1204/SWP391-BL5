import React, { useState } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';
import FbProfileDropdown from '../../components/common/FbProfileDropdown';
import AccountManagementView from '../account-management/AccountManagementView';
import CultureArticleManagementView from '../culture-articles/CultureArticleManagementView';
import PaymentReportView from './components/PaymentReportView';
import RefundInfoView from './components/RefundInfoView';

export default function ManagerDashboardPage({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenArticleDetail,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [showProPopup, setShowProPopup] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="brand-box"
          onClick={() => onNavigate('landing')}
          style={{ cursor: 'pointer' }}
          title="JLMS - Về Trang Chủ"
        >
          <div className="brand-logo-dash">⛩️</div>
          <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>JLMS Manager</div>
        </div>

        <div className="sidebar-menu">
          <div
            className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <div className="nav-item-left"><span>👥</span><span>Tài Khoản (Accounts)</span></div>
            <span>›</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <div className="nav-item-left"><span>📚</span><span>Tài Liệu Học Tập</span></div>
            <span>›</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'culture_articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('culture_articles')}
          >
            <div className="nav-item-left"><span>⛩️</span><span>Bài Viết Văn Hóa</span></div>
            <span>›</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'payment_report' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment_report')}
          >
            <div className="nav-item-left"><span>💳</span><span>Báo Cáo Thanh Toán</span></div>
            <span>›</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'refund_info' ? 'active' : ''}`}
            onClick={() => setActiveTab('refund_info')}
          >
            <div className="nav-item-left"><span>🔄</span><span>Thông Tin Hoàn Tiền</span></div>
            <span>›</span>
          </div>
        </div>

        <div className="sidebar-promo-card">
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.35rem' }}>✨ JLMS Pro</div>
          <div style={{ fontSize: '0.72rem', color: '#7c2d12', marginBottom: '0.75rem' }}>Bộ công cụ AI nâng cao & quản trị học tập</div>
          <button
            className="btn-dash btn-dash-primary"
            style={{ width: '100%', padding: '0.45rem' }}
            onClick={() => setShowProPopup(true)}
          >
            Upgrade to Pro!
          </button>
        </div>

        <div
          className="sidebar-user-card"
          onClick={onViewProfile}
          title="Nhấp để xem & sửa hồ sơ cá nhân"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <img src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" className="sidebar-avatar" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.fullName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
            </div>
          </div>
          <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>✏️</span>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="main-viewport">
        <div className="top-header">
          <div>
            <h2 className="greeting-title">Xin chào, {currentUser?.fullName} 👋</h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.875rem' }}>Cổng Quản Trị Hệ Thống JLMS Japanese Learning</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          

            <FbProfileDropdown
              currentUser={currentUser}
              onViewProfile={onViewProfile}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>

        {activeTab === 'accounts' && (
          <AccountManagementView
            currentUser={currentUser}
            onAccountUpdated={() => {}}
          />
        )}

        {activeTab === 'materials' && (
          <div className="content-card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📚</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Quản Lý Tài Liệu Học Tập</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Hiện tại chưa có tài liệu học tập nào trong hệ thống.
            </p>
          </div>
        )}

        {activeTab === 'culture_articles' && (
          <CultureArticleManagementView
            currentUser={currentUser}
            onReadArticle={(art) => onOpenArticleDetail(art, 'dashboard')}
          />
        )}

        {activeTab === 'payment_report' && (
          <PaymentReportView />
        )}

        {activeTab === 'refund_info' && (
          <RefundInfoView />
        )}
      </main>

      {/* Pro Promo Popup */}
      {showProPopup && (
        <div className="modal-overlay" onClick={() => setShowProPopup(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀</div>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '0.5rem', fontWeight: 800 }}>JLMS Pro — Sắp Ra Mắt!</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>Tính năng cao cấp và các mô hình AI đang được tích hợp vào hệ thống.</p>
            <button className="btn-dash btn-dash-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowProPopup(false)}>Đã Hiểu</button>
          </div>
        </div>
      )}
    </div>
  );
}
