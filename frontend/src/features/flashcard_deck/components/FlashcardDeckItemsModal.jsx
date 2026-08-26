import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { flashcardDeckApi } from '../../../api/flashcardDeckApi';

export default function FlashcardDeckItemsModal({ deck, onClose, onDeckUpdated }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({ word: '', meaning: '', reading: '', itemType: 'vocabulary' });

    // 1. READ: Fetch vocabulary/items list by deckId
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
            console.error("Error loading deck items:", error);
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

    // 2. CREATE & UPDATE: Handle saving items with duplicate validation
    const handleSaveItem = async (e) => {
        e.preventDefault();
        
        const trimmedWord = itemForm.word.trim();
        const trimmedMeaning = itemForm.meaning.trim();
        const trimmedReading = itemForm.reading.trim();
        const wordPattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}々ー・]+$/u;
        const readingPattern = /^(?:[\p{L}\p{N}々ー・]+(?:[ \-'\u00a0][\p{L}\p{N}々ー・]+)*)?$/u;

        if (!trimmedWord) {
            alert('Word is required.');
            return;
        }
        if (!wordPattern.test(trimmedWord)) {
            alert('Word may contain only Hiragana, Katakana, and Kanji characters.');
            return;
        }
        if (!trimmedMeaning) {
            alert('Meaning is required.');
            return;
        }
        if (!/^[^\p{Cc}]*$/u.test(trimmedMeaning)) {
            alert('Meaning contains invalid control characters.');
            return;
        }
        if (!readingPattern.test(trimmedReading)) {
            alert('Reading contains invalid characters.');
            return;
        }

        // Check if the word already exists in the list to prevent duplicates
        const isDuplicate = items.some(item => {
            const currentWord = item.word || item.Word || '';
            if (editingItem && (item.itemId === editingItem.itemId || item.ItemType === editingItem.itemType)) {
                return false;
            }
            return currentWord.toLowerCase() === trimmedWord.toLowerCase();
        });

        if (isDuplicate) {
            alert(`The word "${trimmedWord}" already exists in this flashcard deck! Please enter a different word.`);
            return;
        }

        try {
            const payload = {
                deckId: deck.deckId,
                itemType: itemForm.itemType,
                itemId: editingItem ? editingItem.itemId : Date.now(),
                word: trimmedWord,
                meaning: trimmedMeaning,
                reading: trimmedReading || null
            };

            if (editingItem) {
                await flashcardDeckApi.updateItem(payload);
                alert("Vocabulary updated successfully!");
            } else {
                await flashcardDeckApi.addItem(payload);
                alert("Vocabulary added successfully!");
            }

            setIsCreating(false);
            setEditingItem(null);
            setItemForm({ word: '', meaning: '', reading: '', itemType: 'vocabulary' });
            
            fetchDeckItems();
            if (onDeckUpdated) onDeckUpdated();
        } catch (error) {
            console.error("Error saving item:", error);
            alert(error.response?.data?.message || "Failed to save vocabulary card.");
        }
    };

    // 4. DELETE: Remove item
    const handleDeleteItem = async (itemType, itemId) => {
        if (window.confirm("Are you sure you want to delete this vocabulary item from the deck?")) {
            try {
                await flashcardDeckApi.removeItem(deck.deckId, itemType, itemId);
                alert("Deleted successfully!");
                fetchDeckItems();
                if (onDeckUpdated) onDeckUpdated();
            } catch (error) {
                console.error("Error deleting item:", error);
                alert("Failed to delete this card.");
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
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{deck.description || 'No description available'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>Vocabulary List ({items.length} cards)</h4>
                    {!isCreating && !editingItem && (
                        <button 
                            onClick={() => { setIsCreating(true); setItemForm({ word: '', meaning: '', reading: '', itemType: 'vocabulary' }); }}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Plus size={14} /> Add New Word
                        </button>
                    )}
                </div>

                {(isCreating || editingItem) && (
                    <form onSubmit={handleSaveItem} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h5 style={{ margin: 0, color: '#0f172a' }}>{editingItem ? 'Edit Vocabulary' : 'Add New Word to Deck'}</h5>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Item Type</label>
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
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Word (Max 50 chars) *</label>
                                <input 
                                    type="text" 
                                    value={itemForm.word} 
                                    onChange={(e) => setItemForm({ ...itemForm, word: e.target.value })} 
                                    placeholder="e.g. 食べる"
                                    maxLength={50}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Reading (Max 50 chars)</label>
                                <input 
                                    type="text" 
                                    value={itemForm.reading} 
                                    onChange={(e) => setItemForm({ ...itemForm, reading: e.target.value })} 
                                    placeholder="e.g. たべる"
                                    maxLength={50}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Meaning (Max 50 chars) *</label>
                                <input 
                                    type="text" 
                                    value={itemForm.meaning} 
                                    onChange={(e) => setItemForm({ ...itemForm, meaning: e.target.value })} 
                                    placeholder="e.g. To eat"
                                    maxLength={50}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                            <button type="button" onClick={() => { setIsCreating(false); setEditingItem(null); }} style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading vocabulary list...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        No vocabulary cards in this deck yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map((item, index) => {
                            const displayWord = item.word || item.Word || `Word #${item.itemId}`;
                            const displayMeaning = item.meaning || item.Meaning || 'Updating...';
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
                                            Meaning: <span style={{ fontWeight: '500', color: '#0f172a' }}>{displayMeaning}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => { setEditingItem(item); setItemForm({ word: displayWord, meaning: displayMeaning, reading: displayReading, itemType: displayType }); setIsCreating(false); }} style={{ padding: '6px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteItem(displayType, displayItemId)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}