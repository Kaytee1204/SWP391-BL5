import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

export default function CategoryItemsModal({ category, onClose, currentUser }) {
    const [items, setItems] = useState([]);
    
    // State cho form Thêm/Sửa từ vựng con
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({ wordJp: '', meaning: '' });
    const [formError, setFormError] = useState('');

    // Kiểm tra quyền (Manager, Lecturer, Student, Admin)
    const isManagerOrLecturer = Boolean(currentUser);

    const resetForm = () => {
        setEditingIndex(null);
        setFormData({ wordJp: '', meaning: '' });
        setFormError('');
    };

    useEffect(() => {
        if (category && category.items) {
            setItems(category.items);
        } else {
            setItems([]);
        }
        resetForm();
    }, [category]);

    if (!category) return null;

    const handleEditClick = (item, index) => {
        setEditingIndex(index);
        setFormData({
            wordJp: item.wordJp || item.word || '',
            meaning: item.meaning || ''
        });
        setFormError('');
    };

    // Hàm Validate Input (Giới hạn từ tiếng Nhật tối đa 20 ký tự)
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        const trimmedWord = formData.wordJp.trim();
        const trimmedMeaning = formData.meaning.trim();

        // 1. Kiểm tra bỏ trống
        if (!trimmedWord || !trimmedMeaning) {
            setFormError('⚠️ Both Japanese word and meaning are required and cannot be empty.');
            return;
        }

        // 2. Kiểm tra độ dài tối đa (Từ tiếng Nhật tối đa 20 ký tự)
        if (trimmedWord.length > 20) {
            setFormError('⚠️ Japanese word must not exceed 20 characters.');
            return;
        }

        if (trimmedMeaning.length > 250) {
            setFormError('⚠️ Meaning description must not exceed 250 characters.');
            return;
        }

        if (editingIndex !== null) {
            // Cập nhật item
            const updatedItems = [...items];
            updatedItems[editingIndex] = { ...updatedItems[editingIndex], wordJp: trimmedWord, meaning: trimmedMeaning };
            setItems(updatedItems);
        } else {
            // Thêm item mới
            const newItem = {
                itemId: Date.now(),
                wordJp: trimmedWord,
                meaning: trimmedMeaning
            };
            setItems([...items, newItem]);
        }
        resetForm();
    };

    const handleDelete = (index) => {
        if (!window.confirm("Are you sure you want to delete this vocabulary item?")) return;
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                
                {/* Modal Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                            📚 Vocabulary in Category: <span style={{ color: '#10b981' }}>{category.name}</span>
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>JLPT Level: {category.jlptLevel}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', fontSize: '1.25rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Form Thêm / Sửa từ vựng con */}
                    {isManagerOrLecturer && (
                        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                                {editingIndex !== null ? '✏️ Edit Vocabulary Item' : '➕ Add New Word'}
                            </h4>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <input 
                                    type="text"
                                    placeholder="Japanese word (max 20 chars)"
                                    value={formData.wordJp}
                                    maxLength={21}
                                    onChange={(e) => setFormData({...formData, wordJp: e.target.value})}
                                    style={{ flex: 1, minWidth: '180px', padding: '0.6rem', borderRadius: '8px', border: formError && !formData.wordJp.trim() ? '1px solid #ef4444' : '1px solid #cbd5e1', outline: 'none' }}
                                />
                                <input 
                                    type="text"
                                    placeholder="Meaning (e.g., Quả táo)"
                                    value={formData.meaning}
                                    maxLength={251}
                                    onChange={(e) => setFormData({...formData, meaning: e.target.value})}
                                    style={{ flex: 1, minWidth: '180px', padding: '0.6rem', borderRadius: '8px', border: formError && !formData.meaning.trim() ? '1px solid #ef4444' : '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            {formError && <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '500', backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>{formError}</div>}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {editingIndex !== null && (
                                    <button type="button" onClick={resetForm} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                                    <Plus size={16} /> {editingIndex !== null ? 'Update Word' : 'Add Word'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Danh sách từ vựng con */}
                    <div>
                        <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1rem' }}>Vocabulary List ({items.length} words)</h4>
                        
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                                No vocabulary items in this category yet.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {items.map((item, index) => {
                                    const wordText = item.wordJp || item.word || '';
                                    return (
                                        <div key={item.itemId || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' }}>{index + 1}. {wordText}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>{item.meaning}</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {/* Các nút Sửa, Xóa */}
                                                {isManagerOrLecturer && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEditClick(item, index)}
                                                            style={{ padding: '6px 10px', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(index)}
                                                            style={{ padding: '6px 10px', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
                    <button 
                        onClick={onClose}
                        style={{ padding: '8px 20px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
