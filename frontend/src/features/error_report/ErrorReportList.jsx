import React, { useState, useEffect } from 'react';
import { Edit2, XCircle, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { apiRequest } from '../../api/apiRequest';

export const ErrorReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Edit Modal
  const [editingReport, setEditingReport] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [descError, setDescError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/error-reports/my-reports?page=0&size=50', 'GET');
      if (data?.data) {
        setReports(data.data.content || []);
      } else {
        setError('Failed to load error reports');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to cancel this report?')) return;
    
    try {
      await apiRequest(`/error-reports/${reportId}/cancel`, 'PATCH');
      setReports(reports.map(r => r.reportId === reportId ? { ...r, status: 'CANCELLED' } : r));
    } catch (err) {
      alert(err.message || 'Error cancelling report');
    }
  };

  const handleOpenEditModal = (report) => {
    setEditingReport(report);
    setNewDescription(report.description);
    setDescError('');
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    const description = newDescription.trim();
    if (!description) {
      setDescError('Description cannot be empty.');
      return;
    }
    if (description.length > 500) {
      setDescError('Description cannot exceed 500 characters.');
      return;
    }
    if (!/^[^\p{Cc}<>]*$/u.test(description)) {
      setDescError('Description contains invalid characters.');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        targetType: editingReport.targetType,
        targetId: editingReport.targetId,
        description
      };

      await apiRequest(`/error-reports/${editingReport.reportId}`, 'PUT', payload);
      setReports(reports.map(r => r.reportId === editingReport.reportId ? { ...r, description } : r));
      setEditingReport(null);
    } catch (err) {
      alert(err.message || 'Network error while updating');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ background: '#fef9c3', color: '#a16207', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>;
      case 'IN_PROGRESS':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> In Progress</span>;
      case 'RESOLVED':
        return <span style={{ background: '#dcfce3', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Resolved</span>;
      case 'CANCELLED':
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Cancelled</span>;
      case 'REJECTED':
        return <span style={{ background: '#fee2e2', color: '#e11d48', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Your Error Report History</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Track the status of content issues you have reported to administrators.</p>
        </div>

      </div>

      {/* Cards List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Loading data...</div>
      ) : error ? (
        <div style={{ color: '#e11d48', background: '#ffe4e6', padding: '1rem', borderRadius: '8px' }}>{error}</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
           <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No Reports Found</h3>
           <p style={{ color: '#64748b', margin: 0 }}>You haven't submitted any content error reports to the system yet.</p>
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

              {report.reviewerNote && (
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #64748b', padding: '0.6rem 0.75rem', marginBottom: '1rem', color: '#475569', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                  <strong>Reviewer response:</strong> {report.reviewerNote}
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginBottom: '1rem' }}>
                Submitted on: {new Date(report.createdAt).toLocaleDateString()}
              </div>

              {report.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleOpenEditModal(report)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleCancelReport(report.reportId)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Edit Report</h3>
              <button onClick={() => setEditingReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDescription} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
                  Report Details ({editingReport.targetType} #{editingReport.targetId})
                </label>
                <textarea 
                  value={newDescription}
                  onChange={(e) => {
                    setNewDescription(e.target.value);
                    if (e.target.value.length >= 500) setDescError('Reached 500 character limit');
                    else setDescError('');
                  }}
                  maxLength={500}
                  rows={5}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${descError ? '#e11d48' : '#cbd5e1'}`, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Describe the issue in detail..."
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#e11d48' }}>{descError}</span>
                  <span style={{ color: '#94a3b8' }}>{newDescription.length}/500</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setEditingReport(null)} disabled={actionLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading || descError} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#6d28d9', color: 'white', fontWeight: '600', cursor: actionLoading || descError ? 'not-allowed' : 'pointer', opacity: actionLoading || descError ? 0.7 : 1 }}>
                  {actionLoading ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};