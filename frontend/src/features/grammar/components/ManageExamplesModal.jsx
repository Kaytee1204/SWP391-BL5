// src/features/grammar/components/ManageExamplesModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  getExamplesByPatternId, 
  createExample, 
  updateExample, 
  deleteExample 
} from '../../../api/grammarExampleApi';
import { playAudio } from '../../../utils/audioHelper';
import { Volume2 } from 'lucide-react';

export default function ManageExamplesModal({ pattern, currentUser, onClose }) {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ sentenceJp: '', translation: '', audioUrl: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Permissions
  const canEdit = currentUser?.role === 'Manager' || currentUser?.role === 'Lecturer';

  useEffect(() => {
    fetchExamples();
  }, [pattern.patternId]);

  const fetchExamples = async () => {
    setLoading(true);
    try {
      const res = await getExamplesByPatternId(pattern.patternId);
      setExamples(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch examples.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ sentenceJp: '', translation: '', audioUrl: '' });
    setErrors({});
  };

  const handleEditClick = (example) => {
    setEditingId(example.exampleId);
    setFormData({
      sentenceJp: example.sentenceJp,
      translation: example.translation,
      audioUrl: example.audioUrl || ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sentenceJp.trim()) {
      newErrors.sentenceJp = 'Japanese sentence cannot be empty.';
    } else if (formData.sentenceJp.length > 150) {
      newErrors.sentenceJp = 'Japanese sentence cannot exceed 150 characters.';
    }

    if (!formData.translation.trim()) {
      newErrors.translation = 'Translation cannot be empty.';
    } else if (formData.translation.length > 150) {
      newErrors.translation = 'Translation cannot exceed 150 characters.';
    }

    if (formData.audioUrl.trim()) {
      if (formData.audioUrl.length > 500) {
        newErrors.audioUrl = 'Audio URL cannot exceed 500 characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; 
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await updateExample(editingId, formData);
      } else {
        await createExample(pattern.patternId, formData);
      }
      resetForm();
      fetchExamples();
    } catch (err) {
      alert(`Error saving example: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (exampleId) => {
    if (!window.confirm('Are you sure you want to delete this example?')) return;
    
    try {
      await deleteExample(exampleId);
      setExamples(prev => prev.filter(ex => ex.exampleId !== exampleId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ 
        width: '90%', maxWidth: '800px', maxHeight: '90vh', 
        display: 'flex', flexDirection: 'column', padding: '1.5rem',
        backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#334155' }}>
            📖 Examples for Pattern: <span style={{ color: '#7C3AED' }}>{pattern.title}</span>
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8'
          }}>
            &times;
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          
          {/* Add/Edit Form */}
          {canEdit && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>
                {editingId ? '✏️ Edit Example' : '➕ Add New Example'}
              </h4>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Japanese Sentence Input */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.sentenceJp ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Japanese sentence (e.g., 彼は先生です)" 
                    value={formData.sentenceJp}
                    maxLength={150}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, sentenceJp: val});
                      if (val.length >= 150) {
                        setErrors({...errors, sentenceJp: 'Character limit of 150 reached.'});
                      } else if (errors.sentenceJp) {
                        setErrors({...errors, sentenceJp: null});
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', minHeight: '18px' }}>
                    <span style={{ color: '#e11d48', fontSize: '0.75rem' }}>{errors.sentenceJp || ''}</span>
                    <span style={{ fontSize: '0.75rem', color: formData.sentenceJp.length >= 150 ? '#e11d48' : '#94a3b8' }}>
                      {formData.sentenceJp.length}/150
                    </span>
                  </div>
                </div>

                {/* Translation Input */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.translation ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Translation (e.g., He is a teacher)" 
                    value={formData.translation}
                    maxLength={150}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, translation: val});
                      if (val.length >= 150) {
                        setErrors({...errors, translation: 'Character limit of 150 reached.'});
                      } else if (errors.translation) {
                        setErrors({...errors, translation: null});
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', minHeight: '18px' }}>
                    <span style={{ color: '#e11d48', fontSize: '0.75rem' }}>{errors.translation || ''}</span>
                    <span style={{ fontSize: '0.75rem', color: formData.translation.length >= 150 ? '#e11d48' : '#94a3b8' }}>
                      {formData.translation.length}/150
                    </span>
                  </div>
                </div>

                {/* Audio URL Input */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.audioUrl ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Audio URL (Optional)" 
                    value={formData.audioUrl}
                    maxLength={500}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, audioUrl: val});
                      if (val.length >= 500) {
                        setErrors({...errors, audioUrl: 'Character limit of 500 reached.'});
                      } else if (errors.audioUrl) {
                        setErrors({...errors, audioUrl: null});
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', minHeight: '18px' }}>
                    <span style={{ color: '#e11d48', fontSize: '0.75rem' }}>{errors.audioUrl || ''}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="btn-dash" style={{ background: '#e2e8f0' }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={formLoading} className="btn-dash btn-dash-primary" style={{ background: '#7C3AED', color: '#fff' }}>
                    {formLoading ? 'Saving...' : (editingId ? 'Update' : 'Add New')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Examples List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading examples list...</div>
          ) : error ? (
            <div style={{ color: '#e11d48', padding: '1rem', textAlign: 'center' }}>{error}</div>
          ) : examples.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No examples found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {examples.map((ex, index) => (
                <div key={ex.exampleId} style={{ 
                  padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  width: '100%', boxSizing: 'border-box'
                }}>
                  <div style={{ 
                    flex: 1, 
                    marginRight: '1rem', 
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word', 
                    whiteSpace: 'pre-wrap' 
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.3rem' }}>
                      {index + 1}. {ex.sentenceJp}
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {ex.translation}
                    </div>

                    {/* Nút Listen / Phát âm */}
                    <button 
                      onClick={() => playAudio(ex.audioUrl, ex.sentenceJp)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                  </div>

                  {canEdit && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => handleEditClick(ex)} style={{ 
                        border: 'none', background: '#fef3c7', color: '#d97706', 
                        padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(ex.exampleId)} style={{ 
                        border: 'none', background: '#fee2e2', color: '#e11d48', 
                        padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}