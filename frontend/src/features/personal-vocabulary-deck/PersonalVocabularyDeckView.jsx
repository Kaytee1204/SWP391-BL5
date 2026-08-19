import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';

const DUONG_DAN_API = '/personal-vocabulary-decks';

export default function PersonalVocabularyDeckView({ currentUser, onOpenAuth }) {
  const [danhSachDeck, setDanhSachDeck] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);

  // deckDangSua = null  -> modal đang ở chế độ TẠO MỚI
  // deckDangSua = {...} -> modal đang ở chế độ SỬA
  const [hienModal, setHienModal] = useState(false);
  const [deckDangSua, setDeckDangSua] = useState(null);

  // ---------- 1. XEM DANH SÁCH ----------
  const taiDanhSachDeck = async () => {
    if (!currentUser) return;
    setDangTai(true);
    setLoi(null);
    try {
      const res = await apiRequest(DUONG_DAN_API, 'GET');
      setDanhSachDeck(res.data || []);
    } catch (err) {
      // KHÔNG nuốt lỗi im lặng - phải hiện ra cho người dùng biết,
      // nếu không thì backend chết mà màn hình vẫn báo "0 bộ từ vựng".
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSachDeck();
  }, [currentUser]);

  // ---------- 4. XÓA ----------
  const xoaDeck = async (deck) => {
    if (!window.confirm(`Xóa bộ từ vựng "${deck.title}"?`)) return;
    try {
      await apiRequest(`${DUONG_DAN_API}/${deck.deckId}`, 'DELETE');
      taiDanhSachDeck();
    } catch (err) {
      alert(err.message);
    }
  };

  const moModalTao = () => {
    setDeckDangSua(null);
    setHienModal(true);
  };

  const moModalSua = (deck) => {
    setDeckDangSua(deck);
    setHienModal(true);
  };

  // ---------- Chưa đăng nhập hoặc không phải Student ----------
  if (!currentUser) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="content-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📚</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Đăng nhập để tạo bộ từ vựng riêng</h3>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Lưu lại các từ bạn muốn ôn tập và tự sắp xếp thành từng bộ.
          </p>
          <button className="btn-dash btn-dash-primary" onClick={() => onOpenAuth && onOpenAuth('login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'Student') {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="content-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔒</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Chỉ dành cho học viên</h3>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Bạn đang đăng nhập với vai trò <strong>{currentUser.role}</strong>.
            Tính năng bộ từ vựng cá nhân chỉ dành cho tài khoản Student.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Giao diện chính ----------
  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Banner tiêu đề */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: 'var(--radius-xl, 24px)',
        padding: '2.25rem 2rem',
        color: 'white'
      }}>
        <div style={{
          display: 'inline-block', padding: '0.3rem 0.9rem', borderRadius: '9999px',
          background: 'rgba(255,255,255,0.18)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem'
        }}>
          📚 Personal Vocabulary Deck
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Bộ từ vựng của tôi
        </h2>
        <p style={{ opacity: 0.92, fontSize: '0.92rem', lineHeight: 1.6 }}>
          Tự chọn từ trong kho từ vựng của hệ thống và gom thành bộ riêng để ôn tập.
        </p>
      </div>

      {/* Thanh tiêu đề danh sách + nút tạo */}
      <div className="content-card">
        <div className="card-header-row">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Danh sách bộ từ vựng</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Bạn đang có {danhSachDeck.length} bộ từ vựng
            </div>
          </div>
          <button className="btn-dash btn-dash-primary" onClick={moModalTao}>
            ➕ Tạo bộ từ vựng
          </button>
        </div>

        {loi && (
          <div style={{
            background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3',
            padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem'
          }}>
            ⚠️ {loi}
          </div>
        )}

        {dangTai ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Đang tải...
          </div>
        ) : danhSachDeck.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗂️</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Chưa có bộ từ vựng nào</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Tạo bộ đầu tiên để bắt đầu lưu từ vựng.
            </p>
            <button className="btn-dash btn-dash-primary" onClick={moModalTao}>
              ➕ Tạo bộ từ vựng
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.1rem'
          }}>
            {danhSachDeck.map(deck => (
              <TheDeck
                key={deck.deckId}
                deck={deck}
                onSua={() => moModalSua(deck)}
                onXoa={() => xoaDeck(deck)}
              />
            ))}
          </div>
        )}
      </div>

      {hienModal && (
        <ModalDeck
          deck={deckDangSua}
          onDong={() => setHienModal(false)}
          onLuuXong={() => { setHienModal(false); taiDanhSachDeck(); }}
        />
      )}
    </div>
  );
}

