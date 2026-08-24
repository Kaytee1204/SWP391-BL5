import React, { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { PersonalKanjiDecksPage } from './PersonalKanjiDecksPage';
import { PersonalVocabDecksPage } from './PersonalVocabDecksPage';

export const PersonalDecksPage = ({ onNavigate }) => {
  // Component này chỉ điều phối loại deck; mỗi page con tự quản lý state và API riêng.
  const [deckType, setDeckType] = useState('vocabulary');

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Deck</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Quản lý các deck cá nhân và chọn loại nội dung muốn học.
          </p>
        </div>

        <div className="filter-group">
          <button
            className={`btn ${deckType === 'vocabulary' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDeckType('vocabulary')}
          >
            <BookOpen size={16} /> Vocabulary Deck
          </button>
          <button
            className={`btn ${deckType === 'kanji' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDeckType('kanji')}
          >
            <Sparkles size={16} /> Kanji Deck
          </button>
        </div>
      </div>

      {/* Chỉ mount page đang chọn để page còn lại không gọi API hoặc giữ state không cần thiết. */}
      {deckType === 'vocabulary' ? (
        <PersonalVocabDecksPage onNavigate={onNavigate} />
      ) : (
        <PersonalKanjiDecksPage onNavigate={onNavigate} />
      )}
    </div>
  );
};
