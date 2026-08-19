import React, { useState, useEffect } from 'react';
import { deckApi } from '../api';
import { Modal } from '../components/Modal';
import { FlashcardModal } from '../components/FlashcardModal';
import {
  Layers,
  Plus,
  Play,
  Edit2,
  Trash2,
  Volume2,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

export const PersonalVocabDecksPage = ({ onNavigate }) => {
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null); // Deck đầy đủ kèm items, chỉ load khi mở chi tiết.
  const [loading, setLoading] = useState(true);

  // Modal tạo/sửa deck.
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckForm, setDeckForm] = useState({ title: '', description: '' });

  // Modal luyện flashcard.
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const data = await deckApi.getMyVocabDecks();
      setDecks(data);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải decks từ vựng: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleOpenDeckDetail = async (deckId) => {
    try {
      const fullDeck = await deckApi.getVocabDeckById(deckId);
      setActiveDeck(fullDeck);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải chi tiết deck: ' + err.message });
    }
  };

  const handleOpenDeckModal = (deck = null) => {
    if (deck) {
      setEditingDeck(deck);
      setDeckForm({ title: deck.title, description: deck.description || '' });
    } else {
      setEditingDeck(null);
      setDeckForm({ title: '', description: '' });
    }
    setIsDeckModalOpen(true);
  };

  const handleSaveDeck = async (e) => {
    e.preventDefault();
    try {
      if (editingDeck) {
        await deckApi.updateVocabDeck(editingDeck.deckId, deckForm);
        setFeedback({ type: 'success', msg: 'Cập nhật deck thành công' });
      } else {
        await deckApi.createVocabDeck(deckForm);
        setFeedback({ type: 'success', msg: 'Tạo deck mới thành công' });
      }
      setIsDeckModalOpen(false);
      fetchDecks();
      // Nếu đang xem chi tiết chính deck vừa sửa thì reload để tiêu đề/mô tả cập nhật ngay.
      if (activeDeck && editingDeck && activeDeck.deckId === editingDeck.deckId) {
        handleOpenDeckDetail(activeDeck.deckId);
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Bạn có chắc muốn xóa Deck này không?')) return;
    try {
      await deckApi.deleteVocabDeck(deckId);
      setFeedback({ type: 'success', msg: 'Đã xóa deck' });
      if (activeDeck?.deckId === deckId) setActiveDeck(null);
      fetchDecks();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!activeDeck) return;
    try {
      await deckApi.removeVocabItemFromDeck(activeDeck.deckId, itemId);
      setFeedback({ type: 'success', msg: 'Đã bỏ từ vựng khỏi deck' });
      handleOpenDeckDetail(activeDeck.deckId);
      fetchDecks();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const playSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      {/* Thông báo thao tác thành công/lỗi */}
      {feedback.msg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            backgroundColor: feedback.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: feedback.type === 'error' ? '#dc2626' : '#065f46',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback({ type: '', msg: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* View chi tiết deck: chỉ hiện khi người dùng đã chọn một deck. */}
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
              <button
                className="btn btn-primary"
                onClick={() => setIsFlashcardOpen(true)}
                disabled={!activeDeck.items || activeDeck.items.length === 0}
              >
                <Play size={16} /> Luyện Flashcard ({activeDeck.items?.length || 0})
              </button>
              <button className="btn btn-secondary" onClick={() => handleOpenDeckModal(activeDeck)}>
                <Edit2 size={16} />
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteDeck(activeDeck.deckId)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Danh sách từ trong deck đang mở */}
          {!activeDeck.items || activeDeck.items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Deck này hiện chưa có từ vựng nào.</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                Hãy chuyển sang tab <strong>Từ vựng</strong> và chọn nút <em>"Lưu Deck"</em> để thêm từ vào đây nhé!
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('vocab')}>
                Khám phá Từ vựng ngay
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Từ vựng</th>
                    <th>Kanji</th>
                    <th>Cách đọc</th>
                    <th>Nghĩa tiếng Việt</th>
                    <th>Cấp độ</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDeck.items.map((item) => (
                    <tr key={item.itemId}>
                      <td style={{ fontSize: '1.1rem', fontWeight: '700' }} className="jp-font">
                        {item.word}
                      </td>
                      <td style={{ fontSize: '1.1rem' }} className="jp-font">
                        {item.kanji || '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.reading}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.meaning}</td>
                      <td>
                        <span className={`badge-jlpt badge-${item.jlptLevel ? item.jlptLevel.toLowerCase() : 'n5'}`}>
                          {item.jlptLevel || 'N5'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => playSpeech(item.word)}
                            title="Phát âm"
                          >
                            <Volume2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveItem(item.itemId)}
                            title="Xóa khỏi Deck"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal luyện flashcard cho deck đang mở */}
          <FlashcardModal
            isOpen={isFlashcardOpen}
            onClose={() => setIsFlashcardOpen(false)}
            title={`Luyện tập: ${activeDeck.title}`}
            items={activeDeck.items || []}
            type="vocab"
          />
        </div>
      ) : (
        /* View danh sách toàn bộ deck từ vựng */
        <div>
          <div className="filter-bar">
            <div>
              <h2>Quản Lý Decks Từ Vựng (Vocabulary Decks)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Tạo, chỉnh sửa bộ sưu tập từ vựng cá nhân và luyện tập Flashcard
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenDeckModal()}>
              <Plus size={16} /> Tạo Deck mới
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Đang tải danh sách Deck...
            </div>
          ) : decks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Layers size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Chưa có Deck từ vựng nào.</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Tạo một Deck để gom nhóm các từ khó nhớ và luyện tập mỗi ngày!
              </p>
              <button className="btn btn-primary" onClick={() => handleOpenDeckModal()}>
                <Plus size={16} /> Tạo Deck đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid-cards">
              {decks.map((d) => (
                <div
                  key={d.deckId}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => handleOpenDeckDetail(d.deckId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{d.title}</h3>
                    <span className="badge-jlpt badge-n5" style={{ fontSize: '0.75rem' }}>
                      {d.totalItems} từ
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', flex: '1' }}>
                    {d.description || 'Chưa có mô tả cho deck này'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '12px',
                      marginTop: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenDeckDetail(d.deckId)}>
                      <Play size={14} /> Mở học
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenDeckModal(d)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDeck(d.deckId)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal tạo/sửa deck từ vựng */}
      <Modal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        title={editingDeck ? 'Chỉnh sửa Deck từ vựng' : 'Tạo Deck từ vựng mới'}
      >
        <form onSubmit={handleSaveDeck}>
          <div className="form-group">
            <label className="form-label">Tên Deck</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="VD: Từ vựng N5 bài 1-5, Động từ hay quên..."
              value={deckForm.title}
              onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả (tùy chọn)</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả mục tiêu của deck này..."
              value={deckForm.description}
              onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDeckModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">
              {editingDeck ? 'Lưu cập nhật' : 'Tạo Deck'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
