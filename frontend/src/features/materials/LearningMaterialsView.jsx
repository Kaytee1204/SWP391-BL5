// src/features/materials/LearningMaterialsView.jsx
import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankWorkspace from '../question-bank/QuestionBankWorkspace';
import VocabularyManagementView from './VocabularyManagementView';
import KanjiModuleManagementView from './KanjiModuleManagementView';
import { KanjiPage } from '../../pages/KanjiPage';
import FlashcardDeckManagementPage from '../flashcard_deck/FlashcardDeckManagementPage';
import ReadingPassageManagementView from '../reading-passages/ReadingPassageManagementView';
import ListeningExerciseManagementView from '../listening-exercises/ListeningExerciseManagementView';
import CourseManagementView from '../courses/CourseManagementView';
import ManagerErrorReportView from '../error_report/ManagerErrorReportView';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenAuth,
  onLogout,
  initialTab = 'grammar_patterns'
}) {
  // Tab chỉ điều phối màn con. Hai màn Kanji được mount cùng nhau vì module là cha của Kanji detail.
  const [materialTab, setMaterialTab] = useState(initialTab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Navbar
        currentView="materials"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1240px', margin: '2rem auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '0.65rem',
          background: '#fff',
          padding: '0.5rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setMaterialTab('grammar_patterns')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'grammar_patterns' ? '#7C3AED' : 'transparent',
              color: materialTab === 'grammar_patterns' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📖 Grammar Patterns
          </button>
          
          <button
            onClick={() => setMaterialTab('grammar_exercises')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'grammar_exercises' ? '#0d9488' : 'transparent',
              color: materialTab === 'grammar_exercises' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Grammar Exercises
          </button>

          <button
            onClick={() => setMaterialTab('question_bank')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'question_bank' ? '#d97706' : 'transparent',
              color: materialTab === 'question_bank' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🗂️ Question Bank
          </button>

          <button
            onClick={() => setMaterialTab('vocabulary_management')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'vocabulary_management' ? '#10b981' : 'transparent',
              color: materialTab === 'vocabulary_management' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Vocabulary Management
          </button>

          <button
            onClick={() => setMaterialTab('reading_passages')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'reading_passages' ? '#0f766e' : 'transparent',
              color: materialTab === 'reading_passages' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Reading Passages
          </button>

          <button
            onClick={() => setMaterialTab('flashcard_decks')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'flashcard_decks' ? '#3b82f6' : 'transparent',
              color: materialTab === 'flashcard_decks' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🃏 Flashcard Decks
          </button>

          <button
            onClick={() => setMaterialTab('kanji_modules')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'kanji_modules' ? '#0284c7' : 'transparent',
              color: materialTab === 'kanji_modules' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🏮 Kanji Modules & Dictionary
          </button>

          <button
            onClick={() => setMaterialTab('courses')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'courses' ? '#ea580c' : 'transparent',
              color: materialTab === 'courses' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Courses (Khóa học & Giá)
          </button>

          <button
            onClick={() => setMaterialTab('listening_exercises')}
            style={{
              padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none',
              fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
              background: materialTab === 'listening_exercises' ? '#2563eb' : 'transparent',
              color: materialTab === 'listening_exercises' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🎧 Listening Exercises
          </button>

          <button
            onClick={() => setMaterialTab('error_reports')}
            style={{
              padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none',
              fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
              background: materialTab === 'error_reports' ? '#e11d48' : 'transparent',
              color: materialTab === 'error_reports' ? '#fff' : '#e11d48',
              transition: 'all 0.2s ease'
            }}
          >
            🚨 Error Reports
          </button>
        </div>

        {/* Tab Content Rendering */}
        {materialTab === 'grammar_patterns' && (
          <GrammarManagementView currentUser={currentUser} />
        )}
        
        {materialTab === 'grammar_exercises' && (
          <GrammarExerciseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'question_bank' && (
          <QuestionBankWorkspace currentUser={currentUser} />
        )}

        {materialTab === 'vocabulary_management' && (
          <VocabularyManagementView currentUser={currentUser} />
        )}

        {materialTab === 'reading_passages' && (
          <ReadingPassageManagementView currentUser={currentUser} />
        )}

        {materialTab === 'flashcard_decks' && (
          <FlashcardDeckManagementPage currentUser={currentUser} />
        )}

        {materialTab === 'kanji_modules' && (
          // Quản lý module (36-39) và Kanji detail (40-43) trên cùng workspace để thấy quan hệ cha-con.
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <KanjiModuleManagementView currentUser={currentUser} />
            <KanjiPage currentUser={currentUser} onNavigate={onNavigate} />
          </div>
        )}

        {materialTab === 'courses' && (
          <CourseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'listening_exercises' && (
          <ListeningExerciseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'error_reports' && (
          <ManagerErrorReportView currentUser={currentUser} />
        )}

      </main>
    </div>
  );
}
