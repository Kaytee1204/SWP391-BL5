import React from 'react';

export default function PaymentReportView() {
  return (
    <div className="content-card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>💳</div>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>Revenue & Payment Reports</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
        There are currently no recorded payment transactions in the system.
      </p>
    </div>
  );
}
