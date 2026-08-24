import React, { useState, useEffect } from 'react';

export default function CategoryFormModal({ isOpen, onClose, onSubmit, initialData }) {
    // Input là controlled state; initialData có giá trị khi sửa và null khi tạo.
    const [name, setName] = useState('');
    const [jlptLevel, setJlptLevel] = useState('N5');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State lưu thông báo lỗi validate/server

    useEffect(() => {
        // Reset/sync mỗi lần mở để dữ liệu category trước không còn sót lại.
        if (initialData) {
            setName(initialData.name || '');
            setJlptLevel(initialData.jlptLevel || 'N5');
            setDescription(initialData.description || '');
        } else {
            setName('');
            setJlptLevel('N5');
            setDescription('');
        }
        setErrorMessage(''); // Xóa lỗi cũ mỗi khi mở modal
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate sớm để phản hồi nhanh; backend vẫn validate lại vì không thể tin hoàn toàn client.
        if (!name.trim()) {
            setErrorMessage('Vui lòng nhập tên danh mục từ vựng!');
            return;
        }

        try {
            // Modal chỉ gom dữ liệu; component cha quyết định gọi create hay update.
            await onSubmit({
                name: name.trim(),
                jlptLevel,
                description: description.trim()
            });
        } catch (error) {
            // Bắt lỗi trả về từ Backend (ví dụ lỗi quá ký tự SQL, trùng tên, v.v.)
            const errorMsg = error?.message || error?.response?.data?.message || 'Đã có lỗi xảy ra khi lưu dữ liệu!';
            setErrorMessage(errorMsg);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                padding: '32px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'fadeIn 0.2s ease-in-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                        {initialData ? '✏️ Chỉnh Sửa Danh Mục Từ Vựng' : '✨ Thêm Mới Danh Mục Từ Vựng'}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Khu vực hiển thị thông báo lỗi validate / server cực kỳ bắt mắt */}
                {errorMessage && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        <span style={{ wordBreak: 'break-word' }}>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Tên danh mục <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Từ vựng chủ đề Giao thông..."
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Cấp độ JLPT
                        </label>
                        <select
                            value={jlptLevel}
                            onChange={(e) => setJlptLevel(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                backgroundColor: '#fff',
                                outline: 'none'
                            }}
                        >
                            <option value="N5">N5 (Sơ cấp)</option>
                            <option value="N4">N4 (Sơ cấp)</option>
                            <option value="N3">N3 (Trung cấp)</option>
                            <option value="N2">N2 (Cao cấp)</option>
                            <option value="N1">N1 (Siêu cao cấp)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Mô tả chi tiết
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả ngắn gọn về danh mục từ vựng này..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            {initialData ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
