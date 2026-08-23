import React, { useState, useEffect } from 'react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    // Một form được tái sử dụng cho cả hai chế độ. initialData có giá trị nghĩa là sửa;
    // không có initialData nghĩa là tạo mới với các giá trị mặc định bên dưới.
    const [formData, setFormData] = useState({
        jlptLevel: 'N5',
        name: '',
        description: '',
        createdById: 6 
    });

    useEffect(() => {
        // Mỗi lần modal mở hoặc bản ghi cần sửa thay đổi, đồng bộ dữ liệu từ component cha
        // vào state của form. Việc reset này tránh giữ lại dữ liệu của lần mở modal trước.
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
        // name của input trùng với khóa trong formData, nên một hàm có thể cập nhật mọi
        // trường mà vẫn giữ nguyên các trường còn lại bằng toán tử spread.
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Modal chỉ thu thập dữ liệu. Component cha chọn API create/update, xử lý lỗi
        // và tải lại danh sách sau khi backend lưu thành công.
        onSubmit(formData);
    };

    if (!isOpen) return null;

    // Style chung cho input
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
            backgroundColor: 'rgba(15, 23, 42, 0.6)', // Nền tối làm nổi bật modal
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                borderRadius: '16px', // Bo góc to cho khối Modal
                width: '420px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
                    {initialData ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        Cấp độ JLPT:
                        <select name="jlptLevel" value={formData.jlptLevel} onChange={handleChange} required style={inputStyle}>
                            <option value="N5">N5 - Cơ bản</option>
                            <option value="N4">N4 - Sơ trung cấp</option>
                            <option value="N3">N3 - Trung cấp</option>
                            <option value="N2">N2 - Thượng cấp</option>
                            <option value="N1">N1 - Cao cấp</option>
                        </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        Tên danh mục:
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Vd: Từ vựng Bài 1..." style={inputStyle}/>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
                        Mô tả chi tiết (Tuỳ chọn):
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Nhập mô tả ngắn gọn..." style={{...inputStyle, resize: 'none'}}></textarea>
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 16px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                            Hủy bỏ
                        </button>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(109, 40, 217, 0.3)' }}>
                            {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
