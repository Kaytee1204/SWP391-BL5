import React, { useState, useEffect } from 'react';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryTable from '../../components/CategoryTable';
import CategoryFormModal from '../../components/CategoryFormModal';
import CategoryItemsModal from '../../components/vocabulary_category/CategoryItemsModal';
import Navbar from '../../components/common/Navbar';

export default function VocabularyCategoryPage({ currentUser, onNavigate, onLogout, onViewProfile, onOpenAuth }) {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    // State for viewing nested vocabulary items
    const [selectedCategoryForItems, setSelectedCategoryForItems] = useState(null);

    const fetchCategories = async () => {
        try {
            const response = await vocabularyCategoryApi.getAll();
            if (response && (response.code === 200 || response.code === 201)) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error("Error loading categories list:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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
        try {
            let response;
            if (editingCategory) {
                response = await vocabularyCategoryApi.update(editingCategory.categoryId, formData);
            } else {
                response = await vocabularyCategoryApi.create(formData);
            }

            const success = response && (response.code === 200 || response.code === 201);
            if (!success) {
                alert(response?.message || 'Failed to save category.');
                return;
            }

            setIsModalOpen(false);
            await fetchCategories();
        } catch (error) {
            console.error("Error saving data:", error);
            alert(error?.message || 'Error saving category.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
            <Navbar 
                currentUser={currentUser}
                onNavigate={onNavigate}
                onLogout={onLogout}
                onViewProfile={onViewProfile}
                onOpenAuth={onOpenAuth}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Vocabulary Categories Management</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Add, update, and manage JLPT vocabulary levels</p>
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
                        + Add New
                    </button>
                </div>

                {/* Pass onViewItems prop into CategoryTable */}
                <CategoryTable 
                    categories={categories} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onViewItems={(category) => setSelectedCategoryForItems(category)}
                />

                <CategoryFormModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={handleFormSubmit}
                    initialData={editingCategory}
                />

                {/* CategoryItemsModal at the bottom of the page */}
                <CategoryItemsModal 
                    category={selectedCategoryForItems}
                    onClose={() => setSelectedCategoryForItems(null)}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
}