import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function InlineErrorReport({ targetType, targetId, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả lỗi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt_token');
      const payload = { targetType, targetId, description };

      const response = await fetch('http://localhost:8080/api/v1/error-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 201) {
        alert("Báo cáo lỗi thành công! Quản trị viên sẽ sớm kiểm tra.");
        setIsOpen(false);
        setDescription('');
      } else {
        setError("Có lỗi xảy ra khi gửi báo cáo.");
      }
    } catch (err) {
      setError("Lỗi kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút bấm nhỏ xíu gắn ở bài học */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', color: '#64748b', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseOver={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.background = '#fff1f2'; }}
        onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
      >
        <AlertTriangle size={14} /> Báo lỗi
      </button>

      {/* Modal báo lỗi */}
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                Báo lỗi: <span style={{ color: '#e11d48' }}>{title}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                Vui lòng mô tả chi tiết lỗi (sai chính tả, công thức, dịch thuật...)
              </p>
              <textarea 
                value={description}
                onChange={e => { setDescription(e.target.value); setError(''); }}
                placeholder="Ví dụ: Phần công thức bị gõ sai..."
                rows={4}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '8px', border: `1px solid ${error ? '#e11d48' : '#cbd5e1'}`, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              {error && <div style={{ color: '#e11d48', fontSize: '0.8rem', marginBottom: '12px' }}>{error}</div>}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px', background: '#e11d48', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}