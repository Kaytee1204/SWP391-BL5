import React, { useState, useEffect, useCallback } from 'react';
import { vocabApi, deckApi } from '../../api';
import { Modal } from '../../components/Modal';
import { BookmarkPlus, Search, Folder, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import InlineErrorReport from '../../components/common/InlineErrorReport';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function StudentVocabularyView({ currentUser, onNavigate }) {
  const isStudent = currentUser?.role === 'Student';
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Save to Deck modal state
  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);
  const [selectedItemForDeck, setSelectedItemForDeck] = useState(null);
  const [myDecks, setMyDecks] = useState([]);
  const [targetDeckId, setTargetDeckId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cats = await vocabApi.getCategories(selectedLevel === 'ALL' ? null : selectedLevel);
      setCategories(cats || []);

      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await vocabApi.getItems(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải dữ liệu từ vựng: ' + err.message });
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedCategoryId, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [selectedLevel, selectedCategoryId]);

  const openAddToDeck = async (item) => {
    setSelectedItemForDeck(item);
    try {
      const decks = await deckApi.getMyVocabDecks();
      setMyDecks(decks || []);
      setTargetDeckId(decks[0]?.deckId ? String(decks[0].deckId) : '');
      setIsAddToDeckModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Không thể tải danh sách Decks: ' + err.message });
    }
  };

  const saveToDeck = async () => {
    if (!targetDeckId) return;
    try {
      await deckApi.addVocabItemToDeck(targetDeckId, selectedItemForDeck.itemId);
      setFeedback({ type: 'success', msg: `Đã thêm từ [${selectedItemForDeck.word}] vào bộ Flashcard của bạn!` });
      setIsAddToDeckModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lưu vào deck thất bại: ' + err.message });
    }
  };

  const getJlptStyle = (level) => {
    switch (level) {
      case 'N1': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'N2': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'N3': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'N4': return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
      default: return { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Top Banner & Filter Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📚</span>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Japanese Vocabulary Hub (語彙)
              </h3>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {items.length} Từ vựng
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.86rem' }}>
              Học từ vựng tiếng Nhật theo cấp độ JLPT và lưu vào bộ Flashcard cá nhân
            </p>
          </div>

          {isStudent && (
            <button
              onClick={() => onNavigate && onNavigate('vocab-decks')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '0.6rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
              }}
            >
              <BookmarkPlus size={16} /> Bộ Thẻ Của Tôi (My Decks)
            </button>
          )}
        </div>

        {/* Level Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
            Cấp độ:
          </span>
          {['ALL', ...JLPT_LEVELS].map((level) => {
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => { setSelectedLevel(level); setSelectedCategoryId(''); }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: isActive ? '#10b981' : '#e2e8f0',
                  background: isActive ? '#10b981' : '#f8fafc',
                  color: isActive ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {level === 'ALL' ? 'Tất cả' : level}
              </button>
            );
          })}
        </div>

        {/* Filter by Category & Search Keyword */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Category Selector */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Tất cả danh mục bài học ({categories.length}) --</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  [{c.jlptLevel}] {c.name} ({c.itemCount || (c.items ? c.items.length : 0)} từ)
                </option>
              ))}
            </select>
            <Folder size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} style={{ flex: 1.5, minWidth: '280px', display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                placeholder="Tìm từ vựng, kanji, nghĩa tiếng Việt, romaji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Tìm
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); fetchData(); }}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Feedback message */}
      {feedback.msg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: 600,
          background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : '#86efac'}`
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Vocabulary Cards Grid */}
      {loading ? (
        <div style={{ background: '#fff', padding: '3.5rem', textAlign: 'center', color: '#64748b', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          ⏳ Đang tải dữ liệu từ vựng tiếng Nhật...
        </div>
      ) : items.length === 0 ? (
        <div style={{
          background: '#fff',
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          color: '#64748b',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌸</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Không tìm thấy từ vựng nào phù hợp
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.4rem 0' }}>
            Hãy thử chọn cấp độ JLPT khác hoặc tìm kiếm từ khóa khác nhé!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {items.map((item) => {
            const jlptStyle = getJlptStyle(item.jlptLevel || 'N5');
            return (
              <div
                key={item.itemId}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Top: Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: jlptStyle.bg,
                    color: jlptStyle.text,
                    border: `1px solid ${jlptStyle.border}`
                  }}>
                    {item.jlptLevel || 'N5'}
                  </span>
                  
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    📂 {item.categoryName || 'Danh mục'}
                  </span>
                </div>

                {/* Main Word Display */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  marginBottom: '0.85rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      fontSize: item.kanji ? '1.8rem' : '2.1rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      fontFamily: '"Hiragino Kaku Gothic Pro", Meiryo, sans-serif'
                    }}>
                      {item.kanji || item.word}
                    </div>

                  </div>

                  {item.kanji && (
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d9488', marginTop: '2px' }}>
                      【{item.word}】
                    </div>
                  )}

                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                    <em>{item.reading}</em>
                  </div>
                </div>

                {/* Meaning */}
                <div style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#10b981',
                  textAlign: 'center',
                  marginBottom: '0.85rem'
                }}>
                  {item.meaning}
                </div>

                {/* Example sentence */}
                {item.exampleSentence && (
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#475569',
                    background: '#fff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.85rem',
                    lineHeight: 1.4,
                    flex: 1
                  }}>
                    <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>Ví dụ:</strong>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.exampleSentence}</div>
                    {item.exampleTranslation && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                        {item.exampleTranslation}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions: Report Error & Save to Deck */}
                {isStudent && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <InlineErrorReport 
                      targetType="VOCABULARY" 
                      targetId={item.itemId} 
                      title={`Từ vựng: ${item.word || item.kanji}`} 
                    />
                    <button
                      onClick={() => openAddToDeck(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.45rem 0.85rem',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        border: '1px solid #c7d2fe',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <BookmarkPlus size={14} /> Lưu vào Deck
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add to Deck */}
      <Modal
        isOpen={isAddToDeckModalOpen}
        onClose={() => setIsAddToDeckModalOpen(false)}
        title={`🔖 Lưu [${selectedItemForDeck?.word}] vào Bộ Flashcard`}
      >
        {myDecks.length === 0 ? (
          <p style={{ color: '#64748b', marginBottom: '16px' }}>
            Bạn chưa có bộ Flashcard Từ vựng nào. Hãy vào mục <strong>Decks Từ Vựng</strong> để tạo bộ thẻ trước nhé!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Chọn Bộ Flashcard Đích</label>
              <select
                className="form-select"
                value={targetDeckId}
                onChange={(e) => setTargetDeckId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                {myDecks.map((deck) => (
                  <option key={deck.deckId} value={deck.deckId}>
                    {deck.title} ({deck.totalItems} từ)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsAddToDeckModalOpen(false)}
            style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
          >
            Đóng
          </button>
          {myDecks.length > 0 && (
            <button
              onClick={saveToDeck}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <BookmarkPlus size={16} /> Lưu vào Deck
            </button>
          )}
        </div>
      </Modal>

    </div>
  );
}
