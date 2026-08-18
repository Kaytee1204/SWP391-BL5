import React from 'react';

export default function PaginationBar({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination-bar">
      <div>
        Page {page + 1} of {totalPages || 1}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          className="page-btn"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
        >
          ‹ Previous
        </button>
        <button
          className="page-btn"
          disabled={page >= (totalPages || 1) - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
