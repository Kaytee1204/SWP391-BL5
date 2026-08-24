import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Folder, BookOpen, Layers, Search } from 'lucide-react';
import { kanjiApi } from '../../api';
import KanjiModuleFormModal from './components/KanjiModuleFormModal';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function KanjiModuleManagementView({ currentUser }) {
  const canManage = currentUser?.role === 'Lecturer' || currentUser?.role === 'Manager';
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const loadModules = async () => {
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
    loadModules();
  }, [selectedLevel]);

  const filteredModules = useMemo(() => {
    if (!keyword.trim()) return modules;
    const q = keyword.toLowerCase().trim();
    return modules.filter(m => m.title?.toLowerCase().includes(q));
  }, [modules, keyword]);

  const totalKanjiCount = useMemo(() => {
    return modules.reduce((sum, m) => sum + (m.kanjiCount || 0), 0);
  }, [modules]);

  const openForm = (module = null) => {
    setEditingModule(module);
    setIsModalOpen(true);
  };

  const handleSaveModule = async (formData) => {
    try {
    if (editingModule) {
      await kanjiApi.updateModule(editingModule.moduleId, formData);
      setFeedback({ type: 'success', message: 'Cập nhật module Kanji thành công!' });
    } else {
      await kanjiApi.createModule(formData);
      setFeedback({ type: 'success', message: 'Tạo module Kanji mới thành công!' });
    }
    await loadModules();
    } catch (error) {
      if (error.status === 409) {
        setFeedback({ type: 'conflict', message: 'This content was updated by another lecturer. Please refresh the page before editing it again.' });
      }
      throw error;
    }
  };

  const deleteModule = async (module) => {
    if (!window.confirm(`Bạn có chắc muốn xóa module "${module.title}"? Các chữ Kanji thuộc module này cũng sẽ bị xóa!`)) return;

    try {
      await kanjiApi.deleteModule(module.moduleId);
      setFeedback({ type: 'success', message: 'Đã xóa module Kanji thành công!' });
      await loadModules();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Lỗi khi xóa module.' });
    }
  };

  const getJlptStyle = (level) => {
    switch (level) {
      case 'N1': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'N2': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'N3': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'N4': return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
      default: return { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' };
    }
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🗂️</span>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
              Quản lý Danh mục Module Kanji
            </h2>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: '1px solid #a7f3d0'
            }}>
              {modules.length} Modules • {totalKanjiCount} chữ Kanji
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Tạo, phân loại bài học Kanji theo cấp độ JLPT từ N5 đến N1 và quản lý cấu trúc học liệu
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => openForm()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} strokeWidth={2.5} /> + Thêm Module Mới
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* JLPT Level Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
            Cấp độ JLPT:
          </span>
          {['ALL', ...JLPT_LEVELS].map((level) => {
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: isActive ? '#059669' : '#cbd5e1',
                  background: isActive ? '#059669' : '#fff',
                  color: isActive ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {level === 'ALL' ? 'Tất cả' : level}
              </button>
            );
          })}
        </div>

        {/* Keyword Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '0 1 300px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên module bài học..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem 0.5rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              background: '#fff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

      </div>

      {/* Alert feedback */}
      {feedback.message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: 600,
          background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {feedback.message}
          {feedback.type === 'conflict' && (
            <button type="button" onClick={loadModules} style={{ marginLeft: '12px' }}>Refresh</button>
          )}
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
          ⏳ Đang tải danh sách module Kanji...
        </div>
      ) : filteredModules.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Không tìm thấy Module Kanji nào phù hợp
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 1rem' }}>
            Hãy bấm "+ Thêm Module Mới" để tạo bài học Kanji đầu tiên!
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', minWidth: '1120px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px', width: '80px' }}>ID</th>
                <th style={{ padding: '14px 18px', width: '130px', textAlign: 'center' }}>Cấp Độ JLPT</th>
                <th style={{ padding: '14px 18px' }}>Tên Module Bài Học</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', width: '140px' }}>Số Lượng Kanji</th>
                <th style={{ padding: '14px 18px', width: '140px' }}>Ngày Tạo</th>
                {canManage && <th style={{ padding: '14px 18px', textAlign: 'right', width: '160px' }}>Thao Tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredModules.map((module) => {
                const jlptStyle = getJlptStyle(module.jlptLevel);
                return (
                  <tr
                    key={module.moduleId}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 18px', color: '#64748b', fontWeight: 600 }}>
                      #{module.moduleId}
                    </td>

                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: jlptStyle.bg,
                        color: jlptStyle.text,
                        border: `1px solid ${jlptStyle.border}`
                      }}>
                        {module.jlptLevel}
                      </span>
                    </td>

                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem' }}>
                        {module.title}
                      </div>
                      {module.description && (
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>
                          {module.description}
                        </div>
                      )}
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '7px', lineHeight: 1.5 }}>
                        <div><strong>Added By:</strong> {module.createdByName || '—'}</div>
                        <div>
                          <strong>Last Updated:</strong> {module.updatedByName || module.createdByName || '—'}
                          {module.updatedAt ? ` · ${new Date(module.updatedAt).toLocaleString('vi-VN')}` : ''}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        🏮 {module.kanjiCount ?? 0} chữ
                      </span>
                    </td>

                    <td style={{ padding: '16px 18px', color: '#64748b', fontSize: '0.82rem' }}>
                      {module.createdAt ? new Date(module.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    {canManage && (
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openForm(module)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.4rem 0.75rem',
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Sửa module bài học"
                          >
                            <Edit2 size={13} /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteModule(module)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.4rem 0.75rem',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Xóa module bài học"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add / Edit Module */}
      <KanjiModuleFormModal
        isOpen={isModalOpen}
        module={editingModule}
        defaultLevel={selectedLevel}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModule}
      />

    </div>
  );
}
