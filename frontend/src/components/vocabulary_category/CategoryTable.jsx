import React from 'react';

const CategoryTable = ({ categories, onEdit, onDelete }) => {
    // Ánh xạ JLPT sang màu badge; fallback bảo vệ UI nếu backend trả level ngoài danh sách.
    const getJlptBadgeStyle = (level) => {
        const styles = {
            'N5': { bg: '#dcfce7', color: '#166534' }, // Xanh lá
            'N4': { bg: '#dbeafe', color: '#1e40af' }, // Xanh dương
            'N3': { bg: '#fef3c7', color: '#92400e' }, // Vàng
            'N2': { bg: '#ffedd5', color: '#c2410c' }, // Cam
            'N1': { bg: '#fee2e2', color: '#991b1b' }, // Đỏ
        };
        const style = styles[level] || { bg: '#f1f5f9', color: '#475569' };
        
        return {
            backgroundColor: style.bg,
            color: style.color,
            padding: '4px 10px',
            borderRadius: '9999px', // Bo tròn hoàn toàn (dạng viên thuốc)
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'inline-block'
        };
    };

    return (
        <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
            overflow: 'hidden',
            marginTop: '24px'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>ID</th>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>JLPT Level</th>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Tên danh mục</th>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Mô tả</th>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Ngày tạo</th>
                            <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            // categoryId là key ổn định để React cập nhật đúng row sau khi reload.
                            categories.map((item) => (
                                <tr key={item.categoryId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '16px 20px', color: '#334155', fontWeight: '500' }}>#{item.categoryId}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={getJlptBadgeStyle(item.jlptLevel)}>{item.jlptLevel}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: '600' }}>{item.name}</td>
                                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.description || <span style={{fontStyle: 'italic', color: '#cbd5e1'}}>Không có</span>}</td>
                                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            {/* Nút Sửa bo góc */}
                                            <button 
                                                onClick={() => onEdit(item)} 
                                                style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde68a'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                                            >
                                                Sửa
                                            </button>
                                            {/* Nút Xóa bo góc */}
                                            <button 
                                                onClick={() => onDelete(item.categoryId)} 
                                                style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                                    Chưa có danh mục nào. Hãy tạo mới nhé!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryTable;
