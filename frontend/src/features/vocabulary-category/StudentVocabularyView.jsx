import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import CategoryItemsModal from '../../components/vocabulary_category/CategoryItemsModal';

export default function StudentVocabularyView({ currentUser, onNavigate, onViewProfile, onOpenAuth, onLogout }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryForItems, setSelectedCategoryForItems] = useState(null);
    const [filterLevel, setFilterLevel] = useState('ALL');

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await vocabularyCategoryApi.getAll();
            if (response && (response.code === 200 || response.code === 201)) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục từ vựng:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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

    const filteredCategories = filterLevel === 'ALL' 
        ? categories 
        : categories.filter(c => c.jlptLevel === filterLevel);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body, #f8fafc)' }}>
            <Navbar
                currentView="student_vocabulary"
                currentUser={currentUser}
                onNavigate={onNavigate}
                onViewProfile={onViewProfile}
                onOpenAuth={onOpenAuth}
                onLogout={onLogout}
            />

            <main style={{ maxWidth: '1180px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: '800' }}>📚 Danh mục Từ vựng JLPT</h1>
                    <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Khám phá và học tập hệ thống từ vựng theo từng chủ đề và cấp độ.</p>
                </div>

                {/* Bộ lọc cấp độ JLPT */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '700',
                                cursor: 'pointer',
                                backgroundColor: filterLevel === level ? '#10b981' : '#ffffff',
                                color: filterLevel === level ? '#ffffff' : '#475569',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {level === 'ALL' ? 'Tất cả cấp độ' : level}
                        </button>
                    ))}
                </div>

                {/* Danh sách danh mục dạng thẻ (Cards) */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Đang tải danh mục từ vựng...</div>
                ) : filteredCategories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
                        Không có danh mục từ vựng nào ở cấp độ này.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filteredCategories.map((cat) => {
                            const itemCount = cat.items ? cat.items.length : 0;
                            return (
                                <div 
                                    key={cat.categoryId}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'transform 0.2s, boxShadow 0.2s',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={getJlptBadgeStyle(cat.jlptLevel)}>{cat.jlptLevel}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{cat.categoryId}</span>
                                        </div>
                                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>{cat.name}</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            {cat.description || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Không có mô tả</span>}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                                            📖 {itemCount} từ vựng
                                        </span>
                                        <button
                                            onClick={() => setSelectedCategoryForItems(cat)}
                                            style={{
                                                backgroundColor: '#10b981',
                                                color: '#ffffff',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Học ngay ➔
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal hiển thị danh sách từ vựng con */}
                <CategoryItemsModal 
                    category={selectedCategoryForItems}
                    onClose={() => setSelectedCategoryForItems(null)}
                />
            </main>
        </div>
    );
}