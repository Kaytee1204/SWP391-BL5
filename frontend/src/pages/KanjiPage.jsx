import React, { useEffect, useState } from 'react';
import { kanjiApi, deckApi } from '../api';
import { Modal } from '../components/Modal';
import { BookmarkPlus, Edit2, Folder, FolderPlus, Plus, Search, Trash2 } from 'lucide-react';

const emptyKanji = {
  moduleId: '',
  character: '',
  onyomi: '',
  kunyomi: '',
  meaning: '',
  compoundWords: '',
  strokeOrderUrl: '',
  isPreview: false,
};

export const KanjiPage = () => {
  const role = JSON.parse(localStorage.getItem('user_info') || 'null')?.role;
  const isStudent = role === 'Student';
  const canManageContent = ['Manager', 'Lecturer', 'Author'].includes(role);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [modules, setModules] = useState([]);
  const [kanjiList, setKanjiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ jlptLevel: 'N5', title: '', description: '' });
  const [isKanjiModalOpen, setIsKanjiModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState(null);
  const [kanjiForm, setKanjiForm] = useState(emptyKanji);

  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);
  const [selectedKanjiForDeck, setSelectedKanjiForDeck] = useState(null);
  const [myKanjiDecks, setMyKanjiDecks] = useState([]);
  const [targetDeckId, setTargetDeckId] = useState('');
  const [memorizationNote, setMemorizationNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const mods = await kanjiApi.getModules(selectedLevel === 'ALL' ? null : selectedLevel);
      setModules(mods);
      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedModuleId) params.moduleId = selectedModuleId;
      if (searchQuery) params.search = searchQuery;
      setKanjiList(await kanjiApi.getKanjiDetails(params));
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải dữ liệu Kanji: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLevel, selectedModuleId]);

  const openModuleModal = (module = null) => {
    setEditingModule(module);
    setModuleForm(module
      ? { jlptLevel: module.jlptLevel, title: module.title, description: module.description || '' }
      : { jlptLevel: selectedLevel === 'ALL' ? 'N5' : selectedLevel, title: '', description: '' });
    setIsModuleModalOpen(true);
  };

  const saveModule = async (event) => {
    event.preventDefault();
    try {
      if (editingModule) {
        await kanjiApi.updateModule(editingModule.moduleId, moduleForm);
        setFeedback({ type: 'success', msg: 'Cập nhật module Kanji thành công' });
      } else {
        await kanjiApi.createModule(moduleForm);
        setFeedback({ type: 'success', msg: 'Tạo module Kanji mới thành công' });
      }
      setIsModuleModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa Module này? Tất cả chữ Kanji trong module cũng sẽ bị xóa.')) return;
    await kanjiApi.deleteModule(moduleId);
    setFeedback({ type: 'success', msg: 'Đã xóa module Kanji' });
    setSelectedModuleId('');
    fetchData();
  };

  const openKanjiModal = (kanji = null) => {
    setEditingKanji(kanji);
    setKanjiForm(kanji
      ? { ...emptyKanji, ...kanji, moduleId: String(kanji.moduleId) }
      : { ...emptyKanji, moduleId: selectedModuleId || (modules[0]?.moduleId ? String(modules[0].moduleId) : '') });
    setIsKanjiModalOpen(true);
  };

  const saveKanji = async (event) => {
    event.preventDefault();
    try {
      if (editingKanji) {
        await kanjiApi.updateKanji(editingKanji.kanjiId, kanjiForm);
        setFeedback({ type: 'success', msg: 'Cập nhật Kanji thành công' });
      } else {
        await kanjiApi.createKanji(kanjiForm);
        setFeedback({ type: 'success', msg: 'Thêm Kanji mới thành công' });
      }
      setIsKanjiModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const deleteKanji = async (kanjiId) => {
    if (!window.confirm('Bạn có chắc muốn xóa chữ Kanji này?')) return;
    await kanjiApi.deleteKanji(kanjiId);
    setFeedback({ type: 'success', msg: 'Đã xóa chữ Kanji' });
    fetchData();
  };

  const openAddToDeck = async (kanji) => {
    setSelectedKanjiForDeck(kanji);
    setMemorizationNote('');
    const decks = await deckApi.getMyKanjiDecks();
    setMyKanjiDecks(decks);
    setTargetDeckId(decks[0]?.deckId ? String(decks[0].deckId) : '');
    setIsAddToDeckModalOpen(true);
  };

  const saveToDeck = async () => {
    if (!targetDeckId) return;
    await deckApi.addKanjiToDeck(targetDeckId, {
      kanjiId: selectedKanjiForDeck.kanjiId,
      memorizationNote: memorizationNote.trim() || undefined,
    });
    setFeedback({ type: 'success', msg: `Đã thêm chữ [${selectedKanjiForDeck.character}] vào deck!` });
    setIsAddToDeckModalOpen(false);
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Quản Lý Chữ Hán (Kanji CRUD)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tạo, sửa, xóa các Module bài học và chi tiết từng chữ Kanji
          </p>
        </div>
        <div className="filter-group">
          <div className="level-tabs">
            {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <button key={level} className={`level-tab-btn ${selectedLevel === level ? 'active' : ''}`} onClick={() => { setSelectedLevel(level); setSelectedModuleId(''); }}>
                {level}
              </button>
            ))}
          </div>
          {canManageContent && <button className="btn btn-secondary" onClick={() => openModuleModal()}><FolderPlus size={16} /> Thêm Module</button>}
          {canManageContent && <button className="btn btn-primary" onClick={() => openKanjiModal()}><Plus size={16} /> Thêm Kanji</button>}
        </div>
      </div>

      {feedback.msg && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', backgroundColor: feedback.type === 'error' ? '#fee2e2' : '#d1fae5', color: feedback.type === 'error' ? '#dc2626' : '#065f46' }}>{feedback.msg}</div>}

      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <Folder size={18} style={{ color: 'var(--text-muted)' }} />
            <select className="form-select" value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
              <option value="">-- Tất cả Module ({modules.length}) --</option>
              {modules.map((module) => <option key={module.moduleId} value={module.moduleId}>[{module.jlptLevel}] {module.title} ({module.kanjiCount} chữ)</option>)}
            </select>
            {selectedModuleId && canManageContent && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-secondary btn-sm" title="Sửa Module đã chọn" onClick={() => openModuleModal(modules.find((m) => String(m.moduleId) === selectedModuleId))}><Edit2 size={14} /></button>
                <button className="btn btn-danger btn-sm" title="Xóa Module đã chọn" onClick={() => deleteModule(Number(selectedModuleId))}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <input className="form-input" placeholder="Tìm theo chữ Hán, nghĩa Hán Việt, Onyomi, Kunyomi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="btn btn-secondary"><Search size={16} /></button>
          </form>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách chữ Hán...</div> : kanjiList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không tìm thấy chữ Hán nào phù hợp.</p>
          {canManageContent && <button className="btn btn-primary" onClick={() => openKanjiModal()} style={{ marginTop: '12px' }}><Plus size={16} /> Thêm chữ Hán đầu tiên</button>}
        </div>
      ) : (
        <div className="grid-kanji">
          {kanjiList.map((kanji) => (
            <div key={kanji.kanjiId} className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`badge-jlpt badge-${(kanji.jlptLevel || 'N5').toLowerCase()}`}>{kanji.jlptLevel || 'N5'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kanji.moduleTitle}</span>
              </div>
              <div style={{ margin: '8px 0' }}><span className="jp-font" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>{kanji.character}</span></div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>{kanji.meaning}</div>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', textAlign: 'left', marginBottom: '12px' }}>
                <div><strong>On:</strong> {kanji.onyomi || '-'}</div>
                <div style={{ marginTop: '2px' }}><strong>Kun:</strong> {kanji.kunyomi || '-'}</div>
              </div>
              {kanji.compoundWords && <div className="jp-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '12px', flex: 1 }}><strong>Từ ghép:</strong> {kanji.compoundWords}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: 'auto' }}>
                {isStudent && <button className="btn btn-secondary btn-sm" title="Lưu vào Deck Kanji" onClick={() => openAddToDeck(kanji)}><BookmarkPlus size={14} /> Lưu Deck</button>}
                {canManageContent && <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-secondary btn-sm" title="Sửa Kanji" onClick={() => openKanjiModal(kanji)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" title="Xóa Kanji" onClick={() => deleteKanji(kanji.kanjiId)}><Trash2 size={14} /></button>
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} title={editingModule ? 'Chỉnh sửa Module Kanji' : 'Tạo Module Kanji mới'}>
        <form onSubmit={saveModule}>
          <div className="form-group"><label className="form-label">Cấp độ JLPT</label><select className="form-select" value={moduleForm.jlptLevel} onChange={(e) => setModuleForm({ ...moduleForm, jlptLevel: e.target.value })}>{['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => <option key={level} value={level}>{level}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Tiêu đề Module</label><input className="form-input" required placeholder="VD: Bài 1: Chữ Hán cơ bản & Số đếm" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Mô tả Module</label><textarea className="form-textarea" placeholder="Mô tả nội dung bài học..." value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><button type="button" className="btn btn-secondary" onClick={() => setIsModuleModalOpen(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editingModule ? 'Lưu cập nhật' : 'Tạo Module'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isKanjiModalOpen} onClose={() => setIsKanjiModalOpen(false)} title={editingKanji ? 'Chỉnh sửa chữ Hán' : 'Thêm chữ Hán mới'}>
        <form onSubmit={saveKanji}>
          <div className="form-group"><label className="form-label">Thuộc Module</label><select className="form-select" required value={kanjiForm.moduleId} onChange={(e) => setKanjiForm({ ...kanjiForm, moduleId: e.target.value })}><option value="">-- Chọn Module Kanji --</option>{modules.map((m) => <option key={m.moduleId} value={m.moduleId}>[{m.jlptLevel}] {m.title}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}><div className="form-group"><label className="form-label">Chữ Hán (Kanji)</label><input className="form-input" required maxLength={5} placeholder="VD: 日" value={kanjiForm.character} onChange={(e) => setKanjiForm({ ...kanjiForm, character: e.target.value })} /></div><div className="form-group"><label className="form-label">Nghĩa Hán Việt & Thuần Việt</label><input className="form-input" required placeholder="VD: Nhật (Mặt trời, ngày)" value={kanjiForm.meaning} onChange={(e) => setKanjiForm({ ...kanjiForm, meaning: e.target.value })} /></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div className="form-group"><label className="form-label">Âm On (Katakana)</label><input className="form-input" placeholder="VD: ニチ, ジツ" value={kanjiForm.onyomi} onChange={(e) => setKanjiForm({ ...kanjiForm, onyomi: e.target.value })} /></div><div className="form-group"><label className="form-label">Âm Kun (Hiragana)</label><input className="form-input" placeholder="VD: ひ, -び, -か" value={kanjiForm.kunyomi} onChange={(e) => setKanjiForm({ ...kanjiForm, kunyomi: e.target.value })} /></div></div>
          <div className="form-group"><label className="form-label">Từ ghép thông dụng</label><textarea className="form-textarea" placeholder="VD: 日本 (Nihon - Nhật Bản), 日曜日 (Nichiyoubi - Chủ nhật)" value={kanjiForm.compoundWords} onChange={(e) => setKanjiForm({ ...kanjiForm, compoundWords: e.target.value })} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><button type="button" className="btn btn-secondary" onClick={() => setIsKanjiModalOpen(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editingKanji ? 'Lưu cập nhật' : 'Thêm chữ Hán'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isAddToDeckModalOpen} onClose={() => setIsAddToDeckModalOpen(false)} title={`Lưu chữ [${selectedKanjiForDeck?.character}] vào Deck`}>
        {myKanjiDecks.length === 0 ? <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Chưa có deck Kanji nào. Hãy vào mục <strong>Decks Kanji</strong> để tạo deck trước nhé!</p> : <>
          <div className="form-group"><label className="form-label">Chọn Deck Kanji</label><select className="form-select" value={targetDeckId} onChange={(e) => setTargetDeckId(e.target.value)}>{myKanjiDecks.map((deck) => <option key={deck.deckId} value={deck.deckId}>{deck.title} ({deck.totalItems} chữ)</option>)}</select></div>
          <div className="form-group"><label className="form-label">Ghi chú nhớ cá nhân (Memorization note)</label><textarea className="form-textarea" placeholder="VD: Chữ này giống hình mặt trời có vạch ngang ở giữa..." value={memorizationNote} onChange={(e) => setMemorizationNote(e.target.value)} /></div>
        </>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}><button className="btn btn-secondary" onClick={() => setIsAddToDeckModalOpen(false)}>Hủy</button>{myKanjiDecks.length > 0 && <button className="btn btn-primary" onClick={saveToDeck}><BookmarkPlus size={16} /> Lưu vào Deck</button>}</div>
      </Modal>
    </div>
  );
};
