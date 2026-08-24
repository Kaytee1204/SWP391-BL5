import React, { useState } from 'react';
import { Database, FileStack } from 'lucide-react';
import QuestionSetManagementView from '../question-set/QuestionSetManagementView';
import QuestionBankManagementView from './QuestionBankManagementView';

export default function QuestionBankWorkspace({ currentUser }) {
  const [activeTab, setActiveTab] = useState('question_sets');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.65rem',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('question_sets')}
            style={tabStyle(activeTab === 'question_sets', '#4f46e5')}
          >
            <FileStack size={17} />
            Bộ câu hỏi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            style={tabStyle(activeTab === 'questions', '#d97706')}
          >
            <Database size={17} />
            Kho câu hỏi
          </button>
        </div>

        <p style={{ margin: 0, padding: '0 0.45rem', color: '#64748b', fontSize: '0.78rem' }}>
          {activeTab === 'question_sets'
            ? 'Tạo bộ đề và chọn câu hỏi từ kho theo skill/level.'
            : 'Tạo và quản lý các câu hỏi gốc dùng chung cho nhiều bộ đề.'}
        </p>
      </div>

      {activeTab === 'question_sets' ? (
        <QuestionSetManagementView currentUser={currentUser} />
      ) : (
        <QuestionBankManagementView currentUser={currentUser} />
      )}
    </div>
  );
}

const tabStyle = (active, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  minHeight: '40px',
  padding: '0.55rem 1rem',
  border: 'none',
  borderRadius: '9px',
  cursor: 'pointer',
  color: active ? '#fff' : '#475569',
  background: active ? color : 'transparent',
  font: 'inherit',
  fontSize: '0.84rem',
  fontWeight: 850,
  transition: 'all 0.18s ease'
});
