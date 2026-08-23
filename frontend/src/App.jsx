import React, { useState, useEffect } from 'react';
import { apiRequest } from './api/apiRequest';
import AuthModal from './components/auth/AuthModal';
import MyProfileModal from './components/auth/MyProfileModal';

// Features
import HomePage from './features/homepage/HomePage';
import CultureSlangReaderPage from './features/culture-reader/CultureSlangReaderPage';
import ArticleDetailPage from './features/culture-reader/ArticleDetailPage';
import CultureArticleManagementView from './features/culture-articles/CultureArticleManagementView';
import AuthorWorkspacePage from './features/culture-articles/AuthorWorkspacePage';
import LearningMaterialsView from './features/materials/LearningMaterialsView';
import ManagerDashboardPage from './features/dashboard/ManagerDashboardPage';

import VocabularyCategoryPage from './features/vocabulary-category/VocabularyCategoryPage';
import GrammarReaderPage from './features/grammar/GrammarReaderPage';
import GrammarExercisePracticeView from './features/grammar/GrammarExercisePracticeView';
import QuestionBankWorkspace from './features/question-bank/QuestionBankWorkspace';
import Navbar from './components/common/Navbar';
import { VocabularyPage } from './pages/VocabularyPage';
import { KanjiPage } from './pages/KanjiPage';
import { PersonalVocabDecksPage } from './pages/PersonalVocabDecksPage';
import { PersonalKanjiDecksPage } from './pages/PersonalKanjiDecksPage';
import { AccountsPage } from './pages/AccountsPage';


export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('home');
  const [readingArticle, setReadingArticle] = useState(null);
  const [previousView, setPreviousView] = useState('culture_reader');

  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'register' | null
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Khôi phục session & Profile mới nhất từ backend khi tải app
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token && !currentUser) {
      apiRequest('/auth/me')
        .then(res => {
          if (res?.data) {
            setCurrentUser(res.data);
            localStorage.setItem('user_info', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_info');
          setCurrentUser(null);
        });
    }
  }, [currentUser]);

  const handleLoginSuccess = (authData) => {
    localStorage.setItem('jwt_token', authData.accessToken);
    localStorage.setItem('user_info', JSON.stringify(authData.account));
    setCurrentUser(authData.account);
    setAuthModalMode(null);

    // Chuyển hướng thông minh dựa theo Role
    if (authData.account.role === 'Manager') {
      setCurrentView('dashboard');
    } else if (authData.account.role === 'Author') {
      setCurrentView('culture_articles');
    } else if (authData.account.role === 'Lecturer') {
      setCurrentView('materials');
    } else {
      setCurrentView('kanji');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (e) {}
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleProfileUpdated = (updatedAccountOrAuthData) => {
    const updatedAccount = updatedAccountOrAuthData.account || updatedAccountOrAuthData;
    if (updatedAccountOrAuthData.accessToken) {
      localStorage.setItem('jwt_token', updatedAccountOrAuthData.accessToken);
    }
    localStorage.setItem('user_info', JSON.stringify(updatedAccount));
    setCurrentUser(updatedAccount);
  };

  const handleOpenArticleDetail = (article, fromView = 'culture_reader') => {
    setReadingArticle(article);
    setPreviousView(fromView);
    setCurrentView('article_detail');
  };

  const learningViews = {
    vocab: <VocabularyPage />,
    kanji: <KanjiPage currentUser={currentUser} />,
    'vocab-decks': <PersonalVocabDecksPage onNavigate={setCurrentView} />,
    'kanji-decks': <PersonalKanjiDecksPage onNavigate={setCurrentView} />,
    accounts: <AccountsPage />,
  };
  const learningView = learningViews[currentView];

  return (
    <div>
      {/* 1. Trang Chủ (HomePage) */}
      {(currentView === 'home' || currentView === 'landing') && (
        <HomePage
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Tạp Chí Đọc Văn Hóa & Tiếng Lóng (Culture & Slang Magazine) */}
      {currentView === 'culture_reader' && (
        <CultureSlangReaderPage
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onReadArticle={(article) => handleOpenArticleDetail(article, 'culture_reader')}
          onLogout={handleLogout}
        />
      )}

      {/* 2.5. Tra Cứu Ngữ Pháp JLPT (Japanese Grammar Reader) */}
      {currentView === 'grammar_reader' && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
          <Navbar
            currentView="grammar_reader"
            currentUser={currentUser}
            onNavigate={(view) => setCurrentView(view)}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            onViewProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
          <main style={{ paddingBottom: '3rem' }}>
            <GrammarReaderPage
              currentUser={currentUser}
              onOpenAuth={(mode) => setAuthModalMode(mode)}
            />
          </main>
        </div>
      )}

      {/* 2.6. Luyện Tập Trắc Nghiệm Ngữ Pháp JLPT (Grammar Exercise Practice Quiz) */}
      {currentView === 'exercise_practice' && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
          <Navbar
            currentView="exercise_practice"
            currentUser={currentUser}
            onNavigate={(view) => setCurrentView(view)}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            onViewProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
          <main>
            <GrammarExercisePracticeView
              currentUser={currentUser}
              onOpenAuth={(mode) => setAuthModalMode(mode)}
            />
          </main>
        </div>
      )}

      {/* 3. Trang Đọc Chi Tiết 1 Bài Viết (Full-Page Article Reader) */}
      {currentView === 'article_detail' && (
        <ArticleDetailPage
          article={readingArticle}
          previousView={previousView}
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 4. Không Gian Tác Giả (Author Workspace) */}
      {currentView === 'culture_articles' && (
        <AuthorWorkspacePage
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onViewProfile={() => setShowProfileModal(true)}
          onOpenArticleDetail={(art) => handleOpenArticleDetail(art, 'culture_articles')}
          onLogout={handleLogout}
        />
      )}

      {/* 5. Khu Vực Giảng Viên (Lecturer Area) */}
      {currentView === 'materials' && (
        <LearningMaterialsView
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 5.5. Ngân Hàng Câu Hỏi (Question Bank) */}
      {currentView === 'question_bank' && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
          <Navbar
            currentView="question_bank"
            currentUser={currentUser}
            onNavigate={(view) => setCurrentView(view)}
            onViewProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
          <main style={{ maxWidth: '1180px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
            <QuestionBankWorkspace currentUser={currentUser} />
          </main>
        </div>
      )}

      {/* 6. Cổng Quản Trị Hệ Thống (Manager Dashboard) */}
      {currentView === 'dashboard' && (
        <ManagerDashboardPage
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onViewProfile={() => setShowProfileModal(true)}
          onOpenArticleDetail={(art) => handleOpenArticleDetail(art, 'dashboard')}
          onLogout={handleLogout}
        />
      )}

      {/* 7. Quản Lý Danh Mục Từ Vựng (Vocabulary Category Management) */}
      {currentView === 'vocabulary_category' && (
        <VocabularyCategoryPage
          currentUser={currentUser}
          onNavigate={(view) => setCurrentView(view)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {learningView && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
          <Navbar
            currentView={currentView}
            currentUser={currentUser}
            onNavigate={(view) => setCurrentView(view)}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            onViewProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
          <main className="app-shell">
            {learningView}
          </main>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setAuthModalMode(null)}
        />
      )}

      {/* Profile & Avatar Editing Modal */}
      {showProfileModal && currentUser && (
        <MyProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdateSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
}
