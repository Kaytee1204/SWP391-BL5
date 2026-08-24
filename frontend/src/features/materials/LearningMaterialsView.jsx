// src/features/materials/LearningMaterialsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import GrammarManagementView from '../grammar/GrammarManagementView';
import GrammarExerciseManagementView from '../grammar/GrammarExerciseManagementView';
import QuestionBankWorkspace from '../question-bank/QuestionBankWorkspace';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryFormModal from '../../components/vocabulary_category/CategoryFormModal';
import KanjiModuleManagementView from './KanjiModuleManagementView';
import FlashcardDeckManagementPage from '../flashcard_deck/FlashcardDeckManagementPage';
import ReadingPassageManagementView from '../reading-passages/ReadingPassageManagementView';
import ListeningExerciseManagementView from '../listening-exercises/ListeningExerciseManagementView';
import CourseManagementView from '../courses/CourseManagementView';

export default function LearningMaterialsView({
  currentUser,
  onNavigate,
  onViewProfile,
  onOpenAuth,
  onLogout,
  initialTab = 'grammar_patterns'
}) {
  const [materialTab, setMaterialTab] = useState(initialTab);

  // States for Vocabulary Categories Management
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForItems, setSelectedCategoryForItems] = useState(null);

  const fetchCategories = useCallback(async () => {
    // useCallback giữ cùng một tham chiếu hàm giữa các lần render, để useEffect phía dưới
    // không gọi API lặp vô hạn chỉ vì component vừa cập nhật state categories.
    try {
      const response = await vocabularyCategoryApi.getAll();
      if (response && (response.code === 200 || response.code === 201)) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error loading categories list:", error);
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
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await vocabularyCategoryApi.delete(id);
        if (response.code === 200) {
          fetchCategories(); 
        }
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!formData.name || !formData.name.trim()) {
        alert('Category name cannot be empty!');
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
                alert('Please log in to create vocabulary categories.');
                return;
            }
            response = await vocabularyCategoryApi.create({ ...payload, createdById });
        }

        const success = response && (response.code === 200 || response.code === 201);
        if (!success) {
            alert(response?.message || 'Failed to save category.');
            return;
        }

        setIsModalOpen(false);
        // Tải lại từ API thay vì tự chèn form vào bảng để nhận đúng ID, ngày tạo và
        // mọi giá trị mà backend có thể đã chuẩn hóa trong lúc lưu.
        await fetchCategories();
    } catch (error) {
        console.error("Error saving data:", error);
        alert(error?.message || 'Error saving category.');
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
            📖 Grammar Patterns
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
            📝 Grammar Exercises
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
            🗂️ Question Bank
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
            📚 Vocabulary Categories
          </button>

          <button
            onClick={() => setMaterialTab('reading_passages')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'reading_passages' ? '#0f766e' : 'transparent',
              color: materialTab === 'reading_passages' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Reading Passages
          </button>

          <button
            onClick={() => setMaterialTab('flashcard_decks')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'flashcard_decks' ? '#3b82f6' : 'transparent',
              color: materialTab === 'flashcard_decks' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🃏 Flashcard Decks
          </button>

          <button
            onClick={() => setMaterialTab('courses')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: materialTab === 'courses' ? '#ea580c' : 'transparent',
              color: materialTab === 'courses' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            📚 Courses (Khóa học & Giá)
          </button>

          <button
            onClick={() => setMaterialTab('listening_exercises')}
            style={{
              padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none',
              fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
              background: materialTab === 'listening_exercises' ? '#2563eb' : 'transparent',
              color: materialTab === 'listening_exercises' ? '#fff' : 'var(--text-body)',
              transition: 'all 0.2s ease'
            }}
          >
            🎧 Listening Exercises
          </button>
        </div>

        {/* Tab Content */}
        {materialTab === 'courses' && (
          <CourseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'grammar_patterns' && (
          <GrammarManagementView currentUser={currentUser} />
        )}
        
        {materialTab === 'grammar_exercises' && (
          <GrammarExerciseManagementView currentUser={currentUser} />
        )}

        {materialTab === 'question_bank' && (
          <QuestionBankWorkspace currentUser={currentUser} />
        )}

        {materialTab === 'reading_passages' && (
          <ReadingPassageManagementView currentUser={currentUser} />
        )}

        {materialTab === 'vocabulary_categories' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Vocabulary Categories Management</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Add, update, and manage JLPT vocabulary levels</p>
              </div>
              <button 
                onClick={handleAddNew}
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
              >
                + Add New
              </button>
            </div>

            {/* Categories Table View */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginTop: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>ID</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>JLPT Level</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Category Name</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Description</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Vocabulary Items</th>
                      <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>Actions</th>
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
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.description || <span style={{fontStyle: 'italic', color: '#cbd5e1'}}>None</span>}</td>
                            
                            {/* View items button */}
                            <td style={{ padding: '16px 20px' }}>
                              <button 
                                onClick={() => setSelectedCategoryForItems(item)}
                                style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                📚 View ({itemCount} words)
                              </button>
                            </td>

                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Edit</button>
                                <button onClick={() => handleDelete(item.categoryId)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          No categories found. Let's create a new one!
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
              currentUser={currentUser}
            />
          </div>
        )}

        {materialTab === 'flashcard_decks' && (
          <FlashcardDeckManagementPage currentUser={currentUser} />
        )}

        {materialTab === 'listening_exercises' && (
          <ListeningExerciseManagementView currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}