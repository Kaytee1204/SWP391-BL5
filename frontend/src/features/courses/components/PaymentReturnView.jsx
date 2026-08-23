import React, { useEffect, useState } from 'react';
import { paymentApi } from '../../../api/paymentApi';
import Navbar from '../../../components/common/Navbar';

export default function PaymentReturnView({
  currentUser,
  onNavigate,
  onViewProfile,
  onLogout
}) {
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderCode = urlParams.get('orderCode');

    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng thanh toán.');
      setLoading(false);
      return;
    }

    paymentApi.verifyPaymentReturn(orderCode)
      .then((res) => {
        if (res && res.data) {
          setPaymentResult(res.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Lỗi khi xác thực kết quả thanh toán từ SePay.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Navbar
        currentView="courses"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#fff', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Đang xác thực giao dịch SePay (VietQR)...</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Vui lòng đợi giây lát trong khi hệ thống kích hoạt khóa học của bạn.</p>
            </div>
          ) : error ? (
            <div>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48' }}>Xác Thực Thanh Toán Thất Bại</h3>
              <p style={{ color: 'var(--text-body)', marginTop: '0.5rem' }}>{error}</p>
              <button className="btn-primary-purple" style={{ marginTop: '1.5rem' }} onClick={() => onNavigate('courses')}>
                Quay Lại Danh Mục Khóa Học
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginBottom: '0.5rem' }}>
                Thanh Toán Thành Công!
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
                Cảm ơn bạn đã mua khóa học trên JLMS. Khóa học đã được mở khóa và sẵn sàng để học.
              </p>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '1.5rem 0', textAlign: 'left' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>Khóa học:</strong> {paymentResult?.courseTitle}</div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Số tiền:</strong> <span style={{ color: '#7c3aed', fontWeight: 800 }}>{formatVND(paymentResult?.amount)}</span></div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Mã đơn hàng:</strong> #{paymentResult?.orderCode}</div>
                <div><strong>Trạng thái:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>Đã thanh toán (Active)</span></div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-secondary-glass" onClick={() => onNavigate('courses')}>
                  Xem Khóa Học Khác
                </button>
                <button className="btn-primary-purple" onClick={() => onNavigate('kanji')}>
                  Vào Học Ngay →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
