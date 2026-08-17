import React, { useState, useEffect, useMemo, useCallback } from 'react';

const API_BASE = 'http://localhost:8080/api/v1';

const AVATAR_PRESETS = [
  { id: 'sensei', label: 'Sensei', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sensei' },
  { id: 'kenji', label: 'Kenji', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji' },
  { id: 'sakura', label: 'Sakura', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura' },
  { id: 'samurai', label: 'Samurai', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Samurai' },
  { id: 'ninja', label: 'Ninja', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja' },
  { id: 'taro', label: 'Taro', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taro' },
  { id: 'yuki', label: 'Yuki', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki' },
  { id: 'manager', label: 'Manager', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Manager' }
];

async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('jwt_token');
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || `Lỗi hệ thống (${res.status})`;
    const err = new Error(errorMsg);
    err.fieldErrors = data?.data || {};
    if (res.status === 401 && endpoint !== '/auth/login') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.reload();
    }
    throw err;
  }
  return data;
}

export default function AccountManagementApp() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')) : null
  );
  const [activeTab, setActiveTab] = useState('accounts');
  const [toast, setToast] = useState(null);
  const [showProPopup, setShowProPopup] = useState(false);
  const [showMyProfileModal, setShowMyProfileModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoginSuccess = (authData) => {
    setToken(authData.accessToken);
    setCurrentUser(authData.account);
    localStorage.setItem('jwt_token', authData.accessToken);
    localStorage.setItem('user_info', JSON.stringify(authData.account));
    showToast(`Xin chào, ${authData.account.fullName}!`);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST', null, token);
    } catch (e) {}
    setToken(null);
    setCurrentUser(null);
    setShowMyProfileModal(false);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    showToast('Đã đăng xuất thành công', 'info');
  };

  const handleProfileUpdated = (updatedData) => {
    const updatedAcc = updatedData.account ? updatedData.account : updatedData;
    if (updatedData.accessToken) {
      setToken(updatedData.accessToken);
      localStorage.setItem('jwt_token', updatedData.accessToken);
    }
    setCurrentUser(updatedAcc);
    localStorage.setItem('user_info', JSON.stringify(updatedAcc));
    showToast('Cập nhật hồ sơ tài khoản và Avatar thành công!');
  };

  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fbf9f5', fontFamily: 'system-ui, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 60, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ background: 'white', padding: '0.85rem 1.25rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(249, 115, 22, 0.15)', border: '1px solid #f2ede4', fontSize: '0.875rem', fontWeight: 700 }}>
            {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '270px', background: 'white', borderRight: '1px solid #f2ede4', display: 'flex', flexDirection: 'column', padding: '1.75rem 1.25rem', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', marginBottom: '2.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>JP</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Dashboard</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div
            onClick={() => setActiveTab('accounts')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: activeTab === 'accounts' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent', color: activeTab === 'accounts' ? 'white' : '#57534e' }}
          >
            <span>👥 Accounts</span>
            <span>›</span>
          </div>

          <div
            onClick={() => setActiveTab('payment_report')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: activeTab === 'payment_report' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent', color: activeTab === 'payment_report' ? 'white' : '#57534e' }}
          >
            <span>💳 Payment Report</span>
            <span>›</span>
          </div>

          <div
            onClick={() => setActiveTab('refund_info')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: activeTab === 'refund_info' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent', color: activeTab === 'refund_info' ? 'white' : '#57534e' }}
          >
            <span>🔄 Refund Information</span>
            <span>›</span>
          </div>
        </div>

        {/* Promo Card */}
        <div style={{ background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', borderRadius: '16px', padding: '1.15rem', marginBottom: '1.25rem', border: '1px solid #fdba74', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.35rem' }}>✨ Japanese Pro</div>
          <div style={{ fontSize: '0.72rem', color: '#7c2d12', marginBottom: '0.75rem' }}>Tính năng AI & học tập cao cấp</div>
          <button
            onClick={() => setShowProPopup(true)}
            style={{ width: '100%', padding: '0.5rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Get Pro Now!
          </button>
        </div>

        {/* User Card with click to view & edit */}
        <div
          onClick={() => setShowMyProfileModal(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.75rem', background: '#fbf9f5', borderRadius: '12px', border: '1px solid #f2ede4', cursor: 'pointer' }}
          title="Bấm để xem và sửa thông tin tài khoản của bạn"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <img src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.fullName}</div>
              <div style={{ fontSize: '0.72rem', color: '#a8a29e' }}>{currentUser?.email}</div>
            </div>
          </div>
          <span style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 700 }}>✏️</span>
        </div>
      </aside>

      {/* Main Viewport */}
      <main style={{ flex: 1, padding: '2.25rem 2.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hello, {currentUser?.fullName} 👋</h2>
            <p style={{ color: '#57534e', fontSize: '0.875rem' }}>Hệ thống Quản lý Học tiếng Nhật & Tài khoản chuyên sâu</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #f2ede4', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600 }}>
            🚪 Đăng xuất
          </button>
        </div>

        {activeTab === 'accounts' && (
          <AccountManagementCard
            showToast={showToast}
            currentUser={currentUser}
            onAccountUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'payment_report' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '3.5rem 2rem', border: '1px solid #f2ede4', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💳</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>Payment Report</h3>
            <p style={{ color: '#57534e', fontSize: '0.875rem' }}>Hiện tại chưa có dữ liệu giao dịch thanh toán nào.</p>
          </div>
        )}

        {activeTab === 'refund_info' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '3.5rem 2rem', border: '1px solid #f2ede4', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔄</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>Refund Information</h3>
            <p style={{ color: '#57534e', fontSize: '0.875rem' }}>Hiện tại chưa có yêu cầu hoàn tiền nào.</p>
          </div>
        )}
      </main>

      {/* Pro Popup */}
      {showProPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f97316' }}>Japanese Pro - Sắp ra mắt!</h3>
            <p style={{ color: '#57534e', fontSize: '0.875rem', margin: '1rem 0' }}>Tính năng Japanese Pro đang được hoàn thiện và sẽ sớm phát hành.</p>
            <button onClick={() => setShowProPopup(false)} style={{ padding: '0.6rem 1.5rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer' }}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* My Profile Modal */}
      {showMyProfileModal && (
        <MyProfileModal
          currentUser={currentUser}
          onClose={() => setShowMyProfileModal(false)}
          onUpdateSuccess={handleProfileUpdated}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function AccountManagementCard({ showToast, currentUser, onAccountUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 8, totalPages: 0, totalElements: 0 });
  const [isFetching, setIsFetching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const [modalMode, setModalMode] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('size', 8);
      params.append('sort', 'createdAt,desc');

      const res = await apiRequest(`/accounts?${params.toString()}`);
      setAccounts(res.data.content);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsFetching(false);
    }
  }, [keyword, roleFilter, statusFilter, page, showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleToggleStatus = async (account) => {
    const newStatus = account.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`/accounts/${account.accountId}/status`, 'PATCH', { status: newStatus });
      showToast(`Đã chuyển trạng thái ${account.email} sang '${newStatus}'`);
      setAccounts(prev => prev.map(a => a.accountId === account.accountId ? { ...a, status: newStatus } : a));
    } catch (err) {
      showToast(err.message, 'error');
      fetchAccounts();
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #f2ede4', boxShadow: '0 10px 30px -4px rgba(120, 80, 40, 0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>All Accounts</h3>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Active Members ({accounts.filter(a => a.status === 'active').length} on this page)</div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search name / email..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            style={{ padding: '0.55rem 1rem', borderRadius: '9999px', border: '1px solid #f2ede4', background: '#fbf9f5', fontSize: '0.85rem' }}
          />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }} style={{ padding: '0.55rem 1rem', borderRadius: '9999px', border: '1px solid #f2ede4', background: '#fbf9f5' }}>
            <option value="">Role: All</option>
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Manager">Manager</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} style={{ padding: '0.55rem 1rem', borderRadius: '9999px', border: '1px solid #f2ede4', background: '#fbf9f5' }}>
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => { setSelectedAccount(null); setModalMode('create'); }}
            style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Create Account
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ color: '#b5b5be', borderBottom: '1px solid #f2ede4', fontSize: '0.8rem' }}>
            <th style={{ padding: '1rem' }}>Account Name</th>
            <th style={{ padding: '1rem' }}>Role</th>
            <th style={{ padding: '1rem' }}>JLPT Target</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Created Date</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => (
            <tr key={acc.accountId} style={{ borderBottom: '1px solid #f7f4ed' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={acc.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff7ed', border: '1px solid #fed7aa' }} />
                  <span style={{ fontWeight: 700 }}>{acc.fullName}</span>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: '#ffedd5', color: '#c2410c' }}>{acc.role}</span>
              </td>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#f97316' }}>{acc.jlptTargetLevel || '-'}</td>
              <td style={{ padding: '1rem', color: '#57534e' }}>{acc.email}</td>
              <td style={{ padding: '1rem', color: '#a8a29e', fontSize: '0.8rem' }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => handleToggleStatus(acc)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: acc.status === 'active' ? '#ecfdf5' : '#fff1f2',
                    color: acc.status === 'active' ? '#059669' : '#dc2626',
                    border: `1px solid ${acc.status === 'active' ? '#a7f3d0' : '#fecdd3'}`
                  }}
                >
                  {acc.status === 'active' ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button
                  onClick={() => { setSelectedAccount(acc); setModalMode('edit'); }}
                  style={{ padding: '0.35rem 0.8rem', background: 'white', border: '1px solid #f2ede4', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  ✏️ Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(modalMode === 'create' || modalMode === 'edit') && (
        <AccountFormModal
          mode={modalMode}
          account={selectedAccount}
          onClose={() => { setModalMode(null); setSelectedAccount(null); }}
          onSuccess={(savedAcc) => {
            setModalMode(null);
            setSelectedAccount(null);
            if (savedAcc) onAccountUpdated(savedAcc);
            fetchAccounts();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function AccountFormModal({ mode, account, onClose, onSuccess, showToast }) {
  const isEdit = mode === 'edit';
  const [email, setEmail] = useState(account?.email || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(account?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(account?.avatarUrl || AVATAR_PRESETS[0].url);
  const [role, setRole] = useState(account?.role || 'Student');
  const [jlptTargetLevel, setJlptTargetLevel] = useState(account?.jlptTargetLevel || 'N5');
  const [status, setStatus] = useState(account?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!fullName.trim() || fullName.trim().length < 2) newErrors.fullName = 'Họ và tên từ 2 ký tự trở lên';
    if (!email.includes('@')) newErrors.email = 'Email không đúng định dạng';
    if (!isEdit && password.length < 6) newErrors.password = 'Mật khẩu từ 6 ký tự trở lên';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEdit) {
        const body = {
          email: email.trim(),
          fullName: fullName.trim(),
          avatarUrl: avatarUrl || AVATAR_PRESETS[0].url,
          role,
          status,
          jlptTargetLevel: role === 'Student' ? jlptTargetLevel : null
        };
        if (password.trim()) body.password = password.trim();
        res = await apiRequest(`/accounts/${account.accountId}`, 'PUT', body);
        showToast('Cập nhật tài khoản và avatar thành công!');
      } else {
        res = await apiRequest('/accounts', 'POST', {
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          avatarUrl: avatarUrl || AVATAR_PRESETS[0].url,
          role,
          status: 'active',
          jlptTargetLevel: role === 'Student' ? jlptTargetLevel : null
        });
        showToast('Tạo tài khoản thành công!');
      }
      onSuccess(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          {isEdit ? `Chỉnh sửa tài khoản #${account.accountId}` : 'Tạo tài khoản mới'}
        </h4>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Họ và tên *</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {isEdit ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu *'}
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Vai trò *</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }}>
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            {isEdit ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Trạng thái</label>
                <input type="text" disabled value="Active" style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px', color: '#059669', fontWeight: 700 }} />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Chọn Avatar:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {AVATAR_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => setAvatarUrl(preset.url)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: `3px solid ${avatarUrl === preset.url ? '#f97316' : 'transparent'}`,
                    padding: '2px',
                    cursor: 'pointer',
                    background: '#fbf9f5',
                    margin: '0 auto'
                  }}
                >
                  <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.55rem 1rem', background: '#fbf9f5', border: '1px solid #f2ede4', borderRadius: '8px', cursor: 'pointer' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '0.55rem 1.25rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyProfileModal({ currentUser, onClose, onUpdateSuccess, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0].url);
  const [jlptTargetLevel, setJlptTargetLevel] = useState(currentUser?.jlptTargetLevel || 'N5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setFullName(currentUser.fullName || '');
      setAvatarUrl(currentUser.avatarUrl || AVATAR_PRESETS[0].url);
      setJlptTargetLevel(currentUser.jlptTargetLevel || 'N5');
    }
  }, [currentUser, isEditing]);

  const handleStartEdit = () => {
    setEmail(currentUser?.email || '');
    setFullName(currentUser?.fullName || '');
    setAvatarUrl(currentUser?.avatarUrl || AVATAR_PRESETS[0].url);
    setJlptTargetLevel(currentUser?.jlptTargetLevel || 'N5');
    setNewPassword('');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      showToast('Họ và tên phải từ 2 ký tự trở lên', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      showToast('Email không đúng định dạng', 'error');
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (currentUser?.accountId) {
        const body = {
          email: email.trim(),
          fullName: fullName.trim(),
          avatarUrl: avatarUrl || AVATAR_PRESETS[0].url,
          role: currentUser.role || 'Student',
          status: currentUser.status || 'active',
          jlptTargetLevel: jlptTargetLevel || 'N5'
        };
        if (newPassword.trim()) {
          body.password = newPassword.trim();
        }
        res = await apiRequest(`/accounts/${currentUser.accountId}`, 'PUT', body);
      } else {
        const body = {
          email: email.trim(),
          fullName: fullName.trim(),
          avatarUrl: avatarUrl || AVATAR_PRESETS[0].url,
          jlptTargetLevel: jlptTargetLevel || 'N5'
        };
        if (newPassword.trim()) {
          body.newPassword = newPassword.trim();
        }
        res = await apiRequest('/auth/me', 'PUT', body);
      }

      onUpdateSuccess(res.data);
      setIsEditing(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{isEditing ? 'Chỉnh sửa tài khoản & Avatar' : 'Hồ sơ tài khoản'}</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {!isEditing ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img src={currentUser?.avatarUrl || AVATAR_PRESETS[0].url} alt="avt" style={{ width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 0.5rem', border: '3px solid #fed7aa', background: '#fff7ed' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentUser?.fullName}</h4>
              <p style={{ color: '#57534e', fontSize: '0.85rem' }}>{currentUser?.email}</p>
              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: '#ffedd5', color: '#c2410c' }}>{currentUser?.role}</span>
              </div>
            </div>

            <div style={{ background: '#fbf9f5', borderRadius: '12px', padding: '1rem', border: '1px solid #f2ede4', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div><strong>Mã tài khoản:</strong> #{currentUser?.accountId}</div>
              <div><strong>Mục tiêu JLPT:</strong> {currentUser?.jlptTargetLevel || 'N5'}</div>
              <div><strong>Trạng thái:</strong> {currentUser?.status}</div>
              <div><strong>Ngày tạo:</strong> {currentUser?.createdAt ? new Date(currentUser?.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#fbf9f5', border: '1px solid #f2ede4', borderRadius: '8px', cursor: 'pointer' }}>Đóng</button>
              <button onClick={handleStartEdit} style={{ padding: '0.5rem 1.25rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                ✏️ Chỉnh sửa thông tin & Avatar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Avatar đại diện:</label>
              <img src={avatarUrl} alt="preview" style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #f97316', margin: '0 auto 0.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {AVATAR_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => setAvatarUrl(preset.url)}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      border: `3px solid ${avatarUrl === preset.url ? '#f97316' : 'transparent'}`,
                      padding: '2px',
                      cursor: 'pointer',
                      background: '#fbf9f5',
                      margin: '0 auto'
                    }}
                  >
                    <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Họ và tên *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email tài khoản *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Trình độ JLPT mục tiêu</label>
              <select value={jlptTargetLevel} onChange={e => setJlptTargetLevel(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }}>
                <option value="N5">N5 - Cơ bản</option>
                <option value="N4">N4 - Sơ cấp</option>
                <option value="N3">N3 - Trung cấp</option>
                <option value="N2">N2 - Cao cấp</option>
                <option value="N1">N1 - Thành thạo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mật khẩu mới (Để trống nếu giữ nguyên)</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nhập từ 6 ký tự..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', background: '#fbf9f5', border: '1px solid #f2ede4', borderRadius: '8px', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.25rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Đang lưu...' : '💾 Lưu hồ sơ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AuthPage({ onLoginSuccess, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fillQuick = (e_val, p_val) => {
    setEmail(e_val);
    setPassword(p_val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest('/auth/login', 'POST', { email: email.trim(), password: password.trim() });
      onLoginSuccess(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbf9f5', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(249, 115, 22, 0.15)', border: '1px solid #f2ede4' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', margin: '0 auto 1rem' }}>JP</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Đăng nhập</h2>
          <p style={{ color: '#57534e', fontSize: '0.85rem' }}>Japanese Learning Platform</p>
        </div>

        <div style={{ background: '#fff7ed', padding: '0.75rem', borderRadius: '12px', border: '1px dashed #fdba74', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.4rem' }}>⚡ ĐĂNG NHẬP NHANH:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" onClick={() => fillQuick('admin@japanlearning.com', 'admin123')} style={{ padding: '0.4rem', fontSize: '0.78rem', background: 'white', border: '1px solid #fed7aa', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#c2410c' }}>
              👑 Admin (Manager)
            </button>
            <button type="button" onClick={() => fillQuick('student@japanlearning.com', 'student123')} style={{ padding: '0.4rem', fontSize: '0.78rem', background: 'white', border: '1px solid #fed7aa', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#c2410c' }}>
              🎓 Student
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.7rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.7rem', border: '1px solid #f2ede4', borderRadius: '8px' }} />
          <button type="submit" disabled={loading} style={{ padding: '0.8rem', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
