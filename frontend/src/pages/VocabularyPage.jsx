import React, { useEffect, useState } from 'react';
import { vocabApi, deckApi } from '../api';
import { Modal } from '../components/Modal';
import { BookmarkPlus, Edit2, Folder, FolderPlus, Plus, Search, Trash2 } from 'lucide-react';

// Giá trị mặc định dùng chung khi mở form tạo mới hoặc chuẩn hóa dữ liệu lúc chỉnh sửa.
const emptyItem = {
  categoryId: '',
  word: '',
  kanji: '',
  reading: '',
  meaning: '',
  exampleSentence: '',
  exampleTranslation: '',
};

export const VocabularyPage = ({ currentUser }) => {
  // Phân quyền UI chỉ để ẩn nút không phù hợp; backend vẫn là nơi bắt buộc kiểm tra quyền thật sự.
  const role = currentUser?.role;
  const isStudent = role === 'Student';
  const canManageCategories = Boolean(currentUser);
  const canManageVocabulary = role === 'Lecturer' || role === 'Manager';
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ jlptLevel: 'N5', name: '', description: '' });
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);
  const [selectedItemForDeck, setSelectedItemForDeck] = useState(null);
  const [myDecks, setMyDecks] = useState([]);
  const [targetDeckId, setTargetDeckId] = useState('');

  const fetchData = async () => {
    // Luồng dữ liệu: state bộ lọc -> query params -> API -> cập nhật state -> React render lại.
    setLoading(true);
    try {
      const cats = await vocabApi.getCategories(selectedLevel === 'ALL' ? null : selectedLevel);
      setCategories(cats);
      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchQuery) params.search = searchQuery;
      // Chỉ gửi key có giá trị để backend phân biệt "không lọc" với một filter cụ thể.
      setItems(await vocabApi.getItems(params));
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi tải dữ liệu từ vựng: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đổi JLPT/category tự tải lại; search chỉ chạy khi submit để không gọi API sau mỗi phím gõ.
    fetchData();
  }, [selectedLevel, selectedCategoryId]);

  const openCategoryModal = (category = null) => {
    // Cùng một modal phục vụ create/update; editingCategory khác null là tín hiệu gọi API update.
    setEditingCategory(category);
    setCategoryForm(category
      ? { jlptLevel: category.jlptLevel, name: category.name, description: category.description || '' }
      : { jlptLevel: selectedLevel === 'ALL' ? 'N5' : selectedLevel, name: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    try {
      if (editingCategory) {
        await vocabApi.updateCategory(editingCategory.categoryId, categoryForm);
        setFeedback({ type: 'success', msg: 'Cập nhật danh mục thành công' });
      } else {
        await vocabApi.createCategory(categoryForm);
        setFeedback({ type: 'success', msg: 'Tạo danh mục mới thành công' });
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedback({
        type: err.status === 409 ? 'conflict' : 'error',
        msg: err.status === 409
          ? 'This content was updated by another lecturer. Please refresh the page before editing it again.'
          : err.message
      });
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này? Tất cả từ vựng trong danh mục cũng sẽ bị xóa.')) return;
    await vocabApi.deleteCategory(categoryId);
    setFeedback({ type: 'success', msg: 'Đã xóa danh mục' });
    setSelectedCategoryId('');
    fetchData();
  };

  const openItemModal = (item = null) => {
    // Value của select là chuỗi, nên đổi categoryId sang String để khớp chính xác option.
    setEditingItem(item);
    setItemForm(item
      ? { ...emptyItem, ...item, categoryId: String(item.categoryId) }
      : { ...emptyItem, categoryId: selectedCategoryId || (categories[0]?.categoryId ? String(categories[0].categoryId) : '') });
    setIsItemModalOpen(true);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      if (editingItem) {
        await vocabApi.updateItem(editingItem.itemId, itemForm);
        setFeedback({ type: 'success', msg: 'Cập nhật từ vựng thành công' });
      } else {
        await vocabApi.createItem(itemForm);
        setFeedback({ type: 'success', msg: 'Thêm từ vựng mới thành công' });
      }
      setIsItemModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa từ vựng này?')) return;
    await vocabApi.deleteItem(itemId);
    setFeedback({ type: 'success', msg: 'Đã xóa từ vựng' });
    fetchData();
  };

  const openAddToDeck = async (item) => {
    // Chỉ khi Student bấm lưu mới tải deck cá nhân, tránh gọi API deck khi chỉ xem trang.
    setSelectedItemForDeck(item);
    const decks = await deckApi.getMyVocabDecks();
    setMyDecks(decks);
    setTargetDeckId(decks[0]?.deckId ? String(decks[0].deckId) : '');
    setIsAddToDeckModalOpen(true);
  };

  const saveToDeck = async () => {
    // Ghép từ đang chọn với deck đích; backend tiếp tục kiểm tra deck có đúng owner hay không.
    if (!targetDeckId) return;
    await deckApi.addVocabItemToDeck(targetDeckId, selectedItemForDeck.itemId);
    setFeedback({ type: 'success', msg: `Đã thêm "${selectedItemForDeck.word}" vào deck!` });
    setIsAddToDeckModalOpen(false);
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Quản Lý Từ Vựng (Vocabulary CRUD)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tạo, sửa, xóa và quản lý kho từ vựng tiếng Nhật theo cấp độ JLPT
          </p>
        </div>
        <div className="filter-group">
          <div className="level-tabs">
            {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <button key={level} className={`level-tab-btn ${selectedLevel === level ? 'active' : ''}`} onClick={() => { setSelectedLevel(level); setSelectedCategoryId(''); }}>
                {level}
              </button>
            ))}
          </div>
          {canManageCategories && <button className="btn btn-secondary" onClick={() => openCategoryModal()}><FolderPlus size={16} /> Thêm danh mục</button>}
          {canManageVocabulary && <button className="btn btn-primary" onClick={() => openItemModal()}><Plus size={16} /> Thêm từ mới</button>}
        </div>
      </div>

      {feedback.msg && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', backgroundColor: feedback.type === 'success' ? '#d1fae5' : '#fee2e2', color: feedback.type === 'success' ? '#065f46' : '#dc2626' }}>{feedback.msg}{feedback.type === 'conflict' && <button type="button" onClick={fetchData} style={{ marginLeft: '12px' }}>Refresh</button>}</div>}

      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <Folder size={18} style={{ color: 'var(--text-muted)' }} />
            <select className="form-select" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
              <option value="">-- Tất cả danh mục ({categories.length}) --</option>
              {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>[{category.jlptLevel}] {category.name} ({category.itemCount} từ)</option>)}
            </select>
            {selectedCategoryId && canManageCategories && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-secondary btn-sm" title="Sửa danh mục đã chọn" onClick={() => openCategoryModal(categories.find((c) => String(c.categoryId) === selectedCategoryId))}><Edit2 size={14} /></button>
                <button className="btn btn-danger btn-sm" title="Xóa danh mục đã chọn" onClick={() => deleteCategory(Number(selectedCategoryId))}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <input className="form-input" placeholder="Tìm kiếm theo từ, kanji, nghĩa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="btn btn-secondary"><Search size={16} /></button>
          </form>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách từ vựng...</div> : (
        <div className="grid-cards">
          {items.map((item) => (
            <div key={item.itemId} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className={`badge-jlpt badge-${(item.jlptLevel || 'N5').toLowerCase()}`}>{item.jlptLevel || 'N5'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{item.categoryName}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span className="jp-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{item.kanji || item.word}</span>
                {item.kanji && <span className="jp-font" style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>【{item.word}】</span>}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Romaji/Reading: <em>{item.reading}</em></div>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>{item.meaning}</div>
              {item.exampleSentence && <div style={{ background: 'var(--bg-surface-alt)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', flex: 1 }}><div className="jp-font">{item.exampleSentence}</div><div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{item.exampleTranslation}</div></div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                <div><strong>Added By:</strong> {item.createdBy || '—'}</div>
                <div><strong>Last Updated:</strong> {item.updatedBy || '—'}{item.updatedAt ? ` · ${new Date(item.updatedAt).toLocaleString('vi-VN')}` : ''}</div>
              </div>
              {/* Nhóm thao tác thay đổi theo vai trò; vocabulary không còn chức năng phát âm. */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {isStudent && <button className="btn btn-secondary btn-sm" title="Lưu vào Deck" onClick={() => openAddToDeck(item)}><BookmarkPlus size={15} /> Lưu Deck</button>}
                  {canManageVocabulary && <button className="btn btn-secondary btn-sm" title="Sửa từ vựng" onClick={() => openItemModal(item)}><Edit2 size={15} /></button>}
                  {canManageVocabulary && <button className="btn btn-danger btn-sm" title="Xóa từ vựng" onClick={() => deleteItem(item.itemId)}><Trash2 size={15} /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? 'Chỉnh sửa danh mục từ vựng' : 'Tạo danh mục từ vựng mới'}>
        <form onSubmit={saveCategory}>
          <div className="form-group"><label className="form-label">Cấp độ JLPT</label><select className="form-select" value={categoryForm.jlptLevel} onChange={(e) => setCategoryForm({ ...categoryForm, jlptLevel: e.target.value })}>{['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => <option key={level} value={level}>{level}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Tên danh mục</label><input className="form-input" required placeholder="VD: Chào hỏi, Mua sắm, Động từ..." value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Mô tả</label><textarea className="form-textarea" placeholder="Mô tả nội dung của danh mục..." value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editingCategory ? 'Lưu cập nhật' : 'Tạo danh mục'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}>
        <form onSubmit={saveItem}>
          <div className="form-group"><label className="form-label">Thuộc danh mục</label><select className="form-select" required value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}><option value="">-- Chọn danh mục --</option>{categories.map((c) => <option key={c.categoryId} value={c.categoryId}>[{c.jlptLevel}] {c.name}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div className="form-group"><label className="form-label">Từ (Hiragana/Katakana)</label><input className="form-input" required placeholder="VD: たべる, こんにちは" value={itemForm.word} onChange={(e) => setItemForm({ ...itemForm, word: e.target.value })} /></div><div className="form-group"><label className="form-label">Kanji (nếu có)</label><input className="form-input" placeholder="VD: 食べる" value={itemForm.kanji} onChange={(e) => setItemForm({ ...itemForm, kanji: e.target.value })} /></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div className="form-group"><label className="form-label">Cách đọc (Romaji / Reading)</label><input className="form-input" required placeholder="VD: taberu" value={itemForm.reading} onChange={(e) => setItemForm({ ...itemForm, reading: e.target.value })} /></div><div className="form-group"><label className="form-label">Nghĩa tiếng Việt</label><input className="form-input" required placeholder="VD: Ăn, Xin chào" value={itemForm.meaning} onChange={(e) => setItemForm({ ...itemForm, meaning: e.target.value })} /></div></div>
          <div className="form-group"><label className="form-label">Câu ví dụ tiếng Nhật</label><input className="form-input" placeholder="VD: 毎朝パンを食べます。" value={itemForm.exampleSentence} onChange={(e) => setItemForm({ ...itemForm, exampleSentence: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Dịch nghĩa câu ví dụ</label><input className="form-input" placeholder="VD: Mỗi sáng tôi đều ăn bánh mì." value={itemForm.exampleTranslation} onChange={(e) => setItemForm({ ...itemForm, exampleTranslation: e.target.value })} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><button type="button" className="btn btn-secondary" onClick={() => setIsItemModalOpen(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editingItem ? 'Lưu cập nhật' : 'Thêm từ vựng'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isAddToDeckModalOpen} onClose={() => setIsAddToDeckModalOpen(false)} title="Lưu từ vào Deck từ vựng">
        {myDecks.length === 0 ? <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Chưa có deck từ vựng nào. Hãy vào mục <strong>Decks Từ vựng</strong> để tạo deck trước nhé!</p> : <div className="form-group"><label className="form-label">Chọn Deck từ vựng</label><select className="form-select" value={targetDeckId} onChange={(e) => setTargetDeckId(e.target.value)}>{myDecks.map((deck) => <option key={deck.deckId} value={deck.deckId}>{deck.title} ({deck.totalItems} từ)</option>)}</select></div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}><button className="btn btn-secondary" onClick={() => setIsAddToDeckModalOpen(false)}>Hủy</button>{myDecks.length > 0 && <button className="btn btn-primary" onClick={saveToDeck}><BookmarkPlus size={16} /> Lưu vào Deck</button>}</div>
      </Modal>
    </div>
  );
};
