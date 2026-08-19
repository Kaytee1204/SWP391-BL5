import React, { useState, useEffect } from 'react';
import { accountApi } from '../api';
import { Modal } from '../components/Modal';
import { Users, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái modal tạo tài khoản.
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    fullName: '',
    password: '123456',
    role: 'Student',
    jlptTargetLevel: 'N5',
    status: 'active',
  });

  // Trạng thái modal chỉnh sửa tài khoản.
  const [editingAccount, setEditingAccount] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountApi.getAll();
      setAccounts(data?.content || []);
    } catch (err) {
      setError('Không thể tải danh sách tài khoản: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await accountApi.create(createForm);
      setSuccess('Tạo tài khoản mới thành công');
      setIsCreateModalOpen(false);
      setCreateForm({
        email: '',
        fullName: '',
        password: '123456',
        role: 'Student',
        jlptTargetLevel: 'N5',
        status: 'active',
      });
      fetchAccounts();
    } catch (err) {
      setError('Không thể tạo tài khoản: ' + err.message);
    }
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount({
      accountId: acc.accountId,
      fullName: acc.fullName,
      email: acc.email,
      role: acc.role,
      jlptTargetLevel: acc.jlptTargetLevel || 'N5',
      status: acc.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await accountApi.update(editingAccount.accountId, {
        fullName: editingAccount.fullName,
        role: editingAccount.role,
        jlptTargetLevel: editingAccount.jlptTargetLevel,
        status: editingAccount.status,
      });
      setSuccess('Cập nhật tài khoản thành công');
      setIsEditModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setError('Không thể cập nhật tài khoản: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await accountApi.delete(id);
      setSuccess('Đã xóa/vô hiệu hóa tài khoản thành công');
      setDeleteConfirmId(null);
      fetchAccounts();
    } catch (err) {
      setError('Không thể xóa tài khoản: ' + err.message);
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Quản lý Account (Tài khoản)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Xem danh sách, tạo mới, chỉnh sửa thông tin và xóa tài khoản
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Tạo tài khoản mới
        </button>
      </div>

      {success && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Đang tải dữ liệu tài khoản...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Mục tiêu JLPT</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.accountId}>
                  <td>#{acc.accountId}</td>
                  <td style={{ fontWeight: '600' }}>{acc.fullName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{acc.email}</td>
                  <td>
                    <span className="badge-jlpt badge-n5" style={{ textTransform: 'capitalize' }}>
                      {acc.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge-jlpt badge-n4">{acc.jlptTargetLevel || 'N/A'}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: acc.status === 'active' ? '#059669' : '#dc2626'
                    }}>
                      {acc.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {acc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(acc)}
                        title="Chỉnh sửa tài khoản"
                      >
                        <Edit size={14} /> Sửa
                      </button>
                      {acc.status !== 'deleted' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirmId(acc.accountId)}
        title="Xác nhận xóa tài khoản"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo tài khoản */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo tài khoản mới"
      >
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="user@nihongo.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Trần Văn B"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select
                className="form-select"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="Student">Student (Học viên)</option>
                <option value="Lecturer">Lecturer (Giảng viên)</option>
                <option value="Manager">Manager (Quản lý)</option>
                <option value="Author">Author (Tác giả)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mục tiêu JLPT</label>
              <select
                className="form-select"
                value={createForm.jlptTargetLevel}
                onChange={(e) => setCreateForm({ ...createForm, jlptTargetLevel: e.target.value })}
              >
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
          </div>
        </form>
      </Modal>

      {/* Modal sửa tài khoản */}
      {editingAccount && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Chỉnh sửa tài khoản: ${editingAccount.email}`}
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-input"
                required
                value={editingAccount.fullName}
                onChange={(e) => setEditingAccount({ ...editingAccount, fullName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Vai trò</label>
                <select
                  className="form-select"
                  value={editingAccount.role}
                  onChange={(e) => setEditingAccount({ ...editingAccount, role: e.target.value })}
                >
                  <option value="Student">Student (Học viên)</option>
                  <option value="Lecturer">Lecturer (Giảng viên)</option>
                  <option value="Manager">Manager (Quản lý)</option>
                <option value="Author">Author (Tác giả)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={editingAccount.status}
                  onChange={(e) => setEditingAccount({ ...editingAccount, status: e.target.value })}
                >
                  <option value="active">Active (Hoạt động)</option>
                  <option value="inactive">Inactive (Tạm khóa)</option>
                  <option value="deleted">Deleted (Đã xóa)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mục tiêu JLPT</label>
              <select
                className="form-select"
                value={editingAccount.jlptTargetLevel}
                onChange={(e) => setEditingAccount({ ...editingAccount, jlptTargetLevel: e.target.value })}
              >
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu cập nhật</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal xác nhận xóa tài khoản */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa tài khoản"
      >
        <p style={{ marginBottom: '20px' }}>
          Bạn có chắc chắn muốn xóa tài khoản #{deleteConfirmId}?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Hủy</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId)}>Xác nhận xóa</button>
        </div>
      </Modal>
    </div>
  );
};
