import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankManagementView from '../question-bank/QuestionBankManagementView';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onLogout,
  initialTab = 'grammar_patterns'
}) {
  const [materialTab, setMaterialTab] = useState(initialTab); // 'grammar_patterns' | 'grammar_exercises' | 'question_bank'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar */}
      <Navbar
        currentView="materials"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1180px', margin: '2rem auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Workspace Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          background: '#fff',
          padding: '0.5rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          width: 'fit-content'
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
            📖 Grammar Patterns (Lý thuyết)
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
            📝 Grammar Exercises (Bài tập trắc nghiệm)
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
            🗂️ Question Bank (Ngân hàng câu hỏi)
          </button>
        </div>

        {/* Tab Content */}
        {materialTab === 'grammar_patterns' ? (
          <GrammarManagementView currentUser={currentUser} />
        ) : materialTab === 'grammar_exercises' ? (
          <GrammarExerciseManagementView currentUser={currentUser} />
        ) : (
          <QuestionBankManagementView currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
