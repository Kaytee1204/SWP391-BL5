import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { AVATAR_PRESETS, ROLES } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import CreateAccountModal from './components/CreateAccountModal';
import EditAccountModal from './components/EditAccountModal';

export default function AccountManagementView({ currentUser, onAccountUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const [editingAccount, setEditingAccount] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('size', 10);
      params.append('sort', 'createdAt,desc');
      const res = await apiRequest(`/accounts?${params.toString()}`);
      setAccounts(res.data.content || []);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      });
    } catch (e) {}
  }, [keyword, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleToggleStatus = async (acc) => {
    const newStatus = acc.status === 'active' ? 'inactive' : 'active';
    await apiRequest(`/accounts/${acc.accountId}/status`, 'PATCH', { status: newStatus });
    fetchAccounts();
  };

  return (
    <div className="content-card">
      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Quản Lý Tất Cả Tài Khoản</h3>
          <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
            Tổng cộng: {pageInfo.totalElements} tài khoản ({accounts.filter(a => a.status === 'active').length} đang hoạt động trên trang này)
          </div>
        </div>

        <div className="card-actions-group">
          <input
            type="text"
            placeholder="Tìm tên hoặc email..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            className="search-pill-input"
          />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Role: Tất cả</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-dash btn-dash-primary" onClick={() => setShowCreateModal(true)}>
            + Thêm Tài Khoản
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Mục tiêu JLPT</th>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Không tìm thấy tài khoản nào khớp với tiêu chí tìm kiếm.
                </td>
              </tr>
            ) : (
              accounts.map(acc => (
                <tr key={acc.accountId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={acc.avatarUrl || AVATAR_PRESETS[0].url}
                        alt="avt"
                        style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff7ed', border: '1px solid #fed7aa' }}
                      />
                      <div>
                        <strong style={{ color: 'var(--text-heading)' }}>{acc.fullName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: #{acc.accountId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`role-badge role-${acc.role?.toLowerCase()}`}>{acc.role}</span></td>
                  <td style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>{acc.jlptTargetLevel || '-'}</td>
                  <td style={{ color: 'var(--text-body)' }}>{acc.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleStatus(acc)}
                      className={`status-badge ${acc.status}`}
                      title="Nhấp để bật/tắt trạng thái (Active / Inactive)"
                    >
                      {acc.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-action-edit"
                      onClick={() => setEditingAccount(acc)}
                      title="Chỉnh sửa hồ sơ và avatar"
                    >
                      ✏️ Edit
                    </button>
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

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSaveSuccess={() => {
            alert('Cập nhật tài khoản thành công!');
            fetchAccounts();
          }}
        />
      )}

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => {
            alert('Tạo tài khoản mới thành công!');
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
