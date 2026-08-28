import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { AVATAR_PRESETS, ROLES } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import CreateAccountModal from './components/CreateAccountModal';
import EditAccountModal from './components/EditAccountModal';

/**
 * ============================================================================
 * COMPONENT: AccountManagementView
 * NGHIỆP VỤ: Quản lý Tài khoản người dùng (Dành riêng cho Quản lý / Manager)
 * CHỨC NĂNG CHÍNH:
 *  1. Xem danh sách tài khoản toàn hệ thống có phân trang (Pagination).
 *  2. Tìm kiếm theo tên hoặc email (Search keyword).
 *  3. Lọc tài khoản theo vai trò (Role: Student, Lecturer, Author, Manager).
 *  4. Lọc tài khoản theo trạng thái (Status: Active, Inactive).
 *  5. Khóa / Mở khóa nhanh tài khoản (Toggle Active ⮂ Inactive).
 *  6. Thêm tài khoản mới thủ công (+ Add Account).
 *  7. Chỉnh sửa thông tin, đổi vai trò, đổi mật khẩu tài khoản (Edit Account).
 * ============================================================================
 */
export default function AccountManagementView({ currentUser, onAccountUpdated }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản hiển thị trên trang hiện tại
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 }); // Thông tin phân trang từ Backend
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- STATE BỘ LỌC VÀ TÌM KIẾM ---
  const [keyword, setKeyword] = useState('');       // Từ khóa tìm kiếm (họ tên hoặc email)
  const [roleFilter, setRoleFilter] = useState('');   // Lọc theo vai trò (Student, Lecturer, Author, Manager)
  const [statusFilter, setStatusFilter] = useState(''); // Lọc theo trạng thái (active, inactive)
  const [page, setPage] = useState(0);              // Số trang hiện tại (0-indexed)

  // --- STATE QUẢN LÝ MODAL POPUP ---
  const [editingAccount, setEditingAccount] = useState(null); // Tài khoản đang được chọn để chỉnh sửa (null nếu đóng)
  const [showCreateModal, setShowCreateModal] = useState(false); // Trạng thái mở/đóng modal tạo tài khoản mới

  /**
   * [CHỨC NĂNG 1]: Tải danh sách tài khoản từ Backend API
   * - Endpoint: GET /api/v1/accounts
   * - Hỗ trợ Query Params: keyword, role, status, page, size, sort
   */
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('size', 10);
      params.append('sort', 'createdAt,desc');

      const res = await apiRequest(`/accounts?${params.toString()}`);
      if (res && res.data) {
        setAccounts(res.data.content || []);
        setPageInfo({
          page: res.data.page ?? 0,
          size: res.data.size ?? 10,
          totalPages: res.data.totalPages ?? 1,
          totalElements: res.data.totalElements ?? 0
        });
      } else {
        setAccounts([]);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách tài khoản:', e);
      setErrorMsg(e.message || 'Không thể tải danh sách tài khoản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [keyword, roleFilter, statusFilter, page]);

  // Tự động gọi API tải danh sách khi bộ lọc hoặc số trang thay đổi
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /**
   * [CHỨC NĂNG 2]: Khóa / Mở khóa tài khoản (Toggle Status Active ⮂ Inactive)
   * - Endpoint: PATCH /api/v1/accounts/{accountId}/status
   * - Payload: { status: 'active' | 'inactive' }
   */
  const handleToggleStatus = async (acc) => {
    const newStatus = acc.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`/accounts/${acc.accountId}/status`, 'PATCH', { status: newStatus });
      fetchAccounts(); // Tải lại bảng để cập nhật màu sắc badge
    } catch (err) {
      alert(`Không thể đổi trạng thái tài khoản: ${err.message}`);
    }
  };

  return (
    <div className="content-card">
      {/* HEADER CARD: Tiêu đề & Tổng số lượng tài khoản */}
      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Account Management</h3>
          <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
            Total: {pageInfo.totalElements} accounts ({accounts.filter(a => a.status === 'active').length} active on this page)
          </div>
        </div>

        {/* TOOLBAR: Ô tìm kiếm, Dropdown lọc vai trò/trạng thái và Nút thêm tài khoản */}
        <div className="card-actions-group">
          {/* Ô nhập từ khóa tìm kiếm */}
          <input
            type="text"
            placeholder="Search name or email..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            className="search-pill-input"
          />

          {/* Dropdown lọc vai trò */}
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Role: All</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Dropdown lọc trạng thái */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Nút mở Modal thêm tài khoản mới */}
          <button className="btn-dash btn-dash-primary" onClick={() => setShowCreateModal(true)}>
            + Add Account
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU DANH SÁCH TÀI KHOẢN */}
      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Account</th>
              <th>Role</th>
              <th>JLPT Level</th>
              <th>Email</th>
              <th>Created At</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div>Đang tải danh sách tài khoản...</div>
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#e11d48' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <div style={{ fontWeight: 700 }}>{errorMsg}</div>
                  <button onClick={fetchAccounts} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Thử lại
                  </button>
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              /* Trạng thái không tìm thấy tài khoản nào */
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No accounts found matching your search criteria.
                </td>
              </tr>
            ) : (
              /* Danh sách các dòng tài khoản */
              accounts.map(acc => (
                <tr key={acc.accountId}>
                  {/* Cột 1: Thông tin Avatar + Họ tên + ID */}
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

                  {/* Cột 2: Huy hiệu Vai trò (Role) */}
                  <td><span className={`role-badge role-${acc.role?.toLowerCase()}`}>{acc.role}</span></td>

                  {/* Cột 3: Trình độ JLPT mục tiêu */}
                  <td style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>{acc.jlptTargetLevel || '-'}</td>

                  {/* Cột 4: Địa chỉ Email */}
                  <td style={{ color: 'var(--text-body)' }}>{acc.email}</td>

                  {/* Cột 5: Ngày tạo tài khoản */}
                  <td style={{ color: 'var(--text-muted)' }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-US') : '-'}</td>

                  {/* Cột 6: Nút bấm chuyển đổi nhanh Trạng thái (Active ⮂ Inactive) */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleStatus(acc)}
                      className={`status-badge ${acc.status}`}
                      title="Click to toggle status (Active / Inactive)"
                    >
                      {acc.status}
                    </button>
                  </td>

                  {/* Cột 7: Nút mở Modal chỉnh sửa chi tiết */}
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-action-edit"
                      onClick={() => setEditingAccount(acc)}
                      title="Edit profile and avatar"
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

      {/* THANH PHÂN TRANG */}
      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* MODAL 1: CHỈNH SỬA THÔNG TIN TÀI KHOẢN */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSaveSuccess={() => {
            fetchAccounts();
          }}
        />
      )}

      {/* MODAL 2: TẠO TÀI KHOẢN MỚI THỦ CÔNG */}
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => {
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
