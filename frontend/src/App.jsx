import React, { useState, useEffect } from 'react';
import { apiRequest } from './api/apiRequest';
import AuthModal from './components/auth/AuthModal';
import MyProfileModal from './components/auth/MyProfileModal';

// Features
import LandingPage from './features/landing/LandingPage';
import CultureSlangReaderPage from './features/culture-reader/CultureSlangReaderPage';
import ArticleDetailPage from './features/culture-reader/ArticleDetailPage';
import CultureArticleManagementView from './features/culture-articles/CultureArticleManagementView';
import AuthorWorkspacePage from './features/culture-articles/AuthorWorkspacePage';
import LearningMaterialsView from './features/materials/LearningMaterialsView';
import ManagerDashboardPage from './features/dashboard/ManagerDashboardPage';
import VocabularyCategoryPage from './features/vocabulary-category/VocabularyCategoryPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('landing');
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
      setCurrentView('culture_reader');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (e) {}
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setCurrentUser(null);
    setCurrentView('landing');
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

  return (
    <div>
      {/* 1. Trang Chủ (Landing Page) */}
      {currentView === 'landing' && (
        <LandingPage
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
