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
import CourseCatalogPage from './features/courses/CourseCatalogPage';
import PaymentReturnView from './features/courses/components/PaymentReturnView';
import FreeCoursesPage from './features/free-courses/FreeCoursesPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { KanjiPage } from './pages/KanjiPage';
import { PersonalDecksPage } from './pages/PersonalDecksPage';
import { PersonalVocabDecksPage } from './pages/PersonalVocabDecksPage';
import { PersonalKanjiDecksPage } from './pages/PersonalKanjiDecksPage';
import { AccountsPage } from './pages/AccountsPage';
import StudentExamWorkspace from './features/student-exams/StudentExamWorkspace';


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

  // Kiểm tra nếu được redirect từ SePay về (?view=payment_return hoặc có orderCode)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const orderCode = urlParams.get('orderCode');
    if (viewParam === 'payment_return' || orderCode) {
      setCurrentView('payment_return');
    }
  }, []);

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
    // Gọi backend để kết thúc phiên nếu có thể, nhưng vẫn luôn xóa dữ liệu cục bộ.
    // Nhờ vậy người dùng không bị kẹt ở trạng thái đăng nhập nếu request logout lỗi.
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

// Chặn khách vãng lai (Guest) không được vào trang Vocabulary
  useEffect(() => {
    if (!currentUser && (currentView === 'vocab' || currentView === 'vocab-decks')) {
      setCurrentView('landing');
      setAuthModalMode('login');
    }
  }, [currentUser, currentView]);

  const handleNavigate = (view) => {
    if ((view === 'vocab' || view === 'vocab-decks') && !currentUser) {
      setAuthModalMode('login');
      return;
    }
    setCurrentView(view);
  };

  const learningViews = {
    vocab: currentUser ? <VocabularyPage currentUser={currentUser} /> : null,
    'vocab-decks': <PersonalVocabDecksPage onNavigate={handleNavigate} />,
    decks: <PersonalDecksPage onNavigate={handleNavigate} />,
    kanji: <KanjiPage currentUser={currentUser} />,
    accounts: <AccountsPage />,
  };
  const learningView = learningViews[currentView];

  return (
    <div>
      {/* 1. Trang Chủ (HomePage) */}
      {(currentView === 'home' || currentView === 'landing') && (
        <HomePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Tạp Chí Đọc Văn Hóa & Tiếng Lóng (Culture & Slang Magazine) */}
      {currentView === 'culture_reader' && (
        <CultureSlangReaderPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onReadArticle={(article) => handleOpenArticleDetail(article, 'culture_reader')}
          onLogout={handleLogout}
        />
      )}

      {/* 2.1. Danh Mục Khóa Học & Đăng Ký / Mua Khóa Học (Course Catalog & SePay VietQR) */}
      {currentView === 'courses' && (
        <CourseCatalogPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 2.2. Kết Quả Thanh Toán SePay (Return Verification) */}
      {currentView === 'payment_return' && (
        <PaymentReturnView
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 2.5. Trang Khóa Học & Tài Liệu Miễn Phí Tổng Hợp (Free Courses Hub) */}
      {(currentView === 'free_courses' || currentView === 'grammar_reader' || currentView === 'kanji' || currentView === 'kanji-decks' || currentView === 'exercise_practice') && (
        <FreeCoursesPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
          initialTab={
            currentView === 'kanji' ? 'kanji' :
            currentView === 'kanji-decks' ? 'kanji-decks' :
            currentView === 'exercise_practice' ? 'quiz' : 'grammar'
          }
        />
      )}

      {/* 3. Trang Đọc Chi Tiết 1 Bài Viết (Full-Page Article Reader) */}
      {currentView === 'article_detail' && (
        <ArticleDetailPage
          article={readingArticle}
          previousView={previousView}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 4. Không Gian Tác Giả (Author Workspace) */}
      {currentView === 'culture_articles' && (
        <AuthorWorkspacePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onViewProfile={() => setShowProfileModal(true)}
          onOpenArticleDetail={(art) => handleOpenArticleDetail(art, 'culture_articles')}
          onLogout={handleLogout}
        />
      )}

      {/* 5. Khu Vực Giảng Viên (Lecturer Area) */}
      {currentView === 'materials' && (
        <LearningMaterialsView
          currentUser={currentUser}
          onNavigate={handleNavigate}
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
            onNavigate={handleNavigate}
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
          onNavigate={handleNavigate}
          onViewProfile={() => setShowProfileModal(true)}
          onOpenArticleDetail={(art) => handleOpenArticleDetail(art, 'dashboard')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'student_exams' && (
        <StudentExamWorkspace currentUser={currentUser} onNavigate={setCurrentView}
          onViewProfile={() => setShowProfileModal(true)} onLogout={handleLogout} />
      )}

      {/* 7. Quản Lý Danh Mục Từ Vựng (Vocabulary Category Management) */}
      {currentView === 'vocabulary_category' && (
        <VocabularyCategoryPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onViewProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
      )}

      {learningView && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
          <Navbar
            currentView={currentView}
            currentUser={currentUser}
            onNavigate={handleNavigate}
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
