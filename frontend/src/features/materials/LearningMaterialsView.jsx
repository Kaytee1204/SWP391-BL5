import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankManagementView from '../question-bank/QuestionBankManagementView';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryTable from '../../components/vocabulary_category/CategoryTable';
import CategoryFormModal from '../../components/vocabulary_category/CategoryFormModal';
import KanjiModuleManagementView from './KanjiModuleManagementView';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenAuth,
  onLogout,
  initialTab = 'grammar_patterns'
}) {
  // materialTab quyết định workspace con nào được mount trong Learning Materials.
  // Nhờ vậy Kanji Categories vẫn thuộc cùng module thay vì trở thành trang độc lập.
  const [materialTab, setMaterialTab] = useState(initialTab);

  // State cho phần Quản lý Danh mục từ vựng
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    // useCallback giữ cùng một tham chiếu hàm giữa các lần render, để useEffect phía dưới
    // không gọi API lặp vô hạn chỉ vì component vừa cập nhật state categories.
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
    // Chỉ tải danh mục khi người dùng thật sự mở tab tương ứng. Các tab Grammar/Kanji
    // có luồng dữ liệu riêng nên không cần chờ request Vocabulary Category này.
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
        // Chuẩn hóa chuỗi trước khi gửi để backend không lưu tên chỉ chứa khoảng trắng.
        // Cùng một payload cơ sở được dùng cho create và update để tránh lệch dữ liệu.
        const payload = {
            name: formData.name.trim(),
            jlptLevel: formData.jlptLevel,
            description: formData.description ? formData.description.trim() : '',
        };

        let response;
        // Có editingCategory thì update theo ID, nếu không thì tạo mới. Backend vẫn lấy
        // danh tính/quyền từ JWT; createdById được giữ để tương thích hợp đồng API cũ.
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
        // Tải lại từ API thay vì tự chèn form vào bảng để nhận đúng ID, ngày tạo và
        // mọi giá trị mà backend có thể đã chuẩn hóa trong lúc lưu.
        await fetchCategories();
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert(error?.message || 'Lỗi khi lưu danh mục.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar */}
      <Navbar
        currentView="materials"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1180px', margin: '2rem auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Workspace Tab Switcher */}
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
          <button
            onClick={() => setMaterialTab('grammar_patterns')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'grammar_patterns' ? '#7C3AED' : 'transparent',
              color: materialTab === 'grammar_patterns' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📖 Grammar Patterns (Lý thuyết)
          </button>
          
          <button
            onClick={() => setMaterialTab('grammar_exercises')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'grammar_exercises' ? '#0d9488' : 'transparent',
              color: materialTab === 'grammar_exercises' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Grammar Exercises (Bài tập)
          </button>

          <button
            onClick={() => setMaterialTab('question_bank')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'question_bank' ? '#d97706' : 'transparent',
              color: materialTab === 'question_bank' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🗂️ Question Bank (Ngân hàng câu hỏi)
          </button>

          <button
            onClick={() => setMaterialTab('vocabulary_categories')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'vocabulary_categories' ? '#10b981' : 'transparent',
              color: materialTab === 'vocabulary_categories' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Vocabulary Categories (Danh mục từ vựng)
          </button>

          <button
            onClick={() => setMaterialTab('kanji_modules')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'kanji_modules' ? '#2563eb' : 'transparent',
              color: materialTab === 'kanji_modules' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            Kanji Categories (Danh mục Kanji)
          </button>
        </div>

        {/* Tab Content */}
        {materialTab === 'grammar_patterns' && (
          <GrammarManagementView currentUser={currentUser} />
        )}
        
        {materialTab === 'grammar_exercises' && (
          <GrammarExerciseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'question_bank' && (
          <QuestionBankManagementView currentUser={currentUser} />
        )}

        {materialTab === 'vocabulary_categories' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Quản lý Danh mục Từ vựng</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thêm, sửa, xóa các cấp độ từ vựng JLPT</p>
              </div>
              <button 
                onClick={handleAddNew}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + Thêm mới
              </button>
            </div>

            <CategoryTable 
              categories={categories} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />

            <CategoryFormModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSubmit={handleFormSubmit}
              initialData={editingCategory}
            />
          </div>
        )}

        {materialTab === 'kanji_modules' && (
          // Component Kanji tự quản lý bộ lọc, modal và API CRUD của chính nó;
          // view cha chỉ đặt nó đúng bên trong workspace dành cho Lecturer.
          <KanjiModuleManagementView currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
