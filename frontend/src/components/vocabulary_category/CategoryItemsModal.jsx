import React from 'react';

export default function CategoryItemsModal({ category, onClose }) {
    if (!category) return null;

    const items = category.items || [];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}>
                {/* Header Modal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                            📖 Từ vựng trong danh mục: <span style={{ color: '#10b981' }}>{category.name}</span>
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cấp độ: {category.jlptLevel}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Danh sách từ vựng con */}
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                            Chưa có từ vựng nào thuộc danh mục này.
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={item.itemId || index} style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                                        {index + 1}. {item.wordJp || item.word}
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.875rem', marginTop: '2px' }}>
                                        {item.meaning}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Modal */}
                <div style={{ marginTop: '16px', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}