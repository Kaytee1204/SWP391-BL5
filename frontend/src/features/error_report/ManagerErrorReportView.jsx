import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { apiRequest } from '../../api/apiRequest';

export default function ManagerErrorReportView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, REJECTED

  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/error-reports/all?page=0&size=50', 'GET');
      if (data?.data) {
        setReports(data.data.content || []);
      }
    } catch (err) {
      console.error('Error loading reports list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to: ${newStatus}?`)) return;

    try {
      const updatedData = await apiRequest(`/error-reports/${reportId}/status`, 'PATCH', { status: newStatus });
      if (updatedData?.data) {
        setReports(prevReports => 
          prevReports.map(r => 
            r.reportId === reportId ? updatedData.data : r
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update status!');
    }
  };

  const filteredReports = activeTab === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === activeTab);

  const stats = {
    pending: reports.filter(r => r.status === 'PENDING').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Error Reports Management</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Track and manage content issues submitted by students.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#fef9c3', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #fef08a', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a16207' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ca8a04', textTransform: 'uppercase' }}>Pending</div>
          </div>
          <div style={{ background: '#e0f2fe', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369a1' }}>{stats.inProgress}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>In Progress</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#e11d48' }}>{stats.rejected}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#e11d48', textTransform: 'uppercase' }}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(tab => (
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
            {tab === 'ALL' ? 'All' : 
             tab === 'PENDING' ? 'Pending' : 
             tab === 'IN_PROGRESS' ? 'In Progress' : 
             tab === 'RESOLVED' ? 'Resolved' : 'Rejected'}
          </button>
        ))}
      </div>

      {/* Reports List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading data...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>Awesome!</h3>
          <p style={{ color: '#64748b', margin: 0 }}>No error reports found in this category.</p>
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

              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #cbd5e1', wordBreak: 'break-word' }}>
                "{report.description}"
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Student ID: <span style={{ fontWeight: '600', color: '#64748b' }}>{report.studentId}</span><br/>
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>

                {/* Manager Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {report.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'REJECTED')}
                        style={{ padding: '0.5rem', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'IN_PROGRESS')}
                        style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Process
                      </button>
                    </>
                  )}
                  
                  {report.status === 'IN_PROGRESS' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'REJECTED')}
                        style={{ padding: '0.5rem', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(report.reportId, 'RESOLVED')}
                        style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Resolve
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