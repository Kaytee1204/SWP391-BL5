import React from 'react';

export default function RefundInfoView() {
  return (
    <div className="content-card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔄</div>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>Thông Tin Yêu Cầu Hoàn Tiền</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
        Hiện tại chưa có yêu cầu hoàn tiền nào từ học viên.
      </p>
    </div>
  );
}
