import React, { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../../../api/paymentApi';
import PaginationBar from '../../../components/common/PaginationBar';

export default function PaymentReportView() {
  const [payments, setPayments] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAllPayments({ page, size: 10, sort: 'createdAt,desc' });
      if (res && (res.code === 200 || res.code === 201)) {
        setPayments(res.data.content || []);
        setPageInfo({
          page: res.data.page,
          size: res.data.size,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements
        });
      }
    } catch (e) {
      console.error('Lỗi tải danh sách thanh toán:', e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
      {/* 4 Thẻ thống kê mini */}
      <div className="stats-grid-4">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>💵</div>
          <div>
            <div className="stat-mini-num">{formatVND(totalRevenue)}</div>
            <div className="stat-mini-label">Doanh Thu Trang Này</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>💳</div>
          <div>
            <div className="stat-mini-num">{pageInfo.totalElements}</div>
            <div className="stat-mini-label">Tổng Giao Dịch</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>✅</div>
          <div>
            <div className="stat-mini-num">{paidCount}</div>
            <div className="stat-mini-label">Thành Công (Trang)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>⏳</div>
          <div>
            <div className="stat-mini-num">{pendingCount}</div>
            <div className="stat-mini-label">Chờ Thanh Toán (Trang)</div>
          </div>
        </div>
      </div>

      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>💳 Báo Cáo Doanh Thu & Giao Dịch SePay (VietQR)</h3>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
            Theo dõi dòng tiền và trạng thái đơn hàng thanh toán qua cổng SePay (VietinBank VietQR)
          </div>
        </div>

        <button className="btn-dash btn-dash-secondary" onClick={fetchPayments}>
          🔄 Tải Lại
        </button>
      </div>

      {/* Bảng giao dịch */}
      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Học Viên</th>
              <th>Khóa Học</th>
              <th style={{ textAlign: 'right' }}>Số Tiền</th>
              <th>Mã Đơn Hàng</th>
              <th style={{ textAlign: 'center' }}>Trạng Thái</th>
              <th>Thời Gian</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  ⏳ Đang tải báo cáo giao dịch...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                  <div>Chưa có giao dịch thanh toán nào được ghi nhận trong hệ thống.</div>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.paymentId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <img
                        src={p.studentAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                        alt="avt"
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <div>
                        <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.88rem' }}>
                          {p.studentName || 'Học viên'}
                        </strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.studentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-heading)', fontSize: '0.88rem' }}>
                      {p.courseTitle || `Khóa học #${p.courseId}`}
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
                      {p.status === 'paid' ? 'Đã Thanh Toán' : p.status === 'pending' ? 'Chờ Thanh Toán' : p.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : (p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '-')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
