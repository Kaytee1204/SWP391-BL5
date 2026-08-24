import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpenCheck,
  CalendarDays,
  FileStack,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound
} from 'lucide-react';
import { questionSetApi } from '../../api/questionSetApi';
import PaginationBar from '../../components/common/PaginationBar';
import QuestionSetBuilderModal from './components/QuestionSetBuilderModal';
import QuestionSetFormModal from './components/QuestionSetFormModal';
import { QUESTION_SET_LEVELS, QUESTION_SET_SKILLS, SKILL_META } from './questionSetConstants';
import './question-set.css';

const PAGE_SIZE = 9;
const EMPTY_FILTERS = { keyword: '', skillType: '', jlptLevel: '' };

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

export default function QuestionSetManagementView({ currentUser }) {
  const [sets, setSets] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [buildingSetId, setBuildingSetId] = useState(null);
  const currentUserId = currentUser?.accountId || currentUser?.id;
  const isManager = currentUser?.role?.toLowerCase() === 'manager';

  const loadSets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await questionSetApi.search({
        ...appliedFilters,
        page,
        size: PAGE_SIZE,
        sort: 'questionSetId,asc'
      });
      const data = response.data || {};
      setSets(data.content || []);
      setPageInfo({
        page: data.page || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bộ câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const handleSaved = () => {
    setShowCreate(false);
    setEditingSet(null);
    loadSets();
  };

  const handleBuilderSaved = () => {
    loadSets();
  };

  const handleDelete = async (questionSet) => {
    const confirmed = window.confirm(
      `Xóa bộ câu hỏi “${questionSet.title}”?\n\nCác câu hỏi gốc trong Question Bank sẽ không bị xóa.`
    );
    if (!confirmed) return;

    try {
      await questionSetApi.remove(questionSet.questionSetId);
      if (sets.length === 1 && page > 0) setPage((current) => current - 1);
      else loadSets();
    } catch (err) {
      window.alert(err.message || 'Không thể xóa bộ câu hỏi.');
    }
  };

  return (
    <div className="qs-page">
      <section className="qs-hero">
        <div className="qs-hero-content">
          <span className="qs-hero-kicker">
            {currentUser?.role === 'Manager' ? 'Manager workspace' : 'Lecturer workspace'}
          </span>
          <h2>Question Set Management</h2>
          <p>Kho đề dùng chung: mọi giảng viên có thể xem, chỉnh sửa và cùng xây dựng bộ đề hoàn chỉnh.</p>
          <div className="qs-hero-stats">
            <span><FileStack size={16} /> {pageInfo.totalElements} bộ câu hỏi</span>
            <span><BookOpenCheck size={16} /> Tái sử dụng từ Question Bank</span>
          </div>
        </div>
        <button type="button" className="qs-create-button" onClick={() => setShowCreate(true)}>
          <Plus size={19} /> Tạo bộ câu hỏi
        </button>
      </section>

      <form className="qs-filter-bar" onSubmit={applyFilters}>
        <label className="qs-search-field">
          <Search size={18} />
          <input
            value={filters.keyword}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            placeholder="Tìm theo tên hoặc mô tả..."
          />
        </label>

        <select
          value={filters.skillType}
          onChange={(event) => setFilters((current) => ({ ...current, skillType: event.target.value }))}
        >
          {QUESTION_SET_SKILLS.map((skill) => (
            <option key={skill.value || 'all'} value={skill.value}>{skill.icon || '◉'} {skill.label}</option>
          ))}
        </select>

        <select
          value={filters.jlptLevel}
          onChange={(event) => setFilters((current) => ({ ...current, jlptLevel: event.target.value }))}
        >
          {QUESTION_SET_LEVELS.map((level) => (
            <option key={level || 'all'} value={level}>{level || 'Tất cả level'}</option>
          ))}
        </select>

        <button type="submit" className="qs-button qs-button-primary">Lọc</button>
        <button type="button" className="qs-button qs-button-secondary" onClick={resetFilters}>Đặt lại</button>
      </form>

      {loading ? (
        <div className="qs-page-state"><div className="spinner" /><strong>Đang tải danh sách bộ câu hỏi...</strong></div>
      ) : error ? (
        <div className="qs-page-state is-error">
          <strong>{error}</strong>
          <button type="button" className="qs-button qs-button-secondary" onClick={loadSets}>Thử lại</button>
        </div>
      ) : sets.length === 0 ? (
        <div className="qs-page-state">
          <FileStack size={48} />
          <strong>Chưa có bộ câu hỏi nào</strong>
          <span>Tạo bộ đầu tiên, sau đó chọn câu hỏi từ Question Bank.</span>
          <button type="button" className="qs-button qs-button-primary" onClick={() => setShowCreate(true)}>
            <Plus size={17} /> Tạo bộ câu hỏi
          </button>
        </div>
      ) : (
        <section className="qs-card-grid">
          {sets.map((questionSet) => {
            const skill = SKILL_META[questionSet.skillType] || {
              label: questionSet.skillType,
              icon: '📌',
              color: '#475569',
              background: '#f1f5f9'
            };
            const isOwner = Boolean(currentUserId)
              && String(questionSet.createdById) === String(currentUserId);
            const canDelete = isManager || isOwner;

            return (
              <article className="qs-set-card" key={questionSet.questionSetId}>
                <div className="qs-set-card-accent" style={{ background: skill.color }} />
                <div className="qs-set-card-header">
                  <div className="qs-set-badges">
                    <span style={{ color: skill.color, background: skill.background }}>{skill.icon} {skill.label}</span>
                    <span className={`qs-level-badge is-${questionSet.jlptLevel?.toLowerCase()}`}>{questionSet.jlptLevel}</span>
                    <span className={`qs-ownership-badge ${isOwner ? 'is-owned' : 'is-shared'}`}>
                      {isOwner ? 'Đề của tôi' : 'Đề được chia sẻ'}
                    </span>
                  </div>
                  <span className="qs-set-id">#{questionSet.questionSetId}</span>
                </div>

                <div className="qs-set-card-body">
                  <h3>{questionSet.title}</h3>
                  <p>{questionSet.description || 'Chưa có mô tả cho bộ câu hỏi này.'}</p>
                </div>

                <div className="qs-set-card-metrics">
                  <div>
                    <strong>{questionSet.questionCount}</strong>
                    <span>Câu hỏi</span>
                  </div>
                  <div>
                    <UserRound size={15} />
                    <span>{questionSet.createdByName || 'Lecturer'}</span>
                  </div>
                  <div>
                    <CalendarDays size={15} />
                    <span>{formatDate(questionSet.updatedAt)}</span>
                  </div>
                </div>

                <div className="qs-set-card-actions">
                  <button type="button" className="qs-build-button" onClick={() => setBuildingSetId(questionSet.questionSetId)}>
                    <BookOpenCheck size={17} /> Xây dựng bộ đề
                  </button>
                  <button type="button" onClick={() => setEditingSet(questionSet)} title="Chỉnh sửa thông tin đề chung">
                    <Pencil size={17} />
                  </button>
                  {canDelete && (
                    <button type="button" className="is-danger" onClick={() => handleDelete(questionSet)} title="Xóa bộ câu hỏi">
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && !error && pageInfo.totalPages > 1 && (
        <div className="qs-pagination-wrap">
          <PaginationBar page={pageInfo.page} totalPages={pageInfo.totalPages} onPageChange={setPage} />
        </div>
      )}

      {showCreate && (
        <QuestionSetFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {editingSet && (
        <QuestionSetFormModal questionSet={editingSet} onClose={() => setEditingSet(null)} onSaved={handleSaved} />
      )}
      {buildingSetId && (
        <QuestionSetBuilderModal
          questionSetId={buildingSetId}
          onClose={() => setBuildingSetId(null)}
          onSaved={handleBuilderSaved}
        />
      )}
    </div>
  );
}
