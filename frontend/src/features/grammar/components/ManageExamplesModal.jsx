// src/features/grammar/components/ManageExamplesModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  getExamplesByPatternId, 
  createExample, 
  updateExample, 
  deleteExample 
} from '../../../api/grammarExampleApi';

export default function ManageExamplesModal({ pattern, currentUser, onClose }) {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ sentenceJp: '', translation: '', audioUrl: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State quản lý lỗi hiển thị

  // Quyền thao tác
  const canEdit = currentUser?.role === 'Manager' || 
                 (currentUser?.role === 'Lecturer' && pattern.createdById === currentUser?.accountId);

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
    setErrors({}); // Xóa lỗi khi reset
  };

  const handleEditClick = (example) => {
    setEditingId(example.exampleId);
    setFormData({
      sentenceJp: example.sentenceJp,
      translation: example.translation,
      audioUrl: example.audioUrl || ''
    });
    setErrors({}); // Xóa lỗi cũ khi bấm sửa
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sentenceJp.trim()) {
      newErrors.sentenceJp = 'Câu tiếng Nhật không được để trống.';
    } else if (formData.sentenceJp.length > 150) {
      newErrors.sentenceJp = 'Câu tiếng Nhật không được vượt quá 150 ký tự.';
    }

    if (!formData.translation.trim()) {
      newErrors.translation = 'Bản dịch không được để trống.';
    } else if (formData.translation.length > 150) {
      newErrors.translation = 'Bản dịch không được vượt quá 150 ký tự.';
    }

    if (formData.audioUrl.trim()) {
      if (formData.audioUrl.length > 500) {
        newErrors.audioUrl = 'Đường dẫn âm thanh không được vượt quá 500 ký tự.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate trước khi gọi API
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
        
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#334155' }}>
            📖 Ví dụ cho mẫu: <span style={{ color: '#7C3AED' }}>{pattern.title}</span>
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8'
          }}>
            &times;
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          
          {/* Form Thêm/Sửa */}
          {canEdit && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>
                {editingId ? '✏️ Cập nhật câu ví dụ' : '➕ Thêm câu ví dụ mới'}
              </h4>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Input Câu tiếng Nhật */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.sentenceJp ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Câu tiếng Nhật (VD: 彼は先生です)" 
                    value={formData.sentenceJp}
                    maxLength={150}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, sentenceJp: val});
                      if (val.length >= 150) {
                        setErrors({...errors, sentenceJp: 'Đã đạt giới hạn 150 ký tự. Vui lòng nhập ngắn gọn hơn.'});
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

                {/* Input Bản dịch */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.translation ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Bản dịch tiếng Việt (VD: Anh ấy là giáo viên)" 
                    value={formData.translation}
                    maxLength={150}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, translation: val});
                      if (val.length >= 150) {
                        setErrors({...errors, translation: 'Đã đạt giới hạn 150 ký tự. Vui lòng nhập ngắn gọn hơn.'});
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

                {/* Input Audio URL */}
                <div>
                  <input 
                    className="form-input"
                    style={{ width: '100%', borderColor: errors.audioUrl ? '#e11d48' : '#e2e8f0' }}
                    placeholder="Link file âm thanh (Audio URL - Tùy chọn)" 
                    value={formData.audioUrl}
                    maxLength={500}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({...formData, audioUrl: val});
                      if (val.length >= 500) {
                        setErrors({...errors, audioUrl: 'Đã đạt giới hạn 500 ký tự.'});
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
                      Hủy
                    </button>
                  )}
                  <button type="submit" disabled={formLoading} className="btn-dash btn-dash-primary" style={{ background: '#7C3AED', color: '#fff' }}>
                    {formLoading ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Danh sách ví dụ */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải danh sách ví dụ...</div>
          ) : error ? (
            <div style={{ color: '#e11d48', padding: '1rem', textAlign: 'center' }}>{error}</div>
          ) : examples.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có câu ví dụ nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {examples.map((ex, index) => (
                <div key={ex.exampleId} style={{ 
                  padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  width: '100%', boxSizing: 'border-box'
                }}>
                  {/* Nội dung text áp dụng CSS word-break để không phá layout */}
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
                    <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                      {ex.translation}
                    </div>
                    {ex.audioUrl && (
                      <audio controls src={ex.audioUrl} style={{ height: '30px', marginTop: '0.5rem', maxWidth: '100%' }} />
                    )}
                  </div>

                  {canEdit && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => handleEditClick(ex)} style={{ 
                        border: 'none', background: '#fef3c7', color: '#d97706', 
                        padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}>
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(ex.exampleId)} style={{ 
                        border: 'none', background: '#fee2e2', color: '#e11d48', 
                        padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}>
                        Xóa
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