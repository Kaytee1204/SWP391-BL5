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
import CourseManagementView from '../courses/CourseManagementView';
import ManagerErrorReportView from '../error_report/ManagerErrorReportView';
import ReadingPassageManagementView from '../reading-passages/ReadingPassageManagementView';
import ListeningExerciseManagementView from '../listening-exercises/ListeningExerciseManagementView';
import VocabularyManagementView from '../materials/VocabularyManagementView';
import KanjiModuleManagementView from '../materials/KanjiModuleManagementView';
import { KanjiPage } from '../../pages/KanjiPage';

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

  // States for Vocabulary Categories Management
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
      console.error("Error loading vocabulary categories:", error);
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
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await vocabularyCategoryApi.delete(id);
        if (response && (response.code === 200 || response.code === 204)) {
          fetchCategories(); 
        }
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!formData.name || !formData.name.trim()) {
      alert('Category name cannot be empty!');
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
        alert(response?.message || 'Failed to save category.');
        return;
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error?.message || 'Error saving category.');
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
          <div
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <div className="nav-item-left"><span>📚</span><span>Courses & Pricing</span></div>
            <span>›</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <div className="nav-item-left"><span>📝</span><span>Learning Materials</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'culture_articles' ? 'active' : ''}`} onClick={() => setActiveTab('culture_articles')}>
            <div className="nav-item-left"><span>⛩️</span><span>Cultural Articles (Author Workspace)</span></div>
            <span>›</span>
          </div>
          <div className={`nav-item ${activeTab === 'error_reports' ? 'active' : ''}`} onClick={() => setActiveTab('error_reports')}>
            <div className="nav-item-left"><span>🚨</span><span>Student Error Reports</span></div>
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

        {activeTab === 'courses' && (
          <CourseManagementView currentUser={currentUser} />
        )}

        {activeTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex', gap: '0.6rem', background: '#fff', padding: '0.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', width: 'fit-content', flexWrap: 'wrap'
            }}>
              <button onClick={() => setMaterialSubTab('grammar_patterns')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'grammar_patterns' ? '#7C3AED' : 'transparent', color: materialSubTab === 'grammar_patterns' ? '#fff' : 'var(--text-body)' }}>📖 Grammar Patterns</button>
              <button onClick={() => setMaterialSubTab('grammar_exercises')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'grammar_exercises' ? '#0d9488' : 'transparent', color: materialSubTab === 'grammar_exercises' ? '#fff' : 'var(--text-body)' }}>📝 Grammar Exercises</button>
              <button onClick={() => setMaterialSubTab('question_bank')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'question_bank' ? '#d97706' : 'transparent', color: materialSubTab === 'question_bank' ? '#fff' : 'var(--text-body)' }}>🗂️ Question Bank</button>
              <button onClick={() => setMaterialSubTab('vocabulary_management')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'vocabulary_management' ? '#10b981' : 'transparent', color: materialSubTab === 'vocabulary_management' ? '#fff' : 'var(--text-body)' }}>📚 Vocabulary</button>
              <button onClick={() => setMaterialSubTab('kanji_modules')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'kanji_modules' ? '#0284c7' : 'transparent', color: materialSubTab === 'kanji_modules' ? '#fff' : 'var(--text-body)' }}>🏮 Kanji Modules</button>
              <button onClick={() => setMaterialSubTab('reading_passages')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'reading_passages' ? '#0f766e' : 'transparent', color: materialSubTab === 'reading_passages' ? '#fff' : 'var(--text-body)' }}>📖 Reading Passages</button>
              <button onClick={() => setMaterialSubTab('listening_exercises')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'listening_exercises' ? '#2563eb' : 'transparent', color: materialSubTab === 'listening_exercises' ? '#fff' : 'var(--text-body)' }}>🎧 Listening</button>
              <button onClick={() => setMaterialSubTab('flashcard_decks')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'flashcard_decks' ? '#3b82f6' : 'transparent', color: materialSubTab === 'flashcard_decks' ? '#fff' : 'var(--text-body)' }}>🃏 Flashcard Decks</button>
              <button onClick={() => setMaterialSubTab('error_reports')} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', border: materialSubTab === 'error_reports' ? 'none' : '1px solid #fecdd3', fontWeight: 800, cursor: 'pointer', background: materialSubTab === 'error_reports' ? '#e11d48' : 'transparent', color: materialSubTab === 'error_reports' ? '#fff' : '#e11d48' }}>🚨 Error Reports</button>
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
            {materialSubTab === 'vocabulary_management' && (
              <VocabularyManagementView currentUser={currentUser} />
            )}
            {materialSubTab === 'kanji_modules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <KanjiModuleManagementView currentUser={currentUser} />
                <KanjiPage currentUser={currentUser} onNavigate={onNavigate} />
              </div>
            )}
            {materialSubTab === 'reading_passages' && (
              <ReadingPassageManagementView currentUser={currentUser} />
            )}
            {materialSubTab === 'listening_exercises' && (
              <ListeningExerciseManagementView currentUser={currentUser} />
            )}
            {materialSubTab === 'flashcard_decks' && <FlashcardDeckManagementPage currentUser={currentUser} />}
            {materialSubTab === 'error_reports' && <ManagerErrorReportView />}
          </div>
        )}

        {activeTab === 'culture_articles' && <CultureArticleManagementView currentUser={currentUser} onReadArticle={(art) => onOpenArticleDetail(art, 'dashboard')} />}
        {activeTab === 'error_reports' && <ManagerErrorReportView />}
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