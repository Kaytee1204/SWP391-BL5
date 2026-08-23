import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankManagementView from '../question-bank/QuestionBankManagementView';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryFormModal from '../../components/vocabulary_category/CategoryFormModal';
import CategoryItemsModal from '../../components/vocabulary_category/CategoryItemsModal';
import FlashcardDeckManagementPage from '../flashcard_deck/FlashcardDeckManagementPage';
import ManagerErrorReportView from '../error_report/ManagerErrorReportView';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenAuth,
  onLogout,
  initialTab = 'grammar_patterns'
}) {
  const [materialTab, setMaterialTab] = useState(initialTab);

  // State cho phần Quản lý Danh mục từ vựng
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForItems, setSelectedCategoryForItems] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await vocabularyCategoryApi.getAll();
      if (response && (response.code === 200 || response.code === 201)) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    }
  }, []);

  useEffect(() => {
    if (materialTab === 'vocabulary_categories') {
      fetchCategories();
    }
  }, [materialTab, fetchCategories]);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        const response = await vocabularyCategoryApi.delete(id);
        if (response.code === 200) {
          fetchCategories(); 
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!formData.name || !formData.name.trim()) {
        alert('Tên danh mục không được để trống!');
        return;
    }

    try {
        const payload = {
            name: formData.name.trim(),
            jlptLevel: formData.jlptLevel,
            description: formData.description ? formData.description.trim() : '',
        };

        let response;
        if (editingCategory) {
            response = await vocabularyCategoryApi.update(editingCategory.categoryId, payload);
        } else {
            const createdById = currentUser?.accountId;
            if (!createdById) {
                alert('Vui lòng đăng nhập để tạo danh mục từ vựng.');
                return;
            }
            response = await vocabularyCategoryApi.create({ ...payload, createdById });
        }

        const success = response && (response.code === 200 || response.code === 201);
        if (!success) {
            alert(response?.message || 'Không thể lưu danh mục.');
            return;
        }

        setIsModalOpen(false);
        await fetchCategories();
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert(error?.message || 'Lỗi khi lưu danh mục.');
    }
  };

  const getJlptBadgeStyle = (level) => {
      const styles = {
          'N5': { bg: '#dcfce7', color: '#166534' },
          'N4': { bg: '#dbeafe', color: '#1e40af' },
          'N3': { bg: '#fef3c7', color: '#92400e' },
          'N2': { bg: '#ffedd5', color: '#c2410c' },
          'N1': { bg: '#fee2e2', color: '#991b1b' },
      };
      const style = styles[level] || { bg: '#f1f5f9', color: '#475569' };
      return {
          backgroundColor: style.bg,
          color: style.color,
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          display: 'inline-block'
      };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Navbar
        currentView="materials"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1180px', margin: '2rem auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          background: '#fff',
          padding: '0.5rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => setMaterialTab('grammar_patterns')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialTab === 'grammar_patterns' ? '#7C3AED' : 'transparent', color: materialTab === 'grammar_patterns' ? '#fff' : 'var(--text-body)' }}>📖 Grammar Patterns (Lý thuyết)</button>
          <button onClick={() => setMaterialTab('grammar_exercises')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialTab === 'grammar_exercises' ? '#0d9488' : 'transparent', color: materialTab === 'grammar_exercises' ? '#fff' : 'var(--text-body)' }}>📝 Grammar Exercises (Bài tập)</button>
          <button onClick={() => setMaterialTab('question_bank')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialTab === 'question_bank' ? '#d97706' : 'transparent', color: materialTab === 'question_bank' ? '#fff' : 'var(--text-body)' }}>🗂️ Question Bank (Ngân hàng câu hỏi)</button>
          <button onClick={() => setMaterialTab('vocabulary_categories')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialTab === 'vocabulary_categories' ? '#10b981' : 'transparent', color: materialTab === 'vocabulary_categories' ? '#fff' : 'var(--text-body)' }}>📚 Vocabulary Categories (Danh mục từ vựng)</button>
          <button onClick={() => setMaterialTab('flashcard_decks')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', background: materialTab === 'flashcard_decks' ? '#3b82f6' : 'transparent', color: materialTab === 'flashcard_decks' ? '#fff' : 'var(--text-body)' }}>🃏 Flashcard Decks</button>
          <button onClick={() => setMaterialTab('error_reports')} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: materialTab === 'error_reports' ? 'none' : '1px solid #fecdd3', fontWeight: 800, cursor: 'pointer', background: materialTab === 'error_reports' ? '#e11d48' : 'transparent', color: materialTab === 'error_reports' ? '#fff' : '#e11d48' }}>⚠️ Quản lý Báo cáo lỗi</button>
        </div>

        {materialTab === 'grammar_patterns' && <GrammarManagementView currentUser={currentUser} />}
        {materialTab === 'grammar_exercises' && <GrammarExerciseManagementView currentUser={currentUser} />}
        {materialTab === 'question_bank' && <QuestionBankManagementView currentUser={currentUser} />}

        {materialTab === 'vocabulary_categories' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Quản lý Danh mục Từ vựng</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thêm, sửa, xóa các cấp độ từ vựng JLPT</p>
              </div>
              <button 
                onClick={handleAddNew}
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
              >
                + Thêm mới
              </button>
            </div>

            {/* Bảng danh mục được tích hợp trực tiếp */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginTop: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>ID</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>JLPT Level</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Tên danh mục</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Mô tả</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Từ vựng con</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((item) => {
                        const itemCount = item.items ? item.items.length : 0;
                        return (
                          <tr key={item.categoryId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px', color: '#334155', fontWeight: '500' }}>#{item.categoryId}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={getJlptBadgeStyle(item.jlptLevel)}>{item.jlptLevel}</span>
                            </td>
                            <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: '600' }}>{item.name}</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.description || <span style={{fontStyle: 'italic', color: '#cbd5e1'}}>Không có</span>}</td>
                            
                            {/* Nút bấm xem từ vựng con */}
                            <td style={{ padding: '16px 20px' }}>
                              <button 
                                onClick={() => setSelectedCategoryForItems(item)}
                                style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                📚 Xem ({itemCount} từ)
                              </button>
                            </td>

                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Sửa</button>
                                <button onClick={() => handleDelete(item.categoryId)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Xóa</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          Chưa có danh mục nào. Hãy tạo mới nhé!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <CategoryFormModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSubmit={handleFormSubmit}
              initialData={editingCategory}
            />

            <CategoryItemsModal 
              category={selectedCategoryForItems}
              onClose={() => setSelectedCategoryForItems(null)}
            />
          </div>
        )}

        {materialTab === 'flashcard_decks' && <FlashcardDeckManagementPage currentUser={currentUser} />}
        {materialTab === 'error_reports' && <ManagerErrorReportView />}
      </main>
    </div>
  );
}