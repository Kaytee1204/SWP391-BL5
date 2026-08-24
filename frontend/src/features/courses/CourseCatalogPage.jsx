import React, { useState, useEffect, useCallback } from 'react';
import { courseApi } from '../../api/courseApi';
import { paymentApi } from '../../api/paymentApi';
import { JLPT_LEVELS } from '../../assets/constants';
import Navbar from '../../components/common/Navbar';
import SePayCheckoutModal from './components/SePayCheckoutModal';

export default function CourseCatalogPage({
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onLogout
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [jlptFilter, setJlptFilter] = useState('');
  const [activePaymentData, setActivePaymentData] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAll({
        keyword: keyword.trim() || undefined,
        jlptLevel: jlptFilter || undefined,
        size: 50,
        sort: 'createdAt,desc'
      });
      if (res && (res.code === 200 || res.code === 201)) {
        setCourses(res.data.content || []);
      }
    } catch (e) {
      console.error('Lỗi tải danh mục khóa học:', e);
    } finally {
      setLoading(false);
    }
  }, [keyword, jlptFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnrollOrBuy = async (course) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập tài khoản để đăng ký hoặc mua khóa học!');
      onOpenAuth && onOpenAuth('login');
      return;
    }

    if (course.isEnrolled) {
      // Đã sở hữu -> chuyển vào màn hình học
      onNavigate && onNavigate('kanji');
      return;
    }

    if (course.price === 0) {
      // Khóa học miễn phí -> tự động đăng ký
      try {
        const res = await courseApi.enrollFree(course.courseId);
        if (res.code === 200 || res.code === 201) {
          alert('🎉 Chúc mừng! Bạn đã đăng ký khóa học miễn phí thành công.');
          fetchCourses();
        }
      } catch (err) {
        alert(err.message || 'Không thể đăng ký khóa học.');
      }
    } else {
      // Khóa học trả phí -> Gọi API tạo mã thanh toán SePay VietQR
      try {
        const res = await paymentApi.createPaymentLink(course.courseId);
        if (res && res.data) {
          setActivePaymentData(res.data);
        }
      } catch (err) {
        alert(err.message || 'Không thể tạo mã thanh toán SePay.');
      }
    }
  };

  const formatVND = (num) => {
    if (!num || num === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar */}
      <Navbar
        currentView="courses"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      {/* Header Banner */}
      <header className="culture-header-banner">
        <div className="culture-badge">
          <span>⛩️</span>
          <span>Khóa Học Tiếng Nhật Chuẩn JLPT N5 - N1</span>
        </div>
        <h1 className="culture-page-title">
          Danh Mục Khóa Học & Lộ Trình Toàn Diện
        </h1>
        <p className="culture-page-sub">
          Luyện thi JLPT, từ vựng, ngữ pháp, kanji và giao tiếp thực tế cùng đội ngũ Giảng viên JLMS. Thanh toán tiện lợi qua cổng <strong>SePay</strong>.
        </p>
      </header>

      {/* Search & Filter Toolbar */}
      <main style={{ maxWidth: '1240px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
        <div className="card-header-row" style={{ background: '#fff', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`select-pill ${jlptFilter === '' ? 'active' : ''}`}
              style={{ background: jlptFilter === '' ? '#7c3aed' : '#f8fafc', color: jlptFilter === '' ? '#fff' : 'var(--text-body)', fontWeight: 700, cursor: 'pointer', border: '1px solid #e2e8f0', padding: '0.45rem 1rem', borderRadius: '10px' }}
              onClick={() => setJlptFilter('')}
            >
              Tất cả cấp độ
            </button>
            {JLPT_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                style={{ background: jlptFilter === lvl.value ? '#7c3aed' : '#f8fafc', color: jlptFilter === lvl.value ? '#fff' : 'var(--text-body)', fontWeight: 700, cursor: 'pointer', border: '1px solid #e2e8f0', padding: '0.45rem 1rem', borderRadius: '10px' }}
                onClick={() => setJlptFilter(lvl.value)}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '280px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm khóa học theo tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-pill-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
            <p>Đang tải danh sách khóa học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌸</div>
            <h3 style={{ color: 'var(--text-heading)', fontWeight: 800 }}>Chưa tìm thấy khóa học phù hợp</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn cấp độ JLPT khác.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => (
              <div
                key={course.courseId}
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{ background: '#ede9fe', color: '#7c3aed', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                      JLPT {course.jlptLevel}
                    </span>
                    {course.isEnrolled && (
                      <span style={{ background: '#ecfdf5', color: '#059669', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                        ✓ Đã sở hữu
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '42px' }}>
                    {course.description ? (course.description.length > 130 ? course.description.slice(0, 130) + '...' : course.description) : 'Khóa học cung cấp đầy đủ kiến thức lý thuyết, từ vựng và bài tập JLPT.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <img
                        src={course.createdByAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji'}
                        alt="avt"
                        style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {course.createdByName || 'Giảng viên'}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: course.price === 0 ? '#10b981' : '#7c3aed' }}>
                      {formatVND(course.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnrollOrBuy(course)}
                    className="btn-primary-purple"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.92rem',
                      background: course.isEnrolled
                        ? '#059669'
                        : course.price === 0
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                    }}
                  >
                    {course.isEnrolled
                      ? '📖 Vào Học Ngay →'
                      : course.price === 0
                      ? '🎁 Đăng Ký Học Miễn Phí'
                      : '💳 Mua Khóa Học (VietQR / SePay)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal thanh toán SePay VietQR */}
      {activePaymentData && (
        <SePayCheckoutModal
          paymentData={activePaymentData}
          onClose={() => setActivePaymentData(null)}
          onSuccess={() => {
            fetchCourses();
          }}
          onNavigateLearning={() => {
            onNavigate('kanji');
          }}
        />
      )}
    </div>
  );
}
