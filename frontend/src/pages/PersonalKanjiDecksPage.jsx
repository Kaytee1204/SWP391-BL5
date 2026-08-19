import React, { useEffect, useState } from 'react';
import { deckApi } from '../api';
import { Modal } from '../components/Modal';
import { FlashcardModal } from '../components/FlashcardModal';
import { ArrowLeft, BookOpen, Edit2, MessageSquare, Play, Plus, Sparkles, Trash2 } from 'lucide-react';

export const PersonalKanjiDecksPage = ({ onNavigate }) => {
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckForm, setDeckForm] = useState({ title: '', description: '' });

  const [editingNoteItem, setEditingNoteItem] = useState(null);
  const [noteForm, setNoteForm] = useState('');
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      setDecks(await deckApi.getMyKanjiDecks());
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải decks Kanji: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const openDeckDetail = async (deckId) => {
    try {
      setActiveDeck(await deckApi.getKanjiDeckById(deckId));
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải chi tiết deck Kanji: ' + err.message });
    }
  };

  const openDeckModal = (deck = null) => {
    setEditingDeck(deck);
    setDeckForm(deck ? { title: deck.title, description: deck.description || '' } : { title: '', description: '' });
    setIsDeckModalOpen(true);
  };

  const saveDeck = async (event) => {
    event.preventDefault();
    try {
      if (editingDeck) {
        await deckApi.updateKanjiDeck(editingDeck.deckId, deckForm);
        setFeedback({ type: 'success', msg: 'Cập nhật deck thành công' });
      } else {
        await deckApi.createKanjiDeck(deckForm);
        setFeedback({ type: 'success', msg: 'Tạo deck mới thành công' });
      }
      setIsDeckModalOpen(false);
      await fetchDecks();
      if (activeDeck && editingDeck && activeDeck.deckId === editingDeck.deckId) {
        await openDeckDetail(activeDeck.deckId);
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const deleteDeck = async (deckId) => {
    if (!window.confirm('Bạn có chắc muốn xóa Deck Kanji này không?')) return;
    try {
      await deckApi.deleteKanjiDeck(deckId);
      setFeedback({ type: 'success', msg: 'Đã xóa deck Kanji' });
      if (activeDeck?.deckId === deckId) setActiveDeck(null);
      fetchDecks();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const removeKanji = async (kanjiId) => {
    if (!activeDeck) return;
    try {
      await deckApi.removeKanjiFromDeck(activeDeck.deckId, kanjiId);
      setFeedback({ type: 'success', msg: 'Đã bỏ chữ Kanji khỏi deck' });
      await openDeckDetail(activeDeck.deckId);
      fetchDecks();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const openEditNote = (item) => {
    setEditingNoteItem(item);
    setNoteForm(item.memorizationNote || '');
  };

  const saveNote = async (event) => {
    event.preventDefault();
    try {
      await deckApi.updateKanjiNote(activeDeck.deckId, editingNoteItem.kanjiId, {
        memorizationNote: noteForm.trim(),
      });
      setFeedback({ type: 'success', msg: 'Đã cập nhật mẹo nhớ chữ Hán' });
      setEditingNoteItem(null);
      await openDeckDetail(activeDeck.deckId);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  return (
    <div>
      {feedback.msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', backgroundColor: feedback.type === 'error' ? '#fee2e2' : '#d1fae5', color: feedback.type === 'error' ? '#dc2626' : '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback({ type: '', msg: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
        </div>
      )}

      {activeDeck ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setActiveDeck(null)}>
                <ArrowLeft size={16} /> Quay lại danh sách
              </button>
              <div>
                <h2>{activeDeck.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activeDeck.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => setIsFlashcardOpen(true)} disabled={!activeDeck.items || activeDeck.items.length === 0}>
                <Play size={16} /> Luyện Flashcard ({activeDeck.items?.length || 0})
              </button>
              <button className="btn btn-secondary" onClick={() => openDeckModal(activeDeck)}><Edit2 size={16} /></button>
              <button className="btn btn-danger" onClick={() => deleteDeck(activeDeck.deckId)}><Trash2 size={16} /></button>
            </div>
          </div>

          {!activeDeck.items || activeDeck.items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Deck này hiện chưa có chữ Hán nào.</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                Hãy chuyển sang tab <strong>Kanji</strong> và chọn <em>"Lưu Deck"</em> để thêm chữ Hán kèm ghi chú nhớ nhé!
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('kanji')}>Khám phá Kanji ngay</button>
            </div>
          ) : (
            <div className="grid-cards">
              {activeDeck.items.map((item) => (
                <div key={item.kanjiId} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`badge-jlpt badge-${item.jlptLevel ? item.jlptLevel.toLowerCase() : 'n5'}`}>{item.jlptLevel || 'N5'}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeKanji(item.kanjiId)} title="Xóa khỏi Deck"><Trash2 size={14} /></button>
                  </div>
                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--text-main)' }} className="jp-font">{item.character}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{item.meaning}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-alt)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '10px' }}>
                    <div><strong>On:</strong> {item.onyomi || '-'}</div>
                    <div style={{ marginTop: '2px' }}><strong>Kun:</strong> {item.kunyomi || '-'}</div>
                  </div>
                  <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '12px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><MessageSquare size={13} /> Mẹo nhớ:</div>
                      <div>{item.memorizationNote || 'Chưa có ghi chú nhớ'}</div>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer' }} onClick={() => openEditNote(item)} title="Sửa mẹo nhớ">
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <FlashcardModal isOpen={isFlashcardOpen} onClose={() => setIsFlashcardOpen(false)} title={`Luyện tập Kanji: ${activeDeck.title}`} items={activeDeck.items || []} type="kanji" />

          {editingNoteItem && (
            <Modal isOpen={!!editingNoteItem} onClose={() => setEditingNoteItem(null)} title={`Sửa mẹo nhớ cho chữ [${editingNoteItem.character}]`}>
              <form onSubmit={saveNote}>
                <div className="form-group">
                  <label className="form-label">Ghi chú phương pháp nhớ (Chiết tự / Câu chuyện)</label>
                  <textarea className="form-textarea" required placeholder="VD: Cây (Mộc) thêm 1 nét ngang ở gốc là Bản/Gốc rễ..." value={noteForm} onChange={(e) => setNoteForm(e.target.value)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingNoteItem(null)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu mẹo nhớ</button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      ) : (
        <div>
          <div className="filter-bar">
            <div>
              <h2>Quản Lý Decks Chữ Hán (Kanji Decks)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Tạo, chỉnh sửa bộ sưu tập chữ Hán kèm ghi chú nhớ và luyện tập Flashcard
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => openDeckModal()}><Plus size={16} /> Tạo Deck mới</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải danh sách Deck Kanji...</div>
          ) : decks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Chưa có Deck Kanji nào.</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Tạo một Deck để lưu lại những chữ Hán hay nhầm lẫn kèm phương pháp chiết tự!
              </p>
              <button className="btn btn-primary" onClick={() => openDeckModal()}><Plus size={16} /> Tạo Deck đầu tiên</button>
            </div>
          ) : (
            <div className="grid-cards">
              {decks.map((deck) => (
                <div key={deck.deckId} className="card" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => openDeckDetail(deck.deckId)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{deck.title}</h3>
                    <span className="badge-jlpt badge-n5" style={{ fontSize: '0.75rem' }}>{deck.totalItems} chữ Hán</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', flex: 1 }}>{deck.description || 'Chưa có mô tả cho deck này'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-primary btn-sm" onClick={() => openDeckDetail(deck.deckId)}><Play size={14} /> Mở học</button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDeckModal(deck)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteDeck(deck.deckId)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isDeckModalOpen} onClose={() => setIsDeckModalOpen(false)} title={editingDeck ? 'Chỉnh sửa Deck Kanji' : 'Tạo Deck Kanji mới'}>
        <form onSubmit={saveDeck}>
          <div className="form-group">
            <label className="form-label">Tên Deck</label>
            <input type="text" className="form-input" required placeholder="VD: Kanji N5 hay nhầm, 50 chữ Hán thường gặp..." value={deckForm.title} onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả (tùy chọn)</label>
            <textarea className="form-textarea" placeholder="Mô tả mục tiêu học của deck..." value={deckForm.description} onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDeckModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">{editingDeck ? 'Lưu cập nhật' : 'Tạo Deck'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
