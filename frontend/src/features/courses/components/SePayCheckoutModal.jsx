import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../../api/paymentApi';

/**
 * =========================================================================================
 * SePayCheckoutModal: Modal hiển thị mã VietQR thanh toán & Tự động đối soát giao dịch
 * =========================================================================================
 * Các tính năng chính:
 * 1. Hiển thị mã VietQR động từ SePay chứa đúng cú pháp `SEVQR <orderCode>`.
 * 2. Auto-Polling (Tự động kiểm tra trạng thái mỗi 3 giây):
 *    - Gọi `paymentApi.checkPaymentStatus(orderCode)` ngầm.
 *    - Ngay khi SePay Webhook kích hoạt đơn hàng thành công, modal tự chuyển sang màn hình 🎉 "Thanh toán thành công!".
 * 3. Hỗ trợ nút sao chép nhanh số tài khoản và nội dung chuyển khoản.
 * 4. Nút bấm "Vào học ngay" đưa học viên đến thẳng khóa học vừa mua.
 */
export default function SePayCheckoutModal({ paymentData, onClose, onSuccess, onNavigateLearning }) {
  const [checking, setChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paidInfo, setPaidInfo] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const accountNumber = paymentData?.accountNumber || '103874683969';
  const amount = paymentData?.amount || 0;
  const accountName = paymentData?.accountName || 'TRINH BAO KHANH';

  // 1. Chuẩn hóa nội dung chuyển khoản với tiền tố SEVQR theo quy định của VietinBank & SePay
  let rawContent = paymentData?.transferContent || '';
  if (rawContent.startsWith('JLMS ')) {
    rawContent = 'SEVQR ' + rawContent.substring(5);
  }
  const transferContent = rawContent.startsWith('SEVQR ') 
    ? rawContent 
    : `SEVQR ${paymentData?.orderCode || ''}`;

  // 2. Link ảnh mã QR chuẩn Napas247 từ máy chủ SePay
  const finalQrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=VietinBank&amount=${amount}&des=${encodeURIComponent(transferContent)}&template=compact`;

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * =====================================================================================
   * AUTO-POLLING: TỰ ĐỘNG KIỂM TRA TRẠNG THÁI THANH TOÁN MỖI 3 GIÂY
   * =====================================================================================
   * Khi người dùng quét mã và chuyển tiền trên điện thoại:
   * - Ngân hàng -> SePay -> Webhook Backend đổi status thành "paid".
   * - Polling ở đây bắt được status === 'paid' và lập tức hiển thị màn hình chúc mừng!
   */
  useEffect(() => {
    if (!paymentData?.orderCode || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentApi.checkPaymentStatus(paymentData.orderCode);
        if (res && res.data && res.data.status === 'paid') {
          clearInterval(interval);
          setIsPaid(true);
          setPaidInfo(res.data);
          onSuccess && onSuccess(res.data);
        }
      } catch (err) {
        // Bỏ qua lỗi mạng nhất thời trong quá trình polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentData, isPaid, onSuccess]);

  /**
   * =====================================================================================
   * KIỂM TRA THỦ CÔNG KHI HỌC VIÊN BẤM "TÔI ĐÃ CHUYỂN KHOẢN XONG"
   * =====================================================================================
   */
  const handleManualCheck = async () => {
    if (!paymentData?.orderCode) return;
    setChecking(true);
    try {
      const res = await paymentApi.checkPaymentStatus(paymentData.orderCode);
      if (res && res.data && res.data.status === 'paid') {
        setIsPaid(true);
        setPaidInfo(res.data);
        onSuccess && onSuccess(res.data);
      } else {
        alert('Hệ thống đang chờ SePay xác nhận biến động số dư. Nếu bạn đã chuyển khoản xong, vui lòng đợi 5-10 giây để hệ thống tự động mở khóa nhé!');
      }
    } catch (e) {
      alert('Chưa nhận được xác nhận thanh toán. Vui lòng quét mã QR để chuyển khoản.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px' }}>
        
        {/* ================================================================== */}
        {/* MÀN HÌNH 1: ĐÃ THANH TOÁN THÀNH CÔNG (isPaid === true)            */}
        {/* ================================================================== */}
        {isPaid ? (
          <div style={{ padding: '1.5rem 0.5rem' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginBottom: '0.5rem' }}>
              Thanh Toán Thành Công!
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0.5rem 0 1.5rem' }}>
              SePay đã xác nhận giao dịch thành công. Khóa học <strong>{paymentData?.courseTitle}</strong> đã được kích hoạt vào tài khoản của bạn!
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#166534' }}>Khóa học:</span>
                <strong>{paymentData?.courseTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#166534' }}>Số tiền đã thanh toán:</span>
                <strong style={{ color: '#059669', fontSize: '1rem' }}>{formatVND(amount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#166534' }}>Mã giao dịch SePay:</span>
                <strong style={{ fontFamily: 'monospace' }}>#{paymentData?.orderCode}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-dash btn-dash-secondary"
                onClick={onClose}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn-dash btn-dash-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 800 }}
                onClick={() => {
                  onClose();
                  onNavigateLearning && onNavigateLearning();
                }}
              >
                📖 Vào Học Ngay →
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================== */
          /* MÀN HÌNH 2: HIỂN THỊ MÃ QR CHUYỂN KHOẢN                           */
          /* ================================================================== */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🏦</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  Thanh Toán Khóa Học (SePay VietQR)
                </h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {/* Thông tin Khóa học & Số tiền */}
            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Khóa học:</div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-heading)', display: 'block', margin: '0.2rem 0' }}>
                {paymentData?.courseTitle}
              </strong>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', marginTop: '0.25rem' }}>
                {formatVND(amount)}
              </div>
            </div>

            {/* Khung quét mã QR VietQR */}
            <div style={{ margin: '0.75rem 0' }}>
              <div style={{ padding: '0.75rem', background: '#fff', display: 'inline-block', borderRadius: '16px', border: '2px dashed #059669', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.08)', maxWidth: '320px', width: '100%' }}>
                <img
                  src={finalQrUrl}
                  alt="SePay VietQR Code"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.45rem' }}>
                Mở App MoMo hoặc App Ngân hàng bất kỳ quét mã QR để thanh toán tự động
              </p>
            </div>

            {/* Bảng chi tiết chuyển khoản thủ công */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                <strong style={{ color: '#059669' }}>VietinBank (Ngân hàng TMCP Công thương Việt Nam)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{accountNumber}</strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountNumber, 'acc')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {copiedField === 'acc' ? '✓ Đã chép' : '📋 Chép'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <strong style={{ textTransform: 'uppercase' }}>{accountName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef3c7', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div>
                  <span style={{ color: '#92400e', fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>Nội dung chuyển khoản (Bắt buộc):</span>
                  <strong style={{ color: '#b45309', fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{transferContent}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferContent, 'des')}
                  style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  {copiedField === 'des' ? '✓ Đã chép' : '📋 Chép nội dung'}
                </button>
              </div>
            </div>

            {/* Nhóm nút thao tác */}
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', justifyContent: 'center' }}>
              <button type="button" className="btn-dash btn-dash-secondary" onClick={onClose}>
                Đóng
              </button>
              <button
                type="button"
                className="btn-dash btn-dash-primary"
                onClick={handleManualCheck}
                disabled={checking}
                style={{ background: '#10b981' }}
              >
                {checking ? '⏳ Đang kiểm tra...' : '✅ Tôi Đã Chuyển Khoản Xong'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
