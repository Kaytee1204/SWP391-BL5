import React, { useState, useEffect, useCallback } from 'react';
import { courseApi } from '../../api/courseApi';
import { JLPT_LEVELS } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import CourseFormModal from './CourseFormModal';

export default function CourseManagementView({ currentUser }) {
  const [courses, setCourses] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
  const [keyword, setKeyword] = useState('');
  const [jlptFilter, setJlptFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAll({
        keyword: keyword.trim() || undefined,
        jlptLevel: jlptFilter || undefined,
        page,
        size: 10,
        sort: 'createdAt,desc'
      });

      if (res && (res.code === 200 || res.code === 201)) {
        setCourses(res.data.content || []);
        setPageInfo({
          page: res.data.page,
          size: res.data.size,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách khóa học:', e);
    } finally {
      setLoading(false);
    }
  }, [keyword, jlptFilter, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSaveCourse = async (formData) => {
    if (editingCourse) {
      const res = await courseApi.update(editingCourse.courseId, formData);
      if (res.code !== 200 && res.code !== 201) {
        throw new Error(res.message || 'Lỗi khi cập nhật khóa học');
      }
      alert('Cập nhật khóa học thành công!');
    } else {
      const res = await courseApi.create(formData);
      if (res.code !== 200 && res.code !== 201) {
        throw new Error(res.message || 'Lỗi khi tạo khóa học');
      }
      alert('Tạo khóa học mới thành công!');
    }
    fetchCourses();
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học: "${course.title}"?`)) {
      return;
    }
    try {
      const res = await courseApi.delete(course.courseId);
      if (res.code === 200 || res.code === 204) {
        alert('Xóa khóa học thành công!');
        fetchCourses();
      } else {
        alert(res.message || 'Không thể xóa khóa học.');
      }
    } catch (err) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const formatVND = (num) => {
    if (!num || num === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const freeCount = courses.filter(c => !c.price || c.price === 0).length;
  const paidCount = courses.filter(c => c.price > 0).length;

  return (
    <div className="content-card">
      {/* 4 Thẻ thống kê mini */}
      <div className="stats-grid-4">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>📚</div>
          <div>
            <div className="stat-mini-num">{pageInfo.totalElements}</div>
            <div className="stat-mini-label">Tổng số Khóa học</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🎁</div>
          <div>
            <div className="stat-mini-num">{freeCount}</div>
            <div className="stat-mini-label">Khóa Miễn Phí (Trang)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>💎</div>
          <div>
            <div className="stat-mini-num">{paidCount}</div>
            <div className="stat-mini-label">Khóa Trả Phí (Trang)</div>
          </div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⚡</div>
          <div>
            <div className="stat-mini-num">{currentUser?.role || 'User'}</div>
            <div className="stat-mini-label">Quyền Quản Trị</div>
          </div>
        </div>
      </div>

      {/* Header & Filter Bar */}
      <div className="card-header-row">
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>📚 Quản Lý Khóa Học & Đặt Giá (Course Management)</h3>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
            Thiết lập lộ trình học tiếng Nhật JLPT, đặt giá bán và quản lý bài học
          </div>
        </div>

        <div className="card-actions-group">
          <input
            type="text"
            placeholder="Tìm theo tên khóa học..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="search-pill-input"
          />

          <select
            value={jlptFilter}
            onChange={(e) => { setJlptFilter(e.target.value); setPage(0); }}
            className="select-pill"
          >
            <option value="">Cấp độ: Tất cả</option>
            {JLPT_LEVELS.map(lvl => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>

          <button
            className="btn-dash btn-dash-primary"
            onClick={() => { setEditingCourse(null); setShowModal(true); }}
          >
            + Thêm Khóa Học Mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="clean-table">
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th>Khóa Học</th>
              <th style={{ textAlign: 'center' }}>Cấp độ JLPT</th>
              <th style={{ textAlign: 'right' }}>Giá Bán (VNĐ)</th>
              <th>Giảng Viên / Người Tạo</th>
              <th>Ngày Tạo</th>
              <th style={{ textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  ⏳ Đang tải dữ liệu khóa học...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
                  <div>Chưa có khóa học nào. Bấm "+ Thêm Khóa Học Mới" để tạo khóa học đầu tiên!</div>
                </td>
              </tr>
            ) : (
              courses.map((c) => {
                const isOwner = currentUser?.accountId === c.createdById;
                const canManage = isOwner || currentUser?.role === 'Manager';

                return (
                  <tr key={c.courseId}>
                    <td style={{ maxWidth: '320px' }}>
                      <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.95rem' }}>
                        {c.title}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description || 'Chưa có mô tả chi tiết'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="jlpt-badge" style={{ background: '#ede9fe', color: '#7c3aed', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                        {c.jlptLevel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>
                      {c.price === 0 ? (
                        <span style={{ color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
                          Miễn phí
                        </span>
                      ) : (
                        <span style={{ color: '#7c3aed', background: '#f5f3ff', padding: '4px 8px', borderRadius: '6px' }}>
                          {formatVND(c.price)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <img
                          src={c.createdByAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji'}
                          alt="avt"
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.createdByName || 'Giảng viên'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {canManage && (
                          <button
                            className="btn-action-edit"
                            onClick={() => { setEditingCourse(c); setShowModal(true); }}
                            title="Chỉnh sửa khóa học & giá"
                          >
                            ✏️ Sửa
                          </button>
                        )}
                        {canManage && (
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteCourse(c)}
                            title="Xóa khóa học"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {showModal && (
        <CourseFormModal
          course={editingCourse}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
}
