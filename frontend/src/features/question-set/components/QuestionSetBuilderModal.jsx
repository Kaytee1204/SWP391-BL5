import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  ListPlus,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { apiRequest } from '../../../api/apiRequest';
import { questionSetApi } from '../../../api/questionSetApi';
import QuestionFormModal from '../../question-bank/components/QuestionFormModal';
import { QUESTION_TYPE_LABELS, SKILL_META } from '../questionSetConstants';

const AVAILABLE_PAGE_SIZE = 8;

const questionTypeLabel = (type) => QUESTION_TYPE_LABELS[type] || type || 'Không xác định';

function QuestionPreview({ question, action, selected = false }) {
  const questionSkill = SKILL_META[question.skillType];
  return (
    <article className={`qs-question-card${selected ? ' is-selected' : ''}`}>
      <div className="qs-question-card-main">
        <div className="qs-question-card-topline">
          <span>#{question.questionId}</span>
          <span>{questionSkill?.icon} {questionSkill?.label || question.skillType}</span>
          <span>{questionTypeLabel(question.questionType)}</span>
        </div>
        <p>{question.questionText}</p>
        <div className="qs-answer-preview">
          Đáp án: <strong>{(question.correctAnswers || []).join(', ') || '—'}</strong>
        </div>
      </div>
      {action}
    </article>
  );
}

