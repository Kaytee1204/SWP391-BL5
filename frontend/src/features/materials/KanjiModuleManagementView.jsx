import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { kanjiApi } from '../../api';
import { Modal } from '../../components/Modal';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
// UI không sửa description nhưng vẫn giữ giá trị cũ để update không vô tình xóa dữ liệu.
const emptyForm = { title: '', jlptLevel: 'N5', description: null };

export default function KanjiModuleManagementView({ currentUser }) {
  // Ẩn nút cho role khác giúp UI rõ ràng; backend mới là nơi bắt buộc kiểm tra quyền.
  const canManage = currentUser?.role === 'Lecturer';
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadModules = async () => {
    // ALL đổi thành null để backend hiểu là không lọc; N5-N1 được gửi qua query parameter.
    setLoading(true);
    try {
      const data = await kanjiApi.getModules(selectedLevel === 'ALL' ? null : selectedLevel);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({ type: 'error', message: `Không thể tải danh sách module: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đổi level sẽ tải lại server, tránh lọc trên danh sách cũ hoặc chưa đầy đủ.
    loadModules();
  }, [selectedLevel]);

  const openForm = (module = null) => {
    // Có module là edit; null là create và dùng JLPT đang lọc làm mặc định.
    setEditingModule(module);
    setForm(module
      ? { title: module.title, jlptLevel: module.jlptLevel, description: module.description ?? null }
      : { title: '', jlptLevel: selectedLevel === 'ALL' ? 'N5' : selectedLevel, description: null });
    setIsModalOpen(true);
  };

  const saveModule = async (event) => {
    event.preventDefault();
    // Chuyển state form thành đúng payload API, đồng thời bỏ khoảng trắng thừa ở title.
    const payload = { title: form.title.trim(), jlptLevel: form.jlptLevel, description: form.description };
    if (!payload.title) return;

    try {
      if (editingModule) {
        await kanjiApi.updateModule(editingModule.moduleId, payload);
        setFeedback({ type: 'success', message: 'Cập nhật module Kanji thành công.' });
      } else {
        await kanjiApi.createModule(payload);
        setFeedback({ type: 'success', message: 'Tạo module Kanji thành công.' });
      }
      setIsModalOpen(false);
      // Reload từ backend để nhận timestamp, count và dữ liệu chuẩn hóa sau mutation.
      await loadModules();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  const deleteModule = async (module) => {
    if (!window.confirm(`Xóa module "${module.title}"? Các Kanji thuộc module cũng sẽ bị xóa.`)) return;

    try {
      await kanjiApi.deleteModule(module.moduleId);
      setFeedback({ type: 'success', message: 'Đã xóa module Kanji.' });
      await loadModules();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>Quản lý Danh mục Kanji</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>Thêm, sửa, xóa các module bài học Kanji theo cấp độ JLPT</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => openForm()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 20px',
              background: '#4fb487',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 5px 12px rgba(79, 180, 135, 0.25)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            <Plus size={17} strokeWidth={3} /> Thêm mới
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <label htmlFor="kanji-module-level" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 700 }}>Lọc theo JLPT:</label>
        <select
          id="kanji-module-level"
          className="form-select"
          value={selectedLevel}
          onChange={(event) => setSelectedLevel(event.target.value)}
          style={{ width: '150px' }}
        >
          <option value="ALL">Tất cả cấp độ</option>
          {JLPT_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
        </select>
      </div>

      {feedback.message && (
        <div style={{ padding: '10px 14px', marginBottom: '16px', background: feedback.type === 'error' ? '#fee2e2' : '#d1fae5', color: feedback.type === 'error' ? '#b91c1c' : '#065f46' }}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách module...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 14px rgba(15, 23, 42, 0.12)' }}>
          <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>JLPT LEVEL</th>
                <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>TÊN MODULE</th>
                <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>SỐ KANJI</th>
                <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>NGÀY TẠO</th>
                {canManage && <th style={{ padding: '17px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>THAO TÁC</th>}
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} style={{ padding: '44px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Chưa có module Kanji phù hợp.
                  </td>
                </tr>
              ) : modules.map((module) => (
                <tr key={module.moduleId} style={{ borderTop: '1px solid #e8edf3' }}>
                  <td style={{ padding: '20px', color: '#334155', fontWeight: 600 }}>#{module.moduleId}</td>
                  <td style={{ padding: '20px' }}><span className={`badge-jlpt badge-${module.jlptLevel.toLowerCase()}`}>{module.jlptLevel}</span></td>
                  <td style={{ padding: '20px', color: '#0f172a', fontWeight: 700 }}>{module.title}</td>
                  <td style={{ padding: '20px', color: '#64748b' }}>{module.kanjiCount ?? 0} chữ</td>
                  <td style={{ padding: '20px', color: '#64748b' }}>{module.createdAt ? new Date(module.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                  {canManage && (
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button type="button" onClick={() => openForm(module)} style={{ padding: '7px 13px', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Sửa</button>
                        <button type="button" onClick={() => deleteModule(module)} style={{ padding: '7px 13px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Xóa</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingModule ? 'Chỉnh sửa module Kanji' : 'Tạo module Kanji'}>
        <form onSubmit={saveModule}>
          <div className="form-group">
            <label className="form-label">Tiêu đề</label>
            <input className="form-input" required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Cấp độ JLPT</label>
            <select className="form-select" value={form.jlptLevel} onChange={(event) => setForm({ ...form, jlptLevel: event.target.value })}>
              {JLPT_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">{editingModule ? 'Lưu thay đổi' : 'Tạo module'}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