// ============================================================
// Thẻ hiển thị 1 bộ từ vựng
// ============================================================
function TheDeck({ deck, onSua, onXoa }) {
  return (
    <div style={{
      border: '1px solid var(--border-color, #eee)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      background: 'var(--bg-card, #fff)'
    }}>
      <div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{deck.title}</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-body)', minHeight: '2.2em' }}>
          {deck.description || 'Không có mô tả'}
        </div>
      </div>

      <div>
        <span style={{
          display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '9999px',
          fontSize: '0.73rem', fontWeight: 700, background: '#f5f3ff', color: '#7c3aed'
        }}>
          {deck.totalWords} từ
        </span>
      </div>

      {deck.words && deck.words.length > 0 && (
        <div>
          {deck.words.slice(0, 6).map(tu => (
            <span key={tu.itemId} title={tu.meaning} style={{
              display: 'inline-block', padding: '0.28rem 0.65rem', margin: '0.18rem 0.18rem 0 0',
              borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
              background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa'
            }}>
              {tu.kanji || tu.word}
            </span>
          ))}
          {deck.words.length > 6 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
              +{deck.words.length - 6} từ nữa
            </span>
          )}
        </div>
      )}

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Sửa lần cuối: {deck.updatedAt ? new Date(deck.updatedAt).toLocaleString('vi-VN') : '-'}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #eee)' }}>
        <button className="btn-action-edit" onClick={onSua}>✏️ Sửa</button>
        <button className="btn-action-delete" onClick={onXoa}>🗑️ Xóa</button>
      </div>
    </div>
  );
}