export default function QuestionSetBuilderModal({ questionSetId, onClose, onSaved }) {
  const [questionSet, setQuestionSet] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [availablePage, setAvailablePage] = useState(0);
  const [availablePageInfo, setAvailablePageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [loadingSet, setLoadingSet] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const loadSet = async () => {
      setLoadingSet(true);
      setError('');
      try {
        const response = await questionSetApi.getById(questionSetId);
        if (!active) return;
        const data = response.data;
        setQuestionSet(data);
        setSelectedQuestions((data.questions || []).map((item) => item.question));
      } catch (err) {
        if (active) setError(err.message || 'Không thể tải bộ câu hỏi.');
      } finally {
        if (active) setLoadingSet(false);
      }
    };

    loadSet();
    return () => { active = false; };
  }, [questionSetId]);

  const loadAvailableQuestions = useCallback(async () => {
    if (!questionSet) return;
    setLoadingQuestions(true);
    setError('');

    const params = new URLSearchParams({
      jlptLevel: questionSet.jlptLevel,
      page: String(availablePage),
      size: String(AVAILABLE_PAGE_SIZE),
      sort: 'questionId,asc'
    });
    if (questionSet.skillType !== 'mixed') params.set('skillType', questionSet.skillType);
    if (keyword) params.set('keyword', keyword);

    try {
      const response = await apiRequest(`/question-bank?${params.toString()}`);
      const data = response.data || {};
      setAvailableQuestions(data.content || []);
      setAvailablePageInfo({
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      });
    } catch (err) {
      setError(err.message || 'Không thể tải câu hỏi phù hợp.');
    } finally {
      setLoadingQuestions(false);
    }
  }, [availablePage, keyword, questionSet]);

  useEffect(() => {
    loadAvailableQuestions();
  }, [loadAvailableQuestions]);

  const selectedIds = useMemo(
    () => new Set(selectedQuestions.map((question) => question.questionId)),
    [selectedQuestions]
  );

  const addQuestion = (question) => {
    if (selectedIds.has(question.questionId)) return;
    setSelectedQuestions((current) => [...current, question]);
    setSuccess('');
  };

  const removeQuestion = (questionId) => {
    setSelectedQuestions((current) => current.filter((question) => question.questionId !== questionId));
    setSuccess('');
  };

  const moveQuestion = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedQuestions.length) return;

    setSelectedQuestions((current) => {
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
    setSuccess('');
  };

  const applySearch = (event) => {
    event.preventDefault();
    setAvailablePage(0);
    setKeyword(keywordInput.trim());
  };

  const saveQuestions = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const ids = selectedQuestions.map((question) => question.questionId);
      const response = await questionSetApi.replaceQuestions(questionSetId, ids);
      const updated = response.data;
      setQuestionSet(updated);
      setSelectedQuestions((updated.questions || []).map((item) => item.question));
      setSuccess('Đã lưu danh sách và thứ tự câu hỏi.');
      onSaved(updated);
    } catch (err) {
      setError(err.message || 'Không thể lưu danh sách câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineQuestionCreated = (updatedSet) => {
    const returnedQuestions = (updatedSet.questions || []).map((item) => item.question);

    setSelectedQuestions((current) => {
      const currentIds = new Set(current.map((question) => question.questionId));
      const createdQuestion = [...returnedQuestions]
        .reverse()
        .find((question) => !currentIds.has(question.questionId));

      return createdQuestion ? [...current, createdQuestion] : current;
    });

    setQuestionSet(updatedSet);
    setSuccess('Đã tạo câu hỏi mới và thêm trực tiếp vào bộ đề.');
    setError('');
    onSaved(updatedSet);
  };

  const skill = questionSet ? SKILL_META[questionSet.skillType] : null;

  return (
    <div className="qs-modal-backdrop" role="presentation">
      <section className="qs-modal qs-builder-modal" role="dialog" aria-modal="true">
        <header className="qs-builder-header">
          <div>
            <span className="qs-eyebrow">Question set builder</span>
            <h3>{questionSet?.title || 'Đang tải bộ câu hỏi...'}</h3>
            {questionSet && (
              <div className="qs-builder-meta">
                <span>{skill?.icon} {skill?.label || questionSet.skillType}</span>
                <span>{questionSet.jlptLevel}</span>
                <span>{selectedQuestions.length} câu hỏi đang chọn</span>
              </div>
            )}
          </div>
          <button type="button" className="qs-icon-button" onClick={onClose} aria-label="Đóng">
            <X size={22} />
          </button>
        </header>

        {error && <div className="qs-builder-message qs-alert qs-alert-error">{error}</div>}
        {success && <div className="qs-builder-message qs-alert qs-alert-success"><Check size={17} /> {success}</div>}

        {loadingSet ? (
          <div className="qs-loading-state"><div className="spinner" /> Đang tải bộ câu hỏi...</div>
        ) : questionSet ? (
          <div className="qs-builder-grid">
            <section className="qs-builder-pane">
              <div className="qs-pane-header">
                <div>
                  <span className="qs-pane-step">1</span>
                  <div>
                    <h4>Ngân hàng phù hợp</h4>
                    <p>{availablePageInfo.totalElements} câu {questionSet.skillType === 'mixed' ? 'thuộc mọi kỹ năng cùng level' : 'cùng skill và level'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="qs-inline-create-button"
                  onClick={() => setShowInlineCreate(true)}
                >
                  <FilePlus2 size={16} /> Tạo câu hỏi trực tiếp
                </button>
              </div>

              <form className="qs-builder-search" onSubmit={applySearch}>
                <Search size={17} />
                <input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="Tìm nội dung hoặc giải thích..."
                />
                <button type="submit">Tìm</button>
              </form>

              <div className="qs-question-list">
                {loadingQuestions ? (
                  <div className="qs-empty-state"><div className="spinner" /> Đang tải câu hỏi...</div>
                ) : availableQuestions.length === 0 ? (
                  <div className="qs-empty-state">Không có câu hỏi phù hợp với bộ lọc này.</div>
                ) : availableQuestions.map((question) => {
                  const alreadySelected = selectedIds.has(question.questionId);
                  return (
                    <QuestionPreview
                      key={question.questionId}
                      question={question}
                      selected={alreadySelected}
                      action={(
                        <button
                          type="button"
                          className={`qs-add-button${alreadySelected ? ' is-added' : ''}`}
                          disabled={alreadySelected}
                          onClick={() => addQuestion(question)}
                          title={alreadySelected ? 'Đã có trong bộ' : 'Thêm vào bộ'}
                        >
                          {alreadySelected ? <Check size={17} /> : <Plus size={17} />}
                        </button>
                      )}
                    />
                  );
                })}
              </div>

              <div className="qs-mini-pagination">
                <button
                  type="button"
                  disabled={availablePage === 0}
                  onClick={() => setAvailablePage((page) => page - 1)}
                ><ChevronLeft size={17} /></button>
                <span>Trang {availablePageInfo.totalPages === 0 ? 0 : availablePage + 1}/{availablePageInfo.totalPages}</span>
                <button
                  type="button"
                  disabled={availablePage + 1 >= availablePageInfo.totalPages}
                  onClick={() => setAvailablePage((page) => page + 1)}
                ><ChevronRight size={17} /></button>
              </div>
            </section>

            <section className="qs-builder-pane qs-selected-pane">
              <div className="qs-pane-header">
                <div>
                  <span className="qs-pane-step">2</span>
                  <div>
                    <h4>Cấu trúc bộ câu hỏi</h4>
                    <p>Dùng mũi tên để điều chỉnh thứ tự làm bài</p>
                  </div>
                </div>
                {selectedQuestions.length > 0 && (
                  <button type="button" className="qs-clear-button" onClick={() => setSelectedQuestions([])}>
                    Xóa hết
                  </button>
                )}
              </div>

              <div className="qs-selected-list">
                {selectedQuestions.length === 0 ? (
                  <div className="qs-empty-selection">
                    <ListPlus size={38} />
                    <strong>Bộ câu hỏi đang trống</strong>
                    <span>Chọn câu hỏi từ ngân hàng bên trái.</span>
                  </div>
                ) : selectedQuestions.map((question, index) => (
                  <div className="qs-selected-row" key={question.questionId}>
                    <span className="qs-order-number">{index + 1}</span>
                    <div className="qs-selected-question">
                      <span>#{question.questionId} · {SKILL_META[question.skillType]?.icon} {SKILL_META[question.skillType]?.label || question.skillType} · {questionTypeLabel(question.questionType)}</span>
                      <p>{question.questionText}</p>
                    </div>
                    <div className="qs-row-actions">
                      <button type="button" disabled={index === 0} onClick={() => moveQuestion(index, -1)} title="Đưa lên">
                        <ArrowUp size={16} />
                      </button>
                      <button type="button" disabled={index === selectedQuestions.length - 1} onClick={() => moveQuestion(index, 1)} title="Đưa xuống">
                        <ArrowDown size={16} />
                      </button>
                      <button type="button" className="is-danger" onClick={() => removeQuestion(question.questionId)} title="Xóa khỏi bộ">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        <footer className="qs-builder-footer">
          <button type="button" className="qs-button qs-button-secondary" onClick={onClose}>Đóng</button>
          <button
            type="button"
            className="qs-button qs-button-primary"
            onClick={saveQuestions}
            disabled={saving || loadingSet || !questionSet}
          >
            <Save size={17} /> {saving ? 'Đang lưu...' : `Lưu ${selectedQuestions.length} câu hỏi`}
          </button>
        </footer>
      </section>

      {showInlineCreate && questionSet && (
        <QuestionFormModal
          fixedClassification={questionSet.skillType === 'mixed'
            ? { jlptLevel: questionSet.jlptLevel }
            : { skillType: questionSet.skillType, jlptLevel: questionSet.jlptLevel }}
          contextLabel={`Tạo câu hỏi trong “${questionSet.title}”`}
          onCreateRequest={(payload) => questionSetApi.createQuestionInsideSet(questionSetId, payload)}
          onSaved={handleInlineQuestionCreated}
          onClose={() => setShowInlineCreate(false)}
        />
      )}
    </div>
  );
}
