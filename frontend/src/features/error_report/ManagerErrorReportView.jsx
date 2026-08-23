import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function ManagerErrorReportView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED

  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      // Lấy danh sách báo cáo lỗi cho Manager (GET /all)
      const response = await fetch(`http://localhost:8080/api/v1/error-reports/all?page=0&size=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setReports(data.data.content || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách báo cáo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  // --- ĐÃ SỬA: Hàm cập nhật trạng thái ---
  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái thành: ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:8080/api/v1/error-reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // CẬP NHẬT STATE: Tạo mảng mới và chèn bản ghi đã update từ Server vào
        setReports(prevReports => 
          prevReports.map(r => 
            r.reportId === reportId ? updatedData.data : r
          )
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Cập nhật trạng thái thất bại!');
      }
    } catch (err) {
      alert('Lỗi mạng khi cập nhật trạng thái');
    }
  };
  // ---------------------------------------

  const filteredReports = activeTab === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === activeTab);

  // Thống kê số lượng theo trạng thái
  const stats = {
    pending: reports.filter(r => r.status === 'PENDING').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header & Thống kê */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Quản lý Báo cáo Lỗi</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Theo dõi và xử lý các vấn đề nội dung do học viên gửi về.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#fef9c3', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #fef08a', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a16207' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ca8a04', textTransform: 'uppercase' }}>Cần xử lý</div>
          </div>
          <div style={{ background: '#e0f2fe', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369a1' }}>{stats.inProgress}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>Đang kiểm tra</div>
          </div>
        </div>
      </div>

      {/* Tabs lọc trạng thái */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab ? '#1e293b' : '#f8fafc',
              color: activeTab === tab ? '#fff' : '#64748b',
              boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            {tab === 'ALL' ? 'Tất cả' : 
             tab === 'PENDING' ? 'Mới gửi' : 
             tab === 'IN_PROGRESS' ? 'Đang xử lý' : 'Đã giải quyết'}
          </button>
        ))}
      </div>

      {/* Danh sách Card hiển thị báo lỗi */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Đang tải dữ liệu...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>Tuyệt vời!</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Không có báo cáo lỗi nào trong mục này.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredReports.map((report) => (
            <div key={report.reportId} style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              
              {/* Card Header (Vị trí & Status Icon) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                    {report.targetType}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>#{report.targetId}</span>
                </div>
                
                {report.status === 'PENDING' && <Clock size={16} color="#ca8a04" />}
                {report.status === 'IN_PROGRESS' && <AlertCircle size={16} color="#0284c7" />}
                {report.status === 'RESOLVED' && <CheckCircle size={16} color="#16a34a" />}
                {report.status === 'REJECTED' && <XCircle size={16} color="#e11d48" />}
                {report.status === 'CANCELLED' && <XCircle size={16} color="#94a3b8" />}
              </div>

              {/* Card Body (Nội dung mô tả của học viên) */}
              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                "{report.description}"
              </div>

              {/* Card Footer (Thông tin & Nút thao tác) */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Học viên: <span style={{ fontWeight: '600', color: '#64748b' }}>{report.studentId}</span><br/>
                  {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                </div>

                {/* Các nút bấm duyệt dành cho Manager/Lecturer */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {report.status === 'PENDING' && (
                    <button 
                      onClick={() => handleUpdateStatus(report.reportId, 'IN_PROGRESS')}
                      style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Tiếp nhận
                    </button>
                  )}
                  
                  {report.status === 'IN_PROGRESS' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'REJECTED')}
                        style={{ padding: '0.5rem', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Từ chối">
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'RESOLVED')}
                        style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Hoàn tất
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}