// ============================================================
// Modal tạo mới / sửa bộ từ vựng
// ============================================================
function ModalDeck({ deck, onDong, onLuuXong }) {
  const dangSua = Boolean(deck);

  const [tenBo, setTenBo] = useState(deck?.title || '');
  const [moTa, setMoTa] = useState(deck?.description || '');
  const [danhSachIdDaChon, setDanhSachIdDaChon] = useState(
    deck?.words ? deck.words.map(tu => tu.itemId) : []
  );

  const [toanBoTuVung, setToanBoTuVung] = useState([]);
  const [dangTaiTuVung, setDangTaiTuVung] = useState(true);
  const [tuKhoaTim, setTuKhoaTim] = useState('');

  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState(null);

  // Tải kho từ vựng để hiện danh sách checkbox
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest(`${DUONG_DAN_API}/tu-vung-co-the-chon`, 'GET');
        setToanBoTuVung(res.data || []);
      } catch (err) {
        setLoi(err.message);
      } finally {
        setDangTaiTuVung(false);
      }
    })();
  }, []);

  const bamChonTu = (itemId) => {
    setDanhSachIdDaChon(danhSachHienTai =>
      danhSachHienTai.includes(itemId)
        ? danhSachHienTai.filter(id => id !== itemId)
        : [...danhSachHienTai, itemId]
    );
  };

  // Lọc theo ô tìm kiếm: tìm được cả kanji, kana, romaji lẫn nghĩa tiếng Việt
  const tuKhoa = tuKhoaTim.trim().toLowerCase();
  const tuVungHienThi = !tuKhoa
    ? toanBoTuVung
    : toanBoTuVung.filter(tu =>
        (tu.word || '').toLowerCase().includes(tuKhoa) ||
        (tu.kanji || '').toLowerCase().includes(tuKhoa) ||
        (tu.reading || '').toLowerCase().includes(tuKhoa) ||
        (tu.meaning || '').toLowerCase().includes(tuKhoa)
      );

  const luuLai = async (e) => {
    e.preventDefault();
    setLoi(null);
    setDangLuu(true);

    // Không kiểm tra gì ở đây - để Backend chặn và báo lỗi về.
    const duLieuGui = {
      title: tenBo,
      description: moTa,
      vocabularyItemIds: danhSachIdDaChon
    };

    try {
      if (dangSua) {
        await apiRequest(`${DUONG_DAN_API}/${deck.deckId}`, 'PUT', duLieuGui);
      } else {
        await apiRequest(DUONG_DAN_API, 'POST', duLieuGui);
      }
      onLuuXong();
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onDong}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          {dangSua ? '✏️ Sửa bộ từ vựng' : '➕ Tạo bộ từ vựng mới'}
        </h4>

        {loi && (
          <div style={{
            background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3',
            padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem'
          }}>
            ⚠️ {loi}
          </div>
        )}

        <form onSubmit={luuLai} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Tên bộ từ vựng *</label>
            <input
              type="text"
              className="form-input"
              value={tenBo}
              onChange={e => setTenBo(e.target.value)}
              placeholder="VD: Từ vựng bài 1"
              maxLength={150}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mô tả</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={moTa}
              onChange={e => setMoTa(e.target.value)}
              placeholder="VD: Từ mới học hôm nay"
              maxLength={500}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Chọn từ vựng
              {danhSachIdDaChon.length > 0 && (
                <span style={{ color: '#7c3aed' }}> — đã chọn {danhSachIdDaChon.length} từ</span>
              )}
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ marginTop: 0 }}
                value={tuKhoaTim}
                onChange={e => setTuKhoaTim(e.target.value)}
                placeholder="Tìm: 食べる, taberu, ăn..."
              />
              {danhSachIdDaChon.length > 0 && (
                <button
                  type="button"
                  className="btn-dash btn-dash-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => setDanhSachIdDaChon([])}
                >
                  Bỏ chọn hết
                </button>
              )}
            </div>

            <div style={{
              border: '1px solid var(--border-color, #eee)',
              borderRadius: '12px',
              maxHeight: '240px',
              overflowY: 'auto',
              marginTop: '0.5rem'
            }}>
              {dangTaiTuVung ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Đang tải danh sách từ vựng...
                </div>
              ) : tuVungHienThi.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {toanBoTuVung.length === 0 ? 'Hệ thống chưa có từ vựng nào.' : 'Không tìm thấy từ nào khớp.'}
                </div>
              ) : (
                tuVungHienThi.map(tu => {
                  const daChon = danhSachIdDaChon.includes(tu.itemId);
                  return (
                    <label
                      key={tu.itemId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.85rem', cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color, #f0f0f0)',
                        background: daChon ? '#f5f3ff' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={daChon}
                        onChange={() => bamChonTu(tu.itemId)}
                        style={{ width: '17px', height: '17px', accentColor: '#7c3aed', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {tu.kanji || tu.word}
                          {tu.reading && (
                            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> ({tu.reading})</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.77rem', color: 'var(--text-body)' }}>{tu.meaning}</div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Tick vào từ muốn thêm. Không chọn từ nào cũng được — bộ rỗng vẫn lưu bình thường.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="button" className="btn-dash btn-dash-secondary" onClick={onDong} disabled={dangLuu}>
              Hủy
            </button>
            <button type="submit" className="btn-dash btn-dash-primary" disabled={dangLuu}>
              {dangLuu ? 'Đang lưu...' : '💾 Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
