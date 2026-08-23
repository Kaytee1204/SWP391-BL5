import React, { useState, useEffect, useCallback } from 'react';
import { flashcardDeckApi } from '../../api/flashcardDeckApi';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FlashcardDeckItemsModal from './components/FlashcardDeckItemsModal';

export default function FlashcardDeckManagementPage({ currentUser }) {
  const [decks, setDecks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // State quản lý danh mục từ vựng cho Dropdown
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // State quản lý xem các thẻ con bên trong deck
  const [selectedDeckForItems, setSelectedDeckForItems] = useState(null);

  // Gọi API lấy danh sách Flashcard Decks
  const fetchDecks = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const response = await flashcardDeckApi.getAll({ page: currentPage, size: 12, sortBy: 'createdAt', direction: 'DESC' });
      if (response) {
        setDecks(response.content || []);
        setTotalPages(response.totalPages || 0);
        setPage(response.number || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách flashcard decks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API lấy danh sách Danh mục từ vựng cho Dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await vocabularyCategoryApi.getAll();
      if (response && (response.code === 200 || response.code === 201)) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục từ vựng:", error);
    }
  }, []);

  useEffect(() => {
    fetchDecks(0);
    fetchCategories();
  }, [fetchDecks, fetchCategories]);

  const handleAddNew = () => {
    setEditingDeck(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (deck) => {
    setEditingDeck(deck);
    setFormData({ title: deck.title || '', description: deck.description || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (deckId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ Flashcard này không?")) {
      try {
        await flashcardDeckApi.delete(deckId);
        fetchDecks(page);
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert(error.response?.data?.message || "Không thể xóa bộ flashcard này. Vui lòng kiểm tra lại quyền đăng nhập.");
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title.trim()) {
      alert("Vui lòng chọn hoặc nhập tiêu đề bộ Flashcard!");
      return;
    }

    if (formData.description && formData.description.length > 200) {
      alert("Mô tả không được vượt quá 200 ký tự! Vui lòng nhập lại ngắn gọn hơn.");
      return;
    }

    try {
      if (editingDeck) {
        await flashcardDeckApi.update(editingDeck.deckId, formData);
      } else {
        await flashcardDeckApi.create(formData);
      }

      setIsModalOpen(false);
      fetchDecks(0);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      alert(error.response?.data?.message || "Chưa xác thực hoặc token không hợp lệ.");
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Quản lý Bộ Flashcard Hệ thống</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thêm, sửa, xóa các bộ thẻ học tập chuẩn hóa cho học viên dưới dạng gói</p>
        </div>
        <button 
          type="button"
          onClick={handleAddNew}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus size={18} /> Thêm bộ thẻ
        </button>
      </div>

      {/* Giao diện dạng Cards hiện đại */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải dữ liệu...</div>
      ) : decks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
          Chưa có bộ flashcard nào được tạo.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {decks.map((deck) => {
            const itemCount = deck.items ? deck.items.length : 0;
            return (
              <div 
                key={deck.deckId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e40af', backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '999px' }}>SYSTEM DECK</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{deck.deckId}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{deck.title}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {deck.description || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Không có mô tả</span>}
                  </p>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedDeckForItems(deck)}
                    style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    📚 Xem ({itemCount} thẻ)
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(deck)} style={{ padding: '6px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit size={12} /> Sửa
                    </button>
                    <button onClick={() => handleDelete(deck.deckId)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thanh phân trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Trang {page + 1} / {totalPages || 1}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            disabled={page === 0}
            onClick={() => fetchDecks(page - 1)}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
          >
            Trang trước
          </button>
          <button 
            disabled={page + 1 >= totalPages}
            onClick={() => fetchDecks(page + 1)}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: page + 1 >= totalPages ? 0.5 : 1 }}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {editingDeck ? 'Chỉnh sửa Bộ Flashcard' : 'Thêm mới Bộ Flashcard'}
            </h3>
            
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Tiêu đề bộ thẻ (Title) *</label>
                <select 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="">-- Chọn hoặc liên kết danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId || cat.id} value={cat.name}>
                      [{cat.jlptLevel}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Mô tả (Description)</label>
                  <span style={{ fontSize: '0.75rem', color: formData.description.length > 200 ? '#dc2626' : '#64748b' }}>
                    {formData.description.length}/200 ký tự
                  </span>
                </div>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Mô tả ngắn gọn về bộ thẻ này..." 
                  rows={3}
                  maxLength={200}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingDeck ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CÁC THẺ CON BÊN TRONG */}
      <FlashcardDeckItemsModal 
        deck={selectedDeckForItems}
        onClose={() => setSelectedDeckForItems(null)}
      />
    </div>
  );
}