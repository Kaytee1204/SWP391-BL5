import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Folder, Search, BookOpen, Layers, List, Grid } from 'lucide-react';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import { vocabApi } from '../../api';
import CategoryFormModal from '../../components/vocabulary_category/CategoryFormModal';
import VocabularyItemFormModal from './components/VocabularyItemFormModal';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function VocabularyManagementView({ currentUser }) {
  const canManage = currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager';
  
  const [activeSubTab, setActiveSubTab] = useState('items'); // 'items' | 'categories'
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories state
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Items state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await vocabularyCategoryApi.getAll();
      if (res && (res.code === 200 || res.code === 201)) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await vocabApi.getItems(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi khi tải danh sách từ vựng: ' + err.message });
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedCategoryId, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Total items count across categories
  const totalItemsCount = useMemo(() => {
    return items.length;
  }, [items]);

  // Handle Category CRUD
  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await vocabularyCategoryApi.update(editingCategory.categoryId, formData);
        setFeedback({ type: 'success', msg: 'Cập nhật danh mục thành công!' });
      } else {
        await vocabularyCategoryApi.create({ ...formData, createdById: currentUser?.accountId });
        setFeedback({ type: 'success', msg: 'Tạo danh mục từ vựng mới thành công!' });
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Lỗi khi lưu danh mục.' });
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"? Tất cả từ vựng trong danh mục này cũng sẽ bị xóa!`)) return;
    try {
      await vocabularyCategoryApi.delete(cat.categoryId);
      setFeedback({ type: 'success', msg: 'Đã xóa danh mục thành công!' });
      fetchCategories();
      fetchItems();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Lỗi khi xóa danh mục.' });
    }
  };

  // Handle Item CRUD
  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await vocabApi.updateItem(editingItem.itemId, formData);
        setFeedback({ type: 'success', msg: 'Cập nhật từ vựng thành công!' });
      } else {
        await vocabApi.createItem(formData);
        setFeedback({ type: 'success', msg: 'Thêm từ vựng mới thành công!' });
      }
      setIsItemModalOpen(false);
      fetchItems();
      fetchCategories();
    } catch (err) {
      setFeedback({
        type: err.status === 409 ? 'conflict' : 'error',
        msg: err.status === 409
          ? 'This content was updated by another lecturer. Please refresh the page before editing it again.'
          : (err.message || 'Lỗi khi lưu từ vựng.')
      });
      throw err;
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa từ vựng "${item.word}" (${item.meaning})?`)) return;
    try {
      await vocabApi.deleteItem(item.itemId);
      setFeedback({ type: 'success', msg: 'Đã xóa từ vựng thành công!' });
      fetchItems();
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Lỗi khi xóa từ vựng.' });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Control Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* Header Title & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📚</span>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
                Quản lý Kho Từ Vựng & Danh Mục
              </h2>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1px solid #a7f3d0'
              }}>
                {categories.length} Danh mục • {items.length} Từ vựng
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Quản lý chi tiết từng từ vựng, Kanji, cách đọc Romaji, câu ví dụ và phân loại bài học JLPT
            </p>
          </div>

          {canManage && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.6rem 1.1rem',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <Folder size={16} /> + Thêm Danh Mục
              </button>

              <button
                type="button"
                onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.6rem 1.25rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={18} strokeWidth={2.5} /> + Thêm Từ Vựng Mới
              </button>
            </div>
          )}
        </div>

        {/* Sub Tabs: Từ vựng vs Danh mục */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('items')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeSubTab === 'items' ? '#10b981' : '#f1f5f9',
              color: activeSubTab === 'items' ? '#fff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            📖 Danh Sách Từ Vựng ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('categories')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeSubTab === 'categories' ? '#0d9488' : '#f1f5f9',
              color: activeSubTab === 'categories' ? '#fff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            🗂️ Danh Mục Bài Học ({categories.length})
          </button>
        </div>

        {/* Filter & Search Bar (chỉ cho tab items) */}
        {activeSubTab === 'items' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {/* JLPT Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
                JLPT:
              </span>
              {['ALL', ...JLPT_LEVELS].map((lvl) => {
                const isActive = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => { setSelectedLevel(lvl); setSelectedCategoryId(''); }}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: isActive ? '#10b981' : '#cbd5e1',
                      background: isActive ? '#10b981' : '#fff',
                      color: isActive ? '#fff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lvl === 'ALL' ? 'Tất cả' : lvl}
                  </button>
                );
              })}
            </div>

            {/* Category Select & Search Input */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: '1 1 400px', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '180px', position: 'relative' }}>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem 0.5rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      [{c.jlptLevel}] {c.name}
                    </option>
                  ))}
                </select>
                <Folder size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>

              <div style={{ position: 'relative', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Tìm từ, kanji, nghĩa, romaji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={15} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Feedback alert */}
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
            <button type="button" onClick={fetchItems} style={{ marginLeft: '12px' }}>Refresh</button>
          )}
        </div>
      )}

      {/* SUB-TAB 1: VOCABULARY ITEMS LIST & CRUD */}
      {activeSubTab === 'items' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              ⏳ Đang tải dữ liệu từ vựng...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Không tìm thấy từ vựng nào phù hợp
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 1rem' }}>
                Hãy bấm "+ Thêm Từ Vựng Mới" để tạo từ vựng đầu tiên cho danh mục này!
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.25rem',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> Thêm Từ Vựng Đầu Tiên
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 16px', width: '70px' }}>ID</th>
                    <th style={{ padding: '14px 16px', width: '100px', textAlign: 'center' }}>JLPT</th>
                    <th style={{ padding: '14px 16px', width: '180px' }}>Từ Vựng (Hiragana/Katakana)</th>
                    <th style={{ padding: '14px 16px', width: '140px' }}>Hán Tự (Kanji)</th>
                    <th style={{ padding: '14px 16px', width: '140px' }}>Cách Đọc (Romaji)</th>
                    <th style={{ padding: '14px 16px', width: '200px' }}>Ý Nghĩa Tiếng Việt</th>
                    <th style={{ padding: '14px 16px' }}>Câu Ví Dụ</th>
                    <th style={{ padding: '14px 16px', minWidth: '190px' }}>Lecturer</th>
                    {canManage && <th style={{ padding: '14px 16px', textAlign: 'right', width: '150px' }}>Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const jlptStyle = getJlptStyle(item.jlptLevel || 'N5');
                    return (
                      <tr
                        key={item.itemId}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>
                          #{item.itemId}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: jlptStyle.bg,
                            color: jlptStyle.text,
                            border: `1px solid ${jlptStyle.border}`
                          }}>
                            {item.jlptLevel || 'N5'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', fontFamily: '"Hiragino Kaku Gothic Pro", Meiryo, sans-serif' }}>
                              {item.word}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            📂 {item.categoryName || 'Danh mục'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {item.kanji ? (
                            <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '1.05rem', fontFamily: '"Hiragino Mincho ProN", serif' }}>
                              {item.kanji}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
                          {item.reading || '—'}
                        </td>

                        <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700 }}>
                          {item.meaning}
                        </td>

                        <td style={{ padding: '14px 16px', fontSize: '0.8rem' }}>
                          {item.exampleSentence ? (
                            <div>
                              <div style={{ color: '#334155', fontWeight: 600 }}>{item.exampleSentence}</div>
                              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>{item.exampleTranslation}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>Chưa có ví dụ</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                          <div><strong>Added By:</strong> {item.createdBy || '—'}</div>
                          <div><strong>Last Updated:</strong> {item.updatedBy || '—'}</div>
                          <div>{item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '—'}</div>
                        </td>

                        {canManage && (
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '0.35rem 0.65rem',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Sửa từ vựng"
                              >
                                <Edit2 size={12} /> Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '0.35rem 0.65rem',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Xóa từ vựng"
                              >
                                <Trash2 size={12} /> Xóa
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CATEGORIES LIST & CRUD */}
      {activeSubTab === 'categories' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 16px', width: '80px' }}>ID</th>
                  <th style={{ padding: '14px 16px', width: '120px', textAlign: 'center' }}>Cấp Độ JLPT</th>
                  <th style={{ padding: '14px 16px' }}>Tên Danh Mục Bài Học</th>
                  <th style={{ padding: '14px 16px' }}>Mô Tả</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '150px' }}>Số Lượng Từ Vựng</th>
                  {canManage && <th style={{ padding: '14px 16px', textAlign: 'right', width: '160px' }}>Thao Tác</th>}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      Chưa có danh mục từ vựng nào.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => {
                    const jlptStyle = getJlptStyle(cat.jlptLevel);
                    return (
                      <tr
                        key={cat.categoryId}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px', color: '#64748b', fontWeight: 600 }}>
                          #{cat.categoryId}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: jlptStyle.bg,
                            color: jlptStyle.text,
                            border: `1px solid ${jlptStyle.border}`
                          }}>
                            {cat.jlptLevel}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: 700, fontSize: '0.92rem' }}>
                          {cat.name}
                        </td>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.82rem' }}>
                          {cat.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Không có mô tả</span>}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: '1px solid #e2e8f0'
                          }}>
                            📚 {cat.items ? cat.items.length : (cat.itemCount || 0)} từ
                          </span>
                        </td>
                        {canManage && (
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
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
                                title="Sửa danh mục"
                              >
                                <Edit2 size={13} /> Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
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
                                title="Xóa danh mục"
                              >
                                <Trash2 size={13} /> Xóa
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Category Form */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        initialData={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSaveCategory}
      />

      {/* Modal Vocab Item Form */}
      <VocabularyItemFormModal
        isOpen={isItemModalOpen}
        item={editingItem}
        categories={categories}
        defaultCategoryId={selectedCategoryId}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
      />

    </div>
  );
}
