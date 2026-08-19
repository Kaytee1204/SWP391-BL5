 import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';
import PaginationBar from '../../components/common/PaginationBar';
import QuestionFormModal from './components/QuestionFormModal';

const SKILLS = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'listening', label: 'Nghe hiểu' },
  { value: 'reading', label: 'Đọc hiểu' }
];

const SKILL_LABELS = Object.fromEntries(SKILLS.map(item => [item.value, item.label]));
const TYPE_LABELS = { multiple_choice: 'Trắc nghiệm', fill_blank: 'Điền chỗ trống' };

export default function QuestionBankManagementView() {
  const [questions, setQuestions] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ keyword: '', skillType: '', jlptLevel: '', questionType: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), size: '10', sort: 'createdAt,desc' });
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    try {
      const response = await apiRequest(`/question-bank?${params.toString()}`);
      const data = response.data || {};
      setQuestions(data.content || []);
      setPageInfo({
        page: data.page || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      });
    } catch (err) {
      setError(err.message || 'Không thể tải ngân hàng câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const empty = { keyword: '', skillType: '', jlptLevel: '', questionType: '' };
    setFilters(empty);
    setPage(0);
    setAppliedFilters(empty);
  };

  const handleDelete = async (question) => {
    if (!window.confirm(`Xóa câu hỏi #${question.questionId}? Hành động này không thể hoàn tác.`)) return;
    try {
      await apiRequest(`/question-bank/${question.questionId}`, 'DELETE');
      if (questions.length === 1 && page > 0) setPage(page - 1);
      else fetchQuestions();
    } catch (err) {
      window.alert(`Không thể xóa câu hỏi: ${err.message}`);
    }
  };

  const handleSaved = () => {
    setPage(0);
    if (page === 0) fetchQuestions();
  };

  return (
    <section className="question-bank-view">
      <header className="question-bank-hero">
        <div>
          <div className="question-bank-kicker">LECTURER WORKSPACE</div>
          <h2>Ngân hàng câu hỏi</h2>
          <p>Quản lý câu hỏi JLPT theo kỹ năng, trình độ và dạng bài.</p>
        </div>
        <div className="question-bank-hero-actions">
          <div className="question-count-card">
            <strong>{pageInfo.totalElements}</strong>
            <span>câu hỏi</span>
          </div>
          <button className="question-create-btn" onClick={() => setShowCreate(true)}>＋ Tạo câu hỏi</button>
        </div>
      </header>

      <form className="question-filter-card" onSubmit={applyFilters}>
        <div className="question-search-wrap">
          <span>⌕</span>
          <input
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Tìm nội dung hoặc giải thích..."
          />
        </div>
        <select value={filters.skillType} onChange={e => setFilters({ ...filters, skillType: e.target.value })}>
          {SKILLS.map(skill => <option key={skill.value} value={skill.value}>{skill.label}</option>)}
        </select>
        <select value={filters.jlptLevel} onChange={e => setFilters({ ...filters, jlptLevel: e.target.value })}>
          <option value="">Tất cả trình độ</option>
          {JLPT_LEVELS.map(level => <option key={level.value} value={level.value}>{level.value}</option>)}
        </select>
        <select value={filters.questionType} onChange={e => setFilters({ ...filters, questionType: e.target.value })}>
          <option value="">Tất cả dạng bài</option>
          <option value="multiple_choice">Trắc nghiệm</option>
          <option value="fill_blank">Điền chỗ trống</option>
        </select>
        <button className="question-filter-submit" type="submit">Lọc</button>
        <button className="question-filter-reset" type="button" onClick={resetFilters}>Đặt lại</button>
      </form>

      <div className="question-table-card">
        {loading ? (
          <div className="question-state"><div className="question-spinner" />Đang tải câu hỏi...</div>
        ) : error ? (
          <div className="question-state question-state-error"><strong>Không tải được dữ liệu</strong><span>{error}</span><button onClick={fetchQuestions}>Thử lại</button></div>
        ) : questions.length === 0 ? (
          <div className="question-state"><div className="question-empty-icon">?</div><strong>Chưa tìm thấy câu hỏi</strong><span>Thử thay đổi bộ lọc hoặc tạo câu hỏi đầu tiên.</span></div>
        ) : (
          <div className="question-table-scroll">
            <table className="question-table">
              <thead><tr><th>Câu hỏi</th><th>Phân loại</th><th>Đáp án</th><th>Người tạo</th><th>Cập nhật</th><th /></tr></thead>
              <tbody>
                {questions.map(question => {
                  const expanded = expandedId === question.questionId;
                  return (
                    <React.Fragment key={question.questionId}>
                      <tr>
                        <td className="question-main-cell">
                          <span className="question-id">#{question.questionId}</span>
                          <button className="question-title-button" onClick={() => setExpandedId(expanded ? null : question.questionId)}>{question.questionText}</button>
                          <span className="question-type-line">{TYPE_LABELS[question.questionType]}</span>
                        </td>
                        <td><div className="question-tag-stack"><span className={`question-level question-level-${question.jlptLevel?.toLowerCase()}`}>{question.jlptLevel}</span><span className="question-skill">{SKILL_LABELS[question.skillType] || question.skillType}</span></div></td>
                        <td><div className="question-answer-preview">{(question.correctAnswers || []).map(answer => <span key={answer}>✓ {answer}</span>)}</div></td>
                        <td><div className="question-author"><strong>{question.createdByName || 'Không rõ'}</strong><span>{question.createdByEmail}</span></div></td>
                        <td className="question-date">{question.updatedAt ? new Date(question.updatedAt).toLocaleDateString('vi-VN') : '—'}</td>
                        <td><div className="question-row-actions"><button onClick={() => setEditingQuestion(question)} title="Chỉnh sửa">✎</button><button className="danger" onClick={() => handleDelete(question)} title="Xóa">⌫</button></div></td>
                      </tr>
                      {expanded && (
                        <tr className="question-detail-row"><td colSpan="6"><div className="question-detail-panel">
                          {question.choices?.length > 0 && <div><strong>Lựa chọn</strong><ol>{question.choices.map(choice => <li key={choice} className={question.correctAnswers?.includes(choice) ? 'correct' : ''}>{choice}{question.correctAnswers?.includes(choice) && <span>Đáp án đúng</span>}</li>)}</ol></div>}
                          <div><strong>Giải thích</strong><p>{question.explanation || 'Chưa có giải thích cho câu hỏi này.'}</p></div>
                        </div></td></tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && questions.length > 0 && (
          <div className="question-pagination-wrap"><PaginationBar page={pageInfo.page} totalPages={pageInfo.totalPages} onPageChange={setPage} /></div>
        )}
      </div>

      {showCreate && <QuestionFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editingQuestion && <QuestionFormModal question={editingQuestion} onClose={() => setEditingQuestion(null)} onSaved={handleSaved} />}
    </section>
  );
}
