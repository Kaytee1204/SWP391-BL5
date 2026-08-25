import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, Search, RefreshCw, Filter, MessageSquare, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../api/apiRequest';

export default function ManagerErrorReportView({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState('ALL');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/error-reports/all?page=0&size=100', 'GET');
      if (data?.data) {
        setReports(data.data.content || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Lỗi khi tải danh sách báo cáo: ' + (err.message || '') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    const actionName = 
      newStatus === 'IN_PROGRESS' ? 'Tiếp nhận xử lý' :
      newStatus === 'RESOLVED' ? 'Đánh dấu Đã giải quyết' :
      newStatus === 'REJECTED' ? 'Từ chối báo cáo' : newStatus;

    if (!window.confirm(`Bạn có chắc muốn ${actionName} cho báo cáo #${reportId}?`)) return;

    let reviewerNote = '';
    if (newStatus === 'RESOLVED' || newStatus === 'REJECTED') {
      reviewerNote = window.prompt(
        newStatus === 'RESOLVED'
          ? 'Nhập phản hồi cho học viên về việc xử lý báo cáo:'
          : 'Nhập lý do từ chối báo cáo:'
      )?.trim() || '';
      if (!reviewerNote) {
        setFeedback({ type: 'error', msg: 'Bạn phải nhập phản hồi trước khi hoàn tất thao tác.' });
        return;
      }
      if (reviewerNote.length > 500 || /[\u0000-\u001F\u007F<>]/.test(reviewerNote)) {
        setFeedback({ type: 'error', msg: 'Phản hồi tối đa 500 ký tự và không được chứa ký tự không hợp lệ.' });
        return;
      }
    }

    try {
      const updatedData = await apiRequest(`/error-reports/${reportId}/status`, 'PATCH', {
        status: newStatus,
        reviewerNote: reviewerNote || null
      });
      if (updatedData?.data) {
        setReports(prevReports => 
          prevReports.map(r => 
            r.reportId === reportId ? updatedData.data : r
          )
        );
        setFeedback({ type: 'success', msg: `Cập nhật trạng thái báo cáo #${reportId} thành công!` });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Cập nhật trạng thái thất bại!' });
    }
  };

  // Target types available in reports
  const targetTypes = useMemo(() => {
    const set = new Set(reports.map(r => r.targetType).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Tab status filter
      if (activeTab !== 'ALL' && r.status !== activeTab) return false;
      // Target type filter
      if (selectedTargetType !== 'ALL' && r.targetType !== selectedTargetType) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (r.description || '').toLowerCase().includes(q);
        const targetTypeMatch = (r.targetType || '').toLowerCase().includes(q);
        const targetIdMatch = String(r.targetId || '').includes(q);
        const studentMatch = String(r.studentId || '').includes(q);
        if (!descMatch && !targetTypeMatch && !targetIdMatch && !studentMatch) return false;
      }
      return true;
    });
  }, [reports, activeTab, selectedTargetType, searchQuery]);

  const stats = {
    pending: reports.filter(r => r.status === 'PENDING').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: '⏳ Chờ xử lý' };
      case 'IN_PROGRESS':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: '🔄 Đang xử lý' };
      case 'RESOLVED':
        return { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: '✅ Đã giải quyết' };
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: '❌ Đã từ chối' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Stats Banner */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
                Quản lý Báo cáo Lỗi Nội dung (Error Reports)
              </h2>
              <span style={{
                background: '#ffe4e6',
                color: '#e11d48',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1px solid #fecdd3'
              }}>
                {reports.length} Báo cáo
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Theo dõi và tiếp nhận xử lý các phản ánh lỗi câu hỏi, bài học, từ vựng hoặc ngữ pháp từ học viên
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAllReports}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} /> Tải lại dữ liệu
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div
            onClick={() => setActiveTab('PENDING')}
            style={{
              background: activeTab === 'PENDING' ? '#fef08a' : '#fef9c3',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'PENDING' ? '#eab308' : '#fef08a'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a16207' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase', marginTop: '2px' }}>
              ⏳ Chờ xử lý (Pending)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('IN_PROGRESS')}
            style={{
              background: activeTab === 'IN_PROGRESS' ? '#bae6fd' : '#e0f2fe',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'IN_PROGRESS' ? '#0284c7' : '#bae6fd'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>{stats.inProgress}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginTop: '2px' }}>
              🔄 Đang xử lý (In Progress)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('RESOLVED')}
            style={{
              background: activeTab === 'RESOLVED' ? '#bbf7d0' : '#dcfce7',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'RESOLVED' ? '#22c55e' : '#bbf7d0'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{stats.resolved}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginTop: '2px' }}>
              ✅ Đã giải quyết (Resolved)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('REJECTED')}
            style={{
              background: activeTab === 'REJECTED' ? '#fecaca' : '#fee2e2',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'REJECTED' ? '#ef4444' : '#fecaca'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e11d48' }}>{stats.rejected}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', marginTop: '2px' }}>
              ❌ Đã từ chối (Rejected)
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isActive ? '#0f172a' : '#cbd5e1',
                    background: isActive ? '#0f172a' : '#fff',
                    color: isActive ? '#fff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab === 'ALL' ? 'Tất cả' :
                   tab === 'PENDING' ? 'Chờ xử lý' :
                   tab === 'IN_PROGRESS' ? 'Đang xử lý' :
                   tab === 'RESOLVED' ? 'Đã giải quyết' : 'Đã từ chối'}
                </button>
              );
            })}
          </div>

          {/* Search & Target Type Filter */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: '1 1 360px', justifyContent: 'flex-end' }}>
            {targetTypes.length > 2 && (
              <div style={{ minWidth: '150px' }}>
                <select
                  value={selectedTargetType}
                  onChange={(e) => setSelectedTargetType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {targetTypes.map(t => (
                    <option key={t} value={t}>
                      {t === 'ALL' ? '-- Mọi loại đối tượng --' : t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ position: 'relative', minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Tìm nội dung lỗi, học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

        </div>

      </div>

      {/* Feedback message */}
      {feedback.msg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: 600,
          background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : '#86efac'}`
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Reports List Grid */}
      {loading ? (
        <div style={{ background: '#fff', padding: '3.5rem', textAlign: 'center', color: '#64748b', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          ⏳ Đang tải dữ liệu báo cáo lỗi...
        </div>
      ) : filteredReports.length === 0 ? (
        <div style={{
          background: '#fff',
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          color: '#64748b',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Không có báo cáo lỗi nào trong danh mục này
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.4rem 0 0' }}>
            Hệ thống đang hoạt động trơn tru và chưa có báo cáo lỗi chưa xử lý!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredReports.map((report) => {
            const statusBadge = getStatusBadge(report.status);
            return (
              <div
                key={report.reportId}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                
                {/* Card Top: Target Type & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      background: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#475569',
                      border: '1px solid #e2e8f0'
                    }}>
                      {report.targetType}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
                      #{report.targetId}
                    </span>
                  </div>

                  <span style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    background: statusBadge.bg,
                    color: statusBadge.text,
                    border: `1px solid ${statusBadge.border}`
                  }}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Description Box */}
                <div style={{
                  color: '#1e293b',
                  fontSize: '0.92rem',
                  lineHeight: '1.55',
                  flexGrow: 1,
                  background: '#f8fafc',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  borderLeft: '4px solid #94a3b8',
                  wordBreak: 'break-word'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    Nội dung phản ánh của học viên:
                  </div>
                  "{report.description}"
                </div>

                {report.reviewerNote && (
                  <div style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem', borderLeft: '3px solid #94a3b8', paddingLeft: '0.75rem' }}>
                    <strong>Phản hồi đã gửi:</strong> {report.reviewerNote}
                  </div>
                )}

                {/* Card Footer: Metadata & Action Buttons */}
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Học viên: <strong style={{ color: '#475569' }}>ID {report.studentId}</strong>
                    <div style={{ marginTop: '1px' }}>
                      {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : ''}
                    </div>
                  </div>

                  {/* Manager / Lecturer Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {report.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(report.reportId, 'REJECTED')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.4rem 0.75rem',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Từ chối báo cáo"
                        >
                          <XCircle size={13} /> Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(report.reportId, 'IN_PROGRESS')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.4rem 0.85rem',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                          }}
                        >
                          <AlertCircle size={13} /> Tiếp nhận
                        </button>
                      </>
                    )}
                    
                    {report.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(report.reportId, 'REJECTED')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.4rem 0.75rem',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Từ chối báo cáo"
                        >
                          <XCircle size={13} /> Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(report.reportId, 'RESOLVED')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.4rem 0.85rem',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                          }}
                        >
                          <CheckCircle size={13} /> Giải quyết xong
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}