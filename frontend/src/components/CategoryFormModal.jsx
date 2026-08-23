import React, { useState, useEffect } from 'react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        jlptLevel: 'N5',
        name: '',
        description: '',
        createdById: 6 
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                jlptLevel: initialData.jlptLevel || 'N5',
                name: initialData.name || '',
                description: initialData.description || '',
                createdById: initialData.createdById || 6
            });
        } else {
            setFormData({ jlptLevel: 'N5', name: '', description: '', createdById: 6 });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    // Common input styling
    const inputStyle = {
        padding: '12px 14px', 
        marginTop: '6px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: '0.95rem',
        color: '#0f172a',
        backgroundColor: '#f8fafc',
        fontFamily: 'inherit'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                borderRadius: '16px', 
                width: '420px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
                    {initialData ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        JLPT Level:
                        <select name="jlptLevel" value={formData.jlptLevel} onChange={handleChange} required style={inputStyle}>
                            <option value="N5">N5 - Beginner</option>
                            <option value="N4">N4 - Elementary</option>
                            <option value="N3">N3 - Intermediate</option>
                            <option value="N2">N2 - Upper-Intermediate</option>
                            <option value="N1">N1 - Advanced</option>
                        </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        Category Name:
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Lesson 1 Vocabulary..." style={inputStyle}/>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        Description (Optional):
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Enter a brief description..." style={{...inputStyle, resize: 'none'}}></textarea>
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 16px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(109, 40, 217, 0.3)' }}>
                            {initialData ? 'Save Changes' : 'Create New'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;