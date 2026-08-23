import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { flashcardDeckApi } from '../../../api/flashcardDeckApi'; // Điều chỉnh số lượng dấu ../ nếu cấu trúc thư mục của bạn khác

export default function FlashcardDeckItemsModal({ deck, onClose, onDeckUpdated }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({ word: '', meaning: '', reading: '', itemType: 'vocabulary' });

    // 1. READ: Lấy danh sách từ vựng/thẻ con theo deckId
    const fetchDeckItems = useCallback(async () => {
        if (!deck || !deck.deckId) return;
        setLoading(true);
        try {
            const response = await flashcardDeckApi.getItems(deck.deckId);
            let listItems = [];
            if (Array.isArray(response)) {
                listItems = response;
            } else if (response && Array.isArray(response.data)) {
                listItems = response.data;
            } else if (response && Array.isArray(response.result)) {
                listItems = response.result;
            }
            setItems(listItems);
        } catch (error) {
            console.error("Lỗi khi tải danh sách thẻ con:", error);
        } finally {
            setLoading(false);
        }
    }, [deck]);

    useEffect(() => {
        if (deck) {
            fetchDeckItems();
        }
    }, [deck, fetchDeckItems]);

    if (!deck) return null;

    // 2. CREATE & UPDATE: Xử lý lưu thẻ (Thêm mới hoặc Chỉnh sửa) có kiểm tra trùng từ
    const handleSaveItem = async (e) => {
        e.preventDefault();
        
        const trimmedWord = itemForm.word.trim();

        // Kiểm tra xem từ mới đã tồn tại trong danh sách chưa (tránh trùng lặp)
        const isDuplicate = items.some(item => {
            const currentWord = item.word || item.Word || '';
            // Nếu đang ở chế độ Sửa, cho phép giữ nguyên từ của chính nó
            if (editingItem && (item.itemId === editingItem.itemId || item.ItemType === editingItem.itemType)) {
                return false;
            }
            return currentWord.toLowerCase() === trimmedWord.toLowerCase();
        });

        if (isDuplicate) {
            alert(`Từ vựng "${trimmedWord}" đã tồn tại trong bộ flashcard này! Vui lòng nhập từ khác.`);
            return; // Dừng lại, không cho add mới
        }

        try {
            const payload = {
                deckId: deck.deckId,
                itemType: itemForm.itemType,
                itemId: editingItem ? editingItem.itemId : Date.now(),
                word: trimmedWord,
                meaning: itemForm.meaning.trim(),
                reading: itemForm.reading ? itemForm.reading.trim() : ''
            };

            if (editingItem) {
                await flashcardDeckApi.updateItem(payload);
                alert("Cập nhật từ vựng thành công!");
            } else {
                await flashcardDeckApi.addItem(payload);
                alert("Thêm từ vựng thành công!");
            }

            setIsCreating(false);
            setEditingItem(null);
            setItemForm({ word: '', meaning: '', reading: '', itemType: 'vocabulary' });
            
            fetchDeckItems();
            if (onDeckUpdated) onDeckUpdated();
        } catch (error) {
            console.error("Lỗi khi lưu thẻ:", error);
            alert(error.response?.data?.message || "Không thể lưu thẻ vựng.");
        }
    };
    // 4. DELETE: Xóa thẻ con
    const handleDeleteItem = async (itemType, itemId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi bộ?")) {
            try {
                await flashcardDeckApi.removeItem(deck.deckId, itemType, itemId);
                alert("Đã xóa thành công!");
                fetchDeckItems();
                if (onDeckUpdated) onDeckUpdated();
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Không thể xóa thẻ này.");
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
                width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }} onClick={e => e.stopPropagation()}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>📚 {deck.title}</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{deck.description || 'Không có mô tả'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>Danh sách từ vựng trong bộ ({items.length} thẻ)</h4>
                    {!isCreating && !editingItem && (
                        <button 
                            onClick={() => { setIsCreating(true); setItemForm({ word: '', meaning: '', reading: '', itemType: 'vocabulary' }); }}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Plus size={14} /> Thêm từ mới
                        </button>
                    )}
                </div>

                {(isCreating || editingItem) && (
                    <form onSubmit={handleSaveItem} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h5 style={{ margin: 0, color: '#0f172a' }}>{editingItem ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới vào bộ'}</h5>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Loại (Item Type)</label>
                                <select 
                                    value={itemForm.itemType} 
                                    onChange={(e) => setItemForm({ ...itemForm, itemType: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#fff' }}
                                >
                                    <option value="vocabulary">Vocabulary</option>
                                    <option value="kanji">Kanji</option>
                                </select>
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Từ mới (Max 50 ký tự) *</label>
                                <input 
                                    type="text" 
                                    value={itemForm.word} 
                                    onChange={(e) => setItemForm({ ...itemForm, word: e.target.value })} 
                                    placeholder="Ví dụ: 食べる"
                                    maxLength={50}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Cách đọc (Max 50 ký tự)</label>
                                <input 
                                    type="text" 
                                    value={itemForm.reading} 
                                    onChange={(e) => setItemForm({ ...itemForm, reading: e.target.value })} 
                                    placeholder="Ví dụ: たべる"
                                    maxLength={50}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Nghĩa (Max 50 ký tự) *</label>
                                <input 
                                    type="text" 
                                    value={itemForm.meaning} 
                                    onChange={(e) => setItemForm({ ...itemForm, meaning: e.target.value })} 
                                    placeholder="Ví dụ: Ăn"
                                    maxLength={50}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                            <button type="button" onClick={() => { setIsCreating(false); setEditingItem(null); }} style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Hủy</button>
                            <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>Lưu lại</button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách từ vựng...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        Chưa có từ vựng nào trong bộ này.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map((item, index) => {
                            const displayWord = item.word || item.Word || `Từ vựng #${item.itemId}`;
                            const displayMeaning = item.meaning || item.Meaning || 'Đang cập nhật';
                            const displayReading = item.reading || item.Reading || '';
                            const displayType = item.itemType || item.ItemType || 'vocabulary';
                            const displayItemId = item.itemId || item.ItemId || index;

                            return (
                                <div key={index} style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{displayType}</span>
                                            <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>{displayWord}</span>
                                            {displayReading && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({displayReading})</span>}
                                        </div>
                                        <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                                            Nghĩa: <span style={{ fontWeight: '500', color: '#0f172a' }}>{displayMeaning}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => { setEditingItem(item); setItemForm({ word: displayWord, meaning: displayMeaning, reading: displayReading, itemType: displayType }); setIsCreating(false); }} style={{ padding: '6px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDeleteItem(displayType, displayItemId)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}