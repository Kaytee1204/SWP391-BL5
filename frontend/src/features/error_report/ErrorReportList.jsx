import React, { useState, useEffect } from 'react';
import { Edit2, XCircle, Clock, CheckCircle, AlertCircle, X, PlusCircle } from 'lucide-react';

export const ErrorReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal Sửa
  const [editingReport, setEditingReport] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [descError, setDescError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // === THÊM MỚI: State cho Modal Tạo Báo Cáo ===
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ targetType: 'GRAMMAR', targetId: '', description: '' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  // ===========================================

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:8080/api/v1/error-reports/my-reports?page=0&size=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setReports(data.data.content || []);
      } else {
        setError(data.message || 'Lỗi khi tải danh sách báo cáo');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // === THÊM MỚI: Hàm xử lý Tạo báo cáo ===
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!createForm.targetId || !createForm.description.trim()) {
      setCreateError('Vui lòng nhập ID nội dung và mô tả lỗi.');
      return;
    }
    setCreateLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        targetType: createForm.targetType,
        targetId: parseInt(createForm.targetId, 10),
        description: createForm.description
      };

      const response = await fetch('http://localhost:8080/api/v1/error-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        // Thêm báo cáo mới vào đầu danh sách
        setReports([data.data, ...reports]); 
        setIsCreateModalOpen(false);
        setCreateForm({ targetType: 'GRAMMAR', targetId: '', description: '' }); // Reset form
        setCreateError('');
      } else {
        setCreateError(data.message || 'Tạo báo cáo thất bại.');
      }
    } catch (err) {
      setCreateError('Lỗi mạng khi tạo báo cáo');
    } finally {
      setCreateLoading(false);
    }
  };
  // =====================================

  const handleCancelReport = async (reportId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy báo cáo này không?')) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:8080/api/v1/error-reports/${reportId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setReports(reports.map(r => r.reportId === reportId ? { ...r, status: 'CANCELLED' } : r));
      } else {
        alert('Lỗi khi hủy báo cáo');
      }
    } catch (err) {
      alert('Lỗi mạng khi hủy báo cáo');
    }
  };

  const handleOpenEditModal = (report) => {
    setEditingReport(report);
    setNewDescription(report.description);
    setDescError('');
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      setDescError('Mô tả không được để trống.');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        targetType: editingReport.targetType,
        targetId: editingReport.targetId,
        description: newDescription
      };

      const response = await fetch(`http://localhost:8080/api/v1/error-reports/${editingReport.reportId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setReports(reports.map(r => r.reportId === editingReport.reportId ? { ...r, description: newDescription } : r));
        setEditingReport(null);
      } else {
        alert('Cập nhật thất bại.');
      }
    } catch (err) {
      alert('Lỗi mạng khi cập nhật');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ background: '#fef9c3', color: '#a16207', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Chờ xử lý</span>;
      case 'IN_PROGRESS':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> Đang kiểm tra</span>;
      case 'RESOLVED':
        return <span style={{ background: '#dcfce3', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Đã giải quyết</span>;
      case 'CANCELLED':
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Đã hủy</span>;
      case 'REJECTED':
        return <span style={{ background: '#fee2e2', color: '#e11d48', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Từ chối</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Lịch sử báo lỗi của bạn</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Theo dõi trạng thái các nội dung bạn đã báo cáo cho quản trị viên.</p>
        </div>

        {/* === NÚT TẠO MỚI === */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)' }}
          onMouseOver={e => e.currentTarget.style.background = '#be123c'}
          onMouseOut={e => e.currentTarget.style.background = '#e11d48'}
        >
          <PlusCircle size={18} /> Tạo báo cáo mới
        </button>
      </div>

      {/* Grid Danh sách Card */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{ color: '#e11d48', background: '#ffe4e6', padding: '1rem', borderRadius: '8px' }}>{error}</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
           <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>Chưa có báo cáo nào</h3>
           <p style={{ color: '#64748b', margin: 0 }}>Bạn chưa gửi báo cáo lỗi nội dung nào lên hệ thống.</p>
         </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {reports.map((report) => (
            <div key={report.reportId} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e2e8f0'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', border: '1px solid #e2e8f0' }}>
                  {report.targetType} #{report.targetId}
                </span>
                {getStatusBadge(report.status)}
              </div>

              <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '1rem', wordBreak: 'break-word' }}>
                {report.description}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginBottom: '1rem' }}>
                Ngày gửi: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
              </div>

              {/* Nút thao tác (Chỉ hiện khi PENDING) */}
              {report.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleOpenEditModal(report)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Sửa
                  </button>
                  <button 
                    onClick={() => handleCancelReport(report.reportId)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <XCircle size={14} /> Hủy bỏ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {/* === MODAL TẠO BÁO CÁO MỚI === */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Tạo báo cáo lỗi mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Loại nội dung (Type)</label>
                  <select 
                    value={createForm.targetType}
                    onChange={(e) => setCreateForm({...createForm, targetType: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
                    <option value="CULTURE_ARTICLE">Văn hóa (Culture Article)</option>
                    <option value="KANJI">Kanji</option>
                    <option value="FLASHCARD">Flashcard</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>ID Nội dung</label>
                  <input 
                    type="number"
                    value={createForm.targetId}
                    onChange={(e) => setCreateForm({...createForm, targetId: e.target.value})}
                    placeholder="Ví dụ: 12"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
                  Mô tả chi tiết lỗi
                </label>
                <textarea 
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  maxLength={1000}
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${createError ? '#e11d48' : '#cbd5e1'}`, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Lỗi chính tả, lỗi dịch thuật, hoặc lỗi hiển thị..."
                />
                {createError && <div style={{ color: '#e11d48', fontSize: '0.8rem', marginTop: '4px' }}>{createError}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={createLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#e11d48', color: 'white', fontWeight: '600', cursor: createLoading ? 'not-allowed' : 'pointer' }}>
                  {createLoading ? 'Đang tạo...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT --- */}
      {editingReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Chỉnh sửa báo cáo</h3>
              <button onClick={() => setEditingReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDescription} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
                  Nội dung lỗi ({editingReport.targetType} #{editingReport.targetId})
                </label>
                <textarea 
                  value={newDescription}
                  onChange={(e) => {
                    setNewDescription(e.target.value);
                    if (e.target.value.length >= 1000) setDescError('Đã chạm giới hạn 1000 ký tự');
                    else setDescError('');
                  }}
                  maxLength={1000}
                  rows={5}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${descError ? '#e11d48' : '#cbd5e1'}`, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Mô tả chi tiết lỗi bạn gặp phải..."
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#e11d48' }}>{descError}</span>
                  <span style={{ color: '#94a3b8' }}>{newDescription.length}/1000</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setEditingReport(null)} disabled={actionLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={actionLoading || descError} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#6d28d9', color: 'white', fontWeight: '600', cursor: actionLoading || descError ? 'not-allowed' : 'pointer', opacity: actionLoading || descError ? 0.7 : 1 }}>
                  {actionLoading ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};