import React, { useState } from 'react';
import { Modal } from './Modal';
import { ArrowLeft, ArrowRight, RotateCw, Volume2 } from 'lucide-react';

export const FlashcardModal = ({ isOpen, onClose, title, items = [], type = 'vocab' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!items || items.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          Deck này chưa có thẻ học nào. Hãy thêm từ vựng/Kanji vào deck để bắt đầu học!
        </div>
      </Modal>
    );
  }

  const currentItem = items[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    // Dùng modulo để đi tới cuối deck thì quay lại thẻ đầu tiên.
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    // Cộng items.length trước khi modulo để index không bị âm khi lùi từ thẻ đầu.
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const playSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} (${currentIndex + 1}/${items.length})`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handlePrev}>
            <ArrowLeft size={16} /> Trước
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Nhấp vào thẻ để lật mặt sau
          </span>
          <button className="btn btn-primary" onClick={handleNext}>
            Tiếp <ArrowRight size={16} />
          </button>
        </div>
      }
    >
      <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Mặt trước: hiển thị từ/Kanji cần nhớ. */}
          <div className="flashcard-front">
            {type === 'vocab' ? (
              <>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }} className="jp-font">
                  {currentItem.kanji || currentItem.word}
                </div>
                {currentItem.kanji && (
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '12px' }} className="jp-font">
                    {currentItem.reading}
                  </div>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSpeech(currentItem.word);
                  }}
                >
                  <Volume2 size={16} /> Nghe phát âm
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }} className="jp-font">
                  {currentItem.character}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Onyomi: {currentItem.onyomi || '—'}
                </div>
              </>
            )}
            <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCw size={12} /> Nhấn để xem nghĩa
            </div>
          </div>

          {/* Mặt sau: hiển thị nghĩa, ví dụ và ghi chú nhớ nếu có. */}
          <div className="flashcard-back">
            {type === 'vocab' ? (
              <>
                <div style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '12px' }}>
                  {currentItem.meaning}
                </div>
                {currentItem.exampleSentence && (
                  <div style={{ textAlign: 'left', background: 'white', padding: '12px', borderRadius: '8px', width: '100%', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }} className="jp-font">{currentItem.exampleSentence}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{currentItem.exampleTranslation}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {currentItem.meaning}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }} className="jp-font">
                  <strong>Kunyomi:</strong> {currentItem.kunyomi || '—'}
                </div>
                {currentItem.memorizationNote && (
                  <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', marginTop: '10px', width: '100%' }}>
                    <strong>Mẹo nhớ:</strong> {currentItem.memorizationNote}
                  </div>
                )}
                {currentItem.compoundWords && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }} className="jp-font">
                    {currentItem.compoundWords}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
