import React, { useState, useEffect, useCallback } from 'react';
import { AVATAR_PRESETS } from '../../assets/constants';
import FbProfileDropdown from '../../components/common/FbProfileDropdown';
import AccountManagementView from '../account-management/AccountManagementView';
import CultureArticleManagementView from '../culture-articles/CultureArticleManagementView';
import PaymentReportView from './components/PaymentReportView';
import RefundInfoView from './components/RefundInfoView';

import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankWorkspace from '../question-bank/QuestionBankWorkspace';

import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryFormModal from '../../components/vocabulary_category/CategoryFormModal';
import CategoryItemsModal from '../../components/vocabulary_category/CategoryItemsModal';
import FlashcardDeckManagementPage from '../flashcard_deck/FlashcardDeckManagementPage';
import ManagerErrorReportView from '../error_report/ManagerErrorReportView'; 

export default function ManagerDashboardPage({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenArticleDetail,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [materialSubTab, setMaterialSubTab] = useState('grammar_patterns'); 
  const [showProPopup, setShowProPopup] = useState(false);

  // State cho phần Quản lý Danh mục từ vựng
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForItems, setSelectedCategoryForItems] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await vocabularyCategoryApi.getAll();
      if (response && (response.code === 200 || response.code === 201)) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách từ vựng:", error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'materials' && materialSubTab === 'vocabulary_categories') {
      fetchCategories();
    }
  }, [activeTab, materialSubTab, fetchCategories]);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        const response = await vocabularyCategoryApi.delete(id);
        if (response && (response.code === 200 || response.code === 204)) {
          fetchCategories(); 
        }
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!formData.name || !formData.name.trim()) {
      alert('Tên danh mục không được để trống!');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        jlptLevel: formData.jlptLevel,
        description: formData.description ? formData.description.trim() : ''
      };

      let response;
      if (editingCategory) {
        response = await vocabularyCategoryApi.update(editingCategory.categoryId, payload);
      } else {
        const createdById = currentUser?.accountId || currentUser?.id;
        response = await vocabularyCategoryApi.create(createdById ? { ...payload, createdById } : payload);
      }

      const success = response && (response.code === 200 || response.code === 201);
      if (!success) {
        alert(response?.message || 'Không thể lưu danh mục.');
        return;
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      alert(error?.message || 'Lỗi khi lưu danh mục.');
    }
  };

  const getJlptBadgeStyle = (level) => {
    const styles = {
      'N5': { bg: '#dcfce7', color: '#166534' },
      'N4': { bg: '#dbeafe', color: '#1e40af' },
      'N3': { bg: '#fef3c7', color: '#92400e' },
      'N2': { bg: '#ffedd5', color: '#c2410c' },
      'N1': { bg: '#fee2e2', color: '#991b1b' },
    };
    const style = styles[level] || { bg: '#f1f5f9', color: '#475569' };
    return {
      backgroundColor: style.bg,
      color: style.color,
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      display: 'inline-block'
    };
  };

  const filteredCategories = filterLevel === 'ALL' 
    ? categories 
    : categories.filter(c => c.jlptLevel === filterLevel);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="brand-box"
          onClick={() => onNavigate('landing')}
          style={{ cursor: 'pointer' }}
          title="JLMS - Back to Home"
        >
          <div className="brand-logo-dash">⛩️</div>
          <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>JLMS Manager</div>
        </div>

        <div className="sidebar-menu">
          <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
            <div className="nav-item-left"><span>👥</span><span>Accounts</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
            <div className="nav-item-left"><span>📚</span><span>Learning Materials</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'culture_articles' ? 'active' : ''}`} onClick={() => setActiveTab('culture_articles')}>
            <div className="nav-item-left"><span>⛩️</span><span>Cultural Articles</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'payment_report' ? 'active' : ''}`} onClick={() => setActiveTab('payment_report')}>
            <div className="nav-item-left"><span>💳</span><span>Payment Reports</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'refund_info' ? 'active' : ''}`} onClick={() => setActiveTab('refund_info')}>
            <div className="nav-item-left"><span>🔄</span><span>Refund Information</span></div>
            <span>›</span>
          </div>
        </div>

        <div className="sidebar-promo-card">
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.35rem' }}>✨ JLMS Pro</div>
          <div style={{ fontSize: '0.72rem', color: '#7c2d12', marginBottom: '0.75rem' }}>Advanced AI tools & learning management</div>
          <button className="btn-dash btn-dash-primary" style={{ width: '100%', padding: '0.45rem' }} onClick={() => setShowProPopup(true)}>
            Upgrade to Pro!
          </button>
        </div>

        <div className="sidebar-user-card" onClick={onViewProfile} title="Click to view & edit your profile">
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
            <h2 className="greeting-title">Welcome, {currentUser?.fullName} 👋</h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.875rem' }}>JLMS System Administration Portal</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <FbProfileDropdown currentUser={currentUser} onViewProfile={onViewProfile} onNavigate={onNavigate} onLogout={onLogout} />
          </div>
        </div>

        {activeTab === 'accounts' && <AccountManagementView currentUser={currentUser} onAccountUpdated={() => {}} />}

        {activeTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex', gap: '0.75rem', background: '#fff', padding: '0.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', width: 'fit-content', flexWrap: 'wrap'
            }}>
              <button onClick={() => setMaterialSubTab('grammar_patterns')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'grammar_patterns' ? '#7C3AED' : 'transparent', color: materialSubTab === 'grammar_patterns' ? '#fff' : 'var(--text-body)' }}>📖 Grammar Patterns</button>
              <button onClick={() => setMaterialSubTab('grammar_exercises')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'grammar_exercises' ? '#0d9488' : 'transparent', color: materialSubTab === 'grammar_exercises' ? '#fff' : 'var(--text-body)' }}>📝 Grammar Exercises</button>
              <button onClick={() => setMaterialSubTab('question_bank')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'question_bank' ? '#d97706' : 'transparent', color: materialSubTab === 'question_bank' ? '#fff' : 'var(--text-body)' }}>🗂️ Question Bank</button>
              <button onClick={() => setMaterialSubTab('vocabulary_categories')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'vocabulary_categories' ? '#10b981' : 'transparent', color: materialSubTab === 'vocabulary_categories' ? '#fff' : 'var(--text-body)' }}>📚 Vocabulary Categories</button>
              <button onClick={() => setMaterialSubTab('flashcard_decks')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'flashcard_decks' ? '#3b82f6' : 'transparent', color: materialSubTab === 'flashcard_decks' ? '#fff' : 'var(--text-body)' }}>🃏 Flashcard Decks</button>
              <button onClick={() => setMaterialSubTab('error_reports')} style={{ padding: '0.5rem 1.15rem', borderRadius: '10px', border: materialSubTab === 'error_reports' ? 'none' : '1px solid #fecdd3', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'error_reports' ? '#e11d48' : 'transparent', color: materialSubTab === 'error_reports' ? '#fff' : '#e11d48' }}>⚠️ Báo cáo lỗi</button>
            </div>

            {materialSubTab === 'grammar_patterns' && (
              <GrammarManagementView currentUser={currentUser} />
            )}
            {materialSubTab === 'grammar_exercises' && (
              <GrammarExerciseManagementView currentUser={currentUser} />
            )}
            {materialSubTab === 'question_bank' && (
              <QuestionBankWorkspace currentUser={currentUser} />
            )}
            {materialSubTab === 'vocabulary_categories' && (
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Quản lý Danh mục Từ vựng</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thêm, sửa, xóa và quản lý chi tiết từ vựng theo cấp độ JLPT</p>
                  </div>
                  <button 
                    onClick={handleAddNew}
                    style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
                  >
                    + Thêm mới
                  </button>
                </div>

                {/* Bộ lọc cấp độ JLPT */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilterLevel(level)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: filterLevel === level ? '#10b981' : '#f1f5f9',
                        color: filterLevel === level ? '#ffffff' : '#475569',
                        fontSize: '0.85rem'
                      }}
                    >
                      {level === 'ALL' ? 'Tất cả cấp độ' : level}
                    </button>
                  ))}
                </div>

                {/* Giao diện dạng Cards hiện đại */}
                {filteredCategories.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa có danh mục từ vựng nào.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredCategories.map((cat) => {
                      const itemCount = cat.items ? cat.items.length : 0;
                      return (
                        <div 
                          key={cat.categoryId}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={getJlptBadgeStyle(cat.jlptLevel)}>{cat.jlptLevel}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{cat.categoryId}</span>
                            </div>
                            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{cat.name}</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                              {cat.description || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Không có mô tả</span>}
                            </p>
                          </div>

                          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedCategoryForItems(cat)}
                              style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              📚 Xem ({itemCount} từ)
                            </button>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEdit(cat)} style={{ padding: '6px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>Sửa</button>
                              <button onClick={() => handleDelete(cat.categoryId)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>Xóa</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <CategoryFormModal 
                  isOpen={isModalOpen} 
                  onClose={() => setIsModalOpen(false)} 
                  onSubmit={handleFormSubmit}
                  initialData={editingCategory}
                />

                <CategoryItemsModal 
                  category={selectedCategoryForItems}
                  onClose={() => setSelectedCategoryForItems(null)}
                />
              </div>
            )}

            {materialSubTab === 'flashcard_decks' && <FlashcardDeckManagementPage currentUser={currentUser} />}
            {materialSubTab === 'error_reports' && <ManagerErrorReportView />}
          </div>
        )}

        {activeTab === 'culture_articles' && <CultureArticleManagementView currentUser={currentUser} onReadArticle={(art) => onOpenArticleDetail(art, 'dashboard')} />}
        {activeTab === 'payment_report' && <PaymentReportView />}
        {activeTab === 'refund_info' && <RefundInfoView />}
      </main>

      {showProPopup && (
        <div className="modal-overlay" onClick={() => setShowProPopup(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀</div>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '0.5rem', fontWeight: 800 }}>JLMS Pro — Coming Soon!</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>Advanced capabilities and AI models are currently being integrated into the platform.</p>
            <button className="btn-dash btn-dash-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowProPopup(false)}>Got It</button>
          </div>
        </div>
      )}
    </div>
  );
}