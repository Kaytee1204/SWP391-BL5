import React, { useState, useEffect, useCallback } from 'react';
import { flashcardDeckApi } from '../../api/flashcardDeckApi';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

  // Gọi API lấy danh sách Flashcard Decks
  const fetchDecks = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const response = await flashcardDeckApi.getAll({ page: currentPage, size: 10, sortBy: 'createdAt', direction: 'DESC' });
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
    
    // 1. Validate bắt buộc chọn danh mục từ vựng
    if (!formData.title || !formData.title.trim()) {
      alert("Vui lòng chọn danh mục từ vựng trong danh sách!");
      return;
    }

    // 2. Validate độ dài mô tả tối đa 200 ký tự
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
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thêm, sửa, xóa các bộ thẻ học tập chuẩn hóa cho học viên</p>
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
            position: 'relative',
            zIndex: 10
          }}
        >
          <Plus size={18} /> Thêm bộ thẻ
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>ID</th>
              <th style={{ padding: '12px 16px' }}>Tiêu đề (Title)</th>
              <th style={{ padding: '12px 16px' }}>Mô tả</th>
              <th style={{ padding: '12px 16px' }}>Ngày tạo</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.875rem', color: '#334155' }}>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
            ) : decks.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Chưa có bộ flashcard nào được tạo.</td></tr>
            ) : (
              decks.map((deck) => (
                <tr key={deck.deckId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#64748b' }}>#{deck.deckId}</td>
                  <td style={{ padding: '16px', fontWeight: '700', color: '#0f172a' }}>{deck.title}</td>
                  <td style={{ padding: '16px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {deck.description || "Không có mô tả"}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(deck)} style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <Edit size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(deck.deckId)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Thanh phân trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Chọn Danh mục từ vựng *</label>
                <select 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="">-- Chọn danh mục từ vựng --</option>
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
    </div>
  );
}