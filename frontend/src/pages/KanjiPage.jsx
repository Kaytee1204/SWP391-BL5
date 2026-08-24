import React, { useEffect, useState } from 'react';
import { kanjiApi, deckApi } from '../api';
import { Modal } from '../components/Modal';
import { BookmarkPlus, Edit2, Folder, Plus, Search, Trash2 } from 'lucide-react';
import KanjiFormModal from '../features/materials/components/KanjiFormModal';

export const KanjiPage = ({ currentUser, readOnly = false, onNavigate }) => {
  const role = currentUser?.role;
  const isStudent = role === 'Student';
  const canManageContent = !readOnly && (role === 'Lecturer' || role === 'Manager');

  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [modules, setModules] = useState([]);
  const [kanjiList, setKanjiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [isKanjiModalOpen, setIsKanjiModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState(null);

  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);
  const [selectedKanjiForDeck, setSelectedKanjiForDeck] = useState(null);
  const [myKanjiDecks, setMyKanjiDecks] = useState([]);
  const [targetDeckId, setTargetDeckId] = useState('');
  const [memorizationNote, setMemorizationNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedModuleId) params.moduleId = selectedModuleId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const [mods, kanji] = await Promise.all([
        kanjiApi.getModules(selectedLevel === 'ALL' ? null : selectedLevel),
        kanjiApi.getKanjiDetails(params),
      ]);
      setModules(Array.isArray(mods) ? mods : []);
      setKanjiList(Array.isArray(kanji) ? kanji : []);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to load Kanji data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLevel, selectedModuleId]);

  const openKanjiModal = (kanji = null) => {
    setEditingKanji(kanji);
    setIsKanjiModalOpen(true);
  };

  const handleSaveKanji = async (formData) => {
    try {
      if (editingKanji) {
        await kanjiApi.updateKanji(editingKanji.kanjiId, formData);
        setFeedback({ type: 'success', msg: 'Cập nhật chữ Kanji thành công!' });
      } else {
        await kanjiApi.createKanji(formData);
        setFeedback({ type: 'success', msg: 'Tạo chữ Kanji mới thành công!' });
      }
      fetchData();
    } catch (err) {
      if (err.status === 409) {
        setFeedback({ type: 'conflict', msg: 'This content was updated by another lecturer. Please refresh the page before editing it again.' });
      }
      throw err;
    }
  };

  const deleteKanji = async (id, char) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chữ Kanji "${char || ''}" này không?`)) return;
    try {
      await kanjiApi.deleteKanji(id);
      setFeedback({ type: 'success', msg: 'Đã xóa chữ Kanji thành công!' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Xóa thất bại: ' + err.message });
    }
  };

  const openAddToDeck = async (kanji) => {
    try {
      setSelectedKanjiForDeck(kanji);
      setMemorizationNote('');
      const decks = await deckApi.getMyKanjiDecks();
      setMyKanjiDecks(decks);
      setTargetDeckId(decks[0]?.deckId ? String(decks[0].deckId) : '');
      setIsAddToDeckModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Không thể tải danh sách Kanji deck: ' + err.message });
    }
  };

  const saveToDeck = async () => {
    if (!targetDeckId) return;
    try {
      await deckApi.addKanjiToDeck(targetDeckId, {
        kanjiId: selectedKanjiForDeck.kanjiId,
        memorizationNote: memorizationNote.trim() || null,
      });
      setFeedback({ type: 'success', msg: `Đã thêm chữ [${selectedKanjiForDeck.character}] vào bộ Flashcard của bạn!` });
      setIsAddToDeckModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Thêm vào deck thất bại: ' + err.message });
    }
  };

  const getJlptColor = (level) => {
    switch (level) {
      case 'N1': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'N2': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'N3': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'N4': return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
      default: return { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner / Controls */}
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
        
        {/* Header & Add Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🏮</span>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Kanji Dictionary & Card Details
              </h3>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {kanjiList.length} Kanji
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.86rem' }}>
              Tra cứu & quản lý chi tiết từng chữ Hán tự theo Module bài học và cấp độ JLPT
            </p>
          </div>

          {canManageContent && (
            <button
              onClick={() => openKanjiModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={18} /> Thêm Chữ Kanji Mới
            </button>
          )}
        </div>

        {/* Level Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
            Cấp độ:
          </span>
          {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => { setSelectedLevel(level); setSelectedModuleId(''); }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: isActive ? '#0284c7' : '#e2e8f0',
                  background: isActive ? '#0284c7' : '#f8fafc',
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

        {/* Filter by Module & Search Keyword */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Module Selector */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
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
              <option value="">-- Tất cả bài học / Modules ({modules.length}) --</option>
              {modules.map((module) => (
                <option key={module.moduleId} value={module.moduleId}>
                  [{module.jlptLevel}] {module.title} ({module.kanjiCount} chữ)
                </option>
              ))}
            </select>
            <Folder size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} style={{ flex: 1.5, minWidth: '280px', display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                placeholder="Tìm chữ Kanji, nghĩa tiếng Việt, Âm On (Onyomi), Âm Kun..."
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
          background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {feedback.msg}
          {feedback.type === 'conflict' && (
            <button type="button" onClick={fetchData} style={{ marginLeft: '12px' }}>Refresh</button>
          )}
        </div>
      )}

      {/* Kanji Cards Grid */}
      {loading ? (
        <div style={{ background: '#fff', padding: '3.5rem', textAlign: 'center', color: '#64748b', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          ⏳ Đang tải dữ liệu chữ Hán tự Kanji...
        </div>
      ) : kanjiList.length === 0 ? (
        <div style={{
          background: '#fff',
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          color: '#64748b',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏮</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Không tìm thấy chữ Kanji nào phù hợp
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.4rem 0 1rem' }}>
            Hãy thử chọn cấp độ JLPT khác hoặc thêm mới chữ Kanji đầu tiên cho module này.
          </p>
          {canManageContent && (
            <button
              onClick={() => openKanjiModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#fff',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Thêm Chữ Kanji Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {kanjiList.map((kanji) => {
            const jlptStyle = getJlptColor(kanji.jlptLevel || 'N5');
            return (
              <div
                key={kanji.kanjiId}
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
                {/* Card Top: Badges */}
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
                    {kanji.jlptLevel || 'N5'}
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
                    📂 {kanji.moduleTitle || 'Module'}
                  </span>
                </div>

                {/* Character Big Box */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '14px',
                  padding: '1rem',
                  textAlign: 'center',
                  marginBottom: '0.85rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '3.8rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',
                    color: '#0f172a'
                  }}>
                    {kanji.character}
                  </div>
                </div>

                {/* Meaning */}
                <div style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#0284c7',
                  textAlign: 'center',
                  marginBottom: '0.85rem'
                }}>
                  {kanji.meaning}
                </div>

                {/* Readings: On & Kun */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginBottom: '0.85rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#64748b', marginRight: '0.35rem' }}>Âm On:</span>
                    <strong style={{ color: '#0f172a' }}>{kanji.onyomi || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#64748b', marginRight: '0.35rem' }}>Âm Kun:</span>
                    <strong style={{ color: '#0f172a' }}>{kanji.kunyomi || '—'}</strong>
                  </div>
                </div>

                {/* Compound Words */}
                {kanji.compoundWords && (
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
                    <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>Từ ghép thông dụng:</strong>
                    {kanji.compoundWords}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  <div><strong>Added By:</strong> {kanji.createdBy || '—'}</div>
                  <div><strong>Last Updated:</strong> {kanji.updatedBy || '—'}{kanji.updatedAt ? ` · ${new Date(kanji.updatedAt).toLocaleString('vi-VN')}` : ''}</div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  marginTop: 'auto'
                }}>
                  {isStudent && (
                    <button
                      onClick={() => openAddToDeck(kanji)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.4rem 0.75rem',
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
                  )}

                  {canManageContent && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
                      <button
                        onClick={() => openKanjiModal(kanji)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.4rem 0.75rem',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Chỉnh sửa chữ Kanji"
                      >
                        <Edit2 size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => deleteKanji(kanji.kanjiId, kanji.character)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.4rem 0.75rem',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Xóa chữ Kanji"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modern Modal Add / Edit Kanji */}
      <KanjiFormModal
        isOpen={isKanjiModalOpen}
        kanji={editingKanji}
        modules={modules}
        defaultModuleId={selectedModuleId}
        onClose={() => setIsKanjiModalOpen(false)}
        onSave={handleSaveKanji}
      />

      {/* Modal Add to Deck */}
      <Modal
        isOpen={isAddToDeckModalOpen}
        onClose={() => setIsAddToDeckModalOpen(false)}
        title={`🔖 Lưu [${selectedKanjiForDeck?.character}] vào Bộ Flashcard`}
      >
        {myKanjiDecks.length === 0 ? (
          <p style={{ color: '#64748b', marginBottom: '16px' }}>
            Bạn chưa có bộ Flashcard Kanji nào. Hãy vào trang <strong>My Kanji Decks</strong> để tạo bộ thẻ trước nhé!
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
                {myKanjiDecks.map((deck) => (
                  <option key={deck.deckId} value={deck.deckId}>
                    {deck.title} ({deck.totalItems} kanji)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Ghi chú gợi nhớ cá nhân</label>
              <textarea
                className="form-textarea"
                maxLength={500}
                placeholder="VD: Chữ Nhật trông giống mặt trời buổi sáng..."
                rows={3}
                value={memorizationNote}
                onChange={(e) => setMemorizationNote(e.target.value)}
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0.6rem' }}
              />
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
          {myKanjiDecks.length > 0 && (
            <button
              onClick={saveToDeck}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                background: '#4f46e5',
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
};
