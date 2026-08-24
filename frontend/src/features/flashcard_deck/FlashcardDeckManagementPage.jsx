import React, { useState, useEffect, useCallback } from 'react';
import { flashcardDeckApi } from '../../api/flashcardDeckApi';
import { vocabularyCategoryApi } from '../../api/vocabularyCategoryApi';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FlashcardDeckItemsModal from './components/FlashcardDeckItemsModal';

export default function FlashcardDeckManagementPage({ currentUser }) {
  const [decks, setDecks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // State for vocabulary categories dropdown
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // State for viewing nested items inside a deck
  const [selectedDeckForItems, setSelectedDeckForItems] = useState(null);

  // Fetch flashcard decks list
  const fetchDecks = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const response = await flashcardDeckApi.getAll({ page: currentPage, size: 12, sortBy: 'createdAt', direction: 'DESC' });
      if (response) {
        setDecks(response.content || []);
        setTotalPages(response.totalPages || 0);
        setPage(response.number || 0);
      }
    } catch (error) {
      console.error("Error loading flashcard decks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vocabulary categories for dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await vocabularyCategoryApi.getAll();
      if (response && (response.code === 200 || response.code === 201)) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error loading vocabulary categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchDecks(0);
    fetchCategories();
  }, [fetchDecks, fetchCategories]);

  const handleAddNew = () => {
    setEditingDeck(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (deck) => {
    setEditingDeck(deck);
    setFormData({ title: deck.title || '', description: deck.description || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (deckId) => {
    if (window.confirm("Are you sure you want to delete this Flashcard Deck?")) {
      try {
        await flashcardDeckApi.delete(deckId);
        fetchDecks(page);
      } catch (error) {
        console.error("Error deleting deck:", error);
        alert(error.response?.data?.message || "Failed to delete this flashcard deck. Please check your login credentials.");
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title.trim()) {
      alert("Please select or enter a title for the Flashcard Deck!");
      return;
    }

    if (formData.description && formData.description.length > 200) {
      alert("Description cannot exceed 200 characters! Please enter a shorter description.");
      return;
    }

    try {
      if (editingDeck) {
        await flashcardDeckApi.update(editingDeck.deckId, formData);
      } else {
        await flashcardDeckApi.create(formData);
      }

      setIsModalOpen(false);
      fetchDecks(0);
    } catch (error) {
      console.error("Error saving data:", error);
      alert(error.response?.data?.message || "Unauthorized or invalid token.");
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>System Flashcard Decks Management</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Add, update, and manage standardized learning deck packages for students</p>
        </div>
        <button 
          type="button"
          onClick={handleAddNew}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus size={18} /> Add Deck
        </button>
      </div>

      {/* Modern Cards Grid View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading data...</div>
      ) : decks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
          No flashcard decks created yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {decks.map((deck) => {
            const itemCount = deck.items ? deck.items.length : 0;
            return (
              <div 
                key={deck.deckId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e40af', backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '999px' }}>SYSTEM DECK</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{deck.deckId}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{deck.title}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {deck.description || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>No description</span>}
                  </p>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedDeckForItems(deck)}
                    style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    📚 View ({itemCount} cards)
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(deck)} style={{ padding: '6px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(deck.deckId)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Page {page + 1} of {totalPages || 1}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            disabled={page === 0}
            onClick={() => fetchDecks(page - 1)}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <button 
            disabled={page + 1 >= totalPages}
            onClick={() => fetchDecks(page + 1)}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: page + 1 >= totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {editingDeck ? 'Edit Flashcard Deck' : 'Add New Flashcard Deck'}
            </h3>
            
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Deck Title *</label>
                <select 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="">-- Select or link a category --</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId || cat.id} value={cat.name}>
                      [{cat.jlptLevel}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Description</label>
                  <span style={{ fontSize: '0.75rem', color: formData.description.length > 200 ? '#dc2626' : '#64748b' }}>
                    {formData.description.length}/200 chars
                  </span>
                </div>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Short description for this deck..." 
                  rows={3}
                  maxLength={200}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingDeck ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NESTED ITEMS MODAL */}
      <FlashcardDeckItemsModal 
        deck={selectedDeckForItems}
        onClose={() => setSelectedDeckForItems(null)}
      />
    </div>
  );
}