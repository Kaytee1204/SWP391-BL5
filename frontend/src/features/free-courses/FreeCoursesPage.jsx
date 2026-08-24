import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarReaderPage from '../grammar/GrammarReaderPage';
import { KanjiPage } from '../../pages/KanjiPage';
import GrammarExercisePracticeView from '../grammar/GrammarExercisePracticeView';
import { PersonalKanjiDecksPage } from '../../pages/PersonalKanjiDecksPage';

export default function FreeCoursesPage({
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onLogout,
  initialTab = 'grammar'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body, #fbf9f5)' }}>
      <Navbar
        currentView="free_courses"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1.25rem 0' }}>
        {/* Sub-tab navigation in English */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: '#fff',
          padding: '0.4rem',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            style={{
              flex: 1,
              minWidth: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'grammar' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent',
              color: activeTab === 'grammar' ? '#fff' : '#475569',
              boxShadow: activeTab === 'grammar' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
            }}
          >
            <span>📖</span>
            <span>Grammar Patterns</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanji')}
            style={{
              flex: 1,
              minWidth: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'kanji' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'kanji' ? '#fff' : '#475569',
              boxShadow: activeTab === 'kanji' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
            }}
          >
            <span>🏮</span>
            <span>Kanji Dictionary</span>
          </button>

          {currentUser?.role === 'Student' && (
            <button
              type="button"
              onClick={() => setActiveTab('kanji-decks')}
              style={{
                flex: 1,
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'kanji-decks' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : 'transparent',
                color: activeTab === 'kanji-decks' ? '#fff' : '#475569',
                boxShadow: activeTab === 'kanji-decks' ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none'
              }}
            >
              <span>🗂️</span>
              <span>My Kanji Decks</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              flex: 1,
              minWidth: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'quiz' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent',
              color: activeTab === 'quiz' ? '#fff' : '#475569',
              boxShadow: activeTab === 'quiz' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
            }}
          >
            <span>✍️</span>
            <span>Practice Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ paddingBottom: '3.5rem' }}>
        {activeTab === 'grammar' && (
          <GrammarReaderPage
            currentUser={currentUser}
            onOpenAuth={onOpenAuth}
          />
        )}

        {activeTab === 'kanji' && (
          <div className="app-shell" style={{ paddingTop: '0' }}>
            <KanjiPage
              currentUser={currentUser}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {activeTab === 'kanji-decks' && (
          <div className="app-shell" style={{ paddingTop: '0' }}>
            <PersonalKanjiDecksPage
              onNavigate={onNavigate}
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <GrammarExercisePracticeView
            currentUser={currentUser}
            onOpenAuth={onOpenAuth}
          />
        )}
      </main>
    </div>
  );
}
