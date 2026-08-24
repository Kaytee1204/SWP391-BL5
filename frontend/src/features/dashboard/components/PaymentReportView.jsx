import React, { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../../../api/paymentApi';
import PaginationBar from '../../../components/common/PaginationBar';
import { Search, RotateCcw, X } from 'lucide-react';

export default function PaymentReportView() {
  const [payments, setPayments] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Gọi API Backend: GET /payments?keyword=...&page=...&size=10&sort=createdAt,desc
  const fetchPayments = useCallback(async (currentPage = page, searchKeyword = keyword) => {
    try {
      setLoading(true);
      const res = await paymentApi.getAllPayments({
        keyword: searchKeyword,
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc'
      });

      if (res && (res.code === 200 || res.code === 201) && res.data) {
        // Hỗ trợ cả PageResponse { content, page, size, totalPages, totalElements }
        // và Spring Page { content, number, size, totalPages, totalElements }
        const raw = res.data;
        const items = Array.isArray(raw)
          ? raw
          : (raw.content || raw.pageData?.content || []);

        const pageNum = raw.page !== undefined
          ? raw.page
          : (raw.number !== undefined ? raw.number : currentPage);

        const pageSize = raw.size || 10;
        const totalElems = raw.totalElements !== undefined
          ? raw.totalElements
          : (raw.pageData?.totalElements !== undefined ? raw.pageData.totalElements : items.length);

        const totalPgs = raw.totalPages !== undefined
          ? raw.totalPages
          : (raw.pageData?.totalPages !== undefined ? raw.pageData.totalPages : Math.max(1, Math.ceil(totalElems / pageSize)));

        setPayments(items);
        setPageInfo({
          page: pageNum,
          size: pageSize,
          totalPages: totalPgs,
          totalElements: totalElems
        });
      }
    } catch (e) {
      console.error('Error loading payments from backend:', e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPayments(0, keyword);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setPage(0);
    fetchPayments(0, '');
  };

  useEffect(() => {
    fetchPayments(page, keyword);
  }, [page]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="content-card">
      {/* 4 Mini Stat Cards */}
      <div className="stats-grid-4">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>💵</div>
          <div>
            <div className="stat-mini-num">{formatVND(totalRevenue)}</div>
            <div className="stat-mini-label">Page Revenue</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>💳</div>
          <div>
            <div className="stat-mini-num">{pageInfo.totalElements}</div>
            <div className="stat-mini-label">Total Records</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>✅</div>
          <div>
            <div className="stat-mini-num">{paidCount}</div>
            <div className="stat-mini-label">Paid (Page)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>⏳</div>
          <div>
            <div className="stat-mini-num">{pendingCount}</div>
            <div className="stat-mini-label">Pending (Page)</div>
          </div>
        </div>
      </div>

      {/* Header & Search Bar */}
      <div className="card-header-row" style={{ marginTop: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>💳 Payment Transactions History</h3>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
            Newest transactions first • Direct from database
          </div>
        </div>

        {/* Search by Student Name & Action */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search student name, email, or order #..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '32px', paddingRight: keyword ? '30px' : '10px', fontSize: '0.85rem' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            {keyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </form>

          <button 
            type="button"
            className="btn-dash btn-dash-primary"
            onClick={handleSearchSubmit}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            Search
          </button>

          <button 
            className="btn-dash btn-dash-secondary" 
            onClick={() => fetchPayments(page, keyword)} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
            title="Refresh list"
          >
            <RotateCcw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Payment Records Table with STT (#) */}
      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ width: '50px', textAlign: 'center' }}>#</th>
              <th>Student</th>
              <th>Course</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Order Code</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Created / Paid Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  ⏳ Loading database payment records...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                  <div style={{ fontWeight: 700, color: '#475569' }}>
                    {keyword ? `No payment records matching "${keyword}".` : 'No payment records found in database.'}
                  </div>
                  {keyword && (
                    <button
                      onClick={handleClearSearch}
                      className="btn-dash btn-dash-secondary"
                      style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}
                    >
                      Clear Search
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              payments.map((p, index) => {
                const stt = page * (pageInfo.size || 10) + index + 1;

                return (
                  <tr key={p.paymentId || index}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>
                      {stt}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <img
                          src={p.studentAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                          alt="avt"
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.88rem' }}>
                            {p.studentName || 'Student'}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-heading)', fontSize: '0.88rem' }}>
                        {p.courseTitle || `Course #${p.courseId}`}
                      </strong>
                      {p.courseJlptLevel && (
                        <span style={{ marginLeft: '0.5rem', background: '#ede9fe', color: '#7c3aed', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {p.courseJlptLevel}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>
                      {formatVND(p.amount)}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                      #{p.orderCode}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${p.status === 'paid' ? 'active' : p.status === 'pending' ? 'pending' : 'inactive'}`}>
                        {p.status === 'paid' ? 'Paid' : p.status === 'pending' ? 'Pending' : p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleString('en-US') : (p.createdAt ? new Date(p.createdAt).toLocaleString('en-US') : '-')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchPayments(newPage, keyword);
        }}
      />
    </div>
  );
}
