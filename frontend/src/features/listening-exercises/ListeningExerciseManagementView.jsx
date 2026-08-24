import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Eye, Headphones, Plus, Search, Trash2 } from 'lucide-react';
import { JLPT_LEVELS } from '../../assets/constants';
import { listeningExerciseApi, resolveListeningAudioUrl } from '../../api/listeningExerciseApi';
import ListeningExerciseDetailModal from './ListeningExerciseDetailModal';
import ListeningExerciseFormModal from './ListeningExerciseFormModal';
import './listeningExercise.css';

const PAGE_SIZE = 8;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
};

export default function ListeningExerciseManagementView({ currentUser }) {
  const [exercises, setExercises] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [jlptLevel, setJlptLevel] = useState('');
  const [onlyMine, setOnlyMine] = useState(currentUser?.role === 'Lecturer');
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const canCreate = currentUser?.role === 'Lecturer';
  const canModify = (exercise) => currentUser?.role === 'Manager'
    || (currentUser?.role === 'Lecturer' && exercise.createdById === currentUser?.accountId);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { keyword, jlptLevel, page, size: PAGE_SIZE, sort: 'updatedAt,desc' };
      const response = onlyMine
        ? await listeningExerciseApi.searchMine(params)
        : await listeningExerciseApi.search(params);
      const data = response.data || {};
      setExercises(data.content || []);
      setPageInfo({
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        hasNext: Boolean(data.hasNext),
        hasPrevious: Boolean(data.hasPrevious)
      });
    } catch (requestError) {
      setExercises([]);
      setError(requestError.message || 'Không thể tải danh sách bài nghe.');
    } finally {
      setLoading(false);
    }
  }, [jlptLevel, keyword, onlyMine, page]);

  useEffect(() => { loadExercises(); }, [loadExercises]);
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const openDetail = async (exercise) => {
    try {
      const response = await listeningExerciseApi.getById(exercise.listeningExerciseId);
      setViewing(response.data || exercise);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải chi tiết bài nghe.');
    }
  };

  const handleSaved = () => {
    const wasEditing = Boolean(editing);
    setShowForm(false);
    setEditing(null);
    setNotice(wasEditing ? 'Đã cập nhật bài nghe.' : 'Đã tạo bài nghe mới.');
    if (!wasEditing) setPage(0);
    loadExercises();
  };

  const handleDelete = async (exercise) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài nghe “${exercise.title}”? File audio cũng sẽ bị xóa và không thể khôi phục.`)) return;
    setDeletingId(exercise.listeningExerciseId);
    setError('');
    try {
      await listeningExerciseApi.remove(exercise.listeningExerciseId);
      setNotice('Đã xóa bài nghe và file audio.');
      if (exercises.length === 1 && page > 0) setPage((value) => value - 1);
      else loadExercises();
    } catch (requestError) {
      setError(requestError.message || 'Không thể xóa bài nghe.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="le-workspace">
      <header className="le-hero">
        <div className="le-hero-copy"><div className="le-hero-icon"><Headphones size={26} /></div><div>
          <span>LECTURER WORKSPACE</span><h2>Listening Exercise Management</h2>
          <p>Quản lý audio luyện nghe, listening script và bản dịch theo cấp độ JLPT.</p>
        </div></div>
        {canCreate && <button type="button" className="le-button hero" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Tạo bài nghe</button>}
      </header>

      {notice && <div className="le-alert le-alert-success">✓ {notice}</div>}
      {error && <div className="le-alert le-alert-error">⚠ {error}</div>}

      <div className="le-filter-card">
        <form className="le-search" onSubmit={(event) => { event.preventDefault(); setKeyword(keywordInput.trim()); setPage(0); }}>
          <Search size={18} /><input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tìm tiêu đề, script hoặc bản dịch..." />
          {keywordInput && <button type="button" onClick={() => { setKeywordInput(''); setKeyword(''); setPage(0); }}>Xóa</button>}
          <button type="submit" className="submit">Tìm kiếm</button>
        </form>
        <div className="le-filter-row">
          <div className="le-level-filter">
            <button type="button" className={!jlptLevel ? 'active' : ''} onClick={() => { setJlptLevel(''); setPage(0); }}>Tất cả</button>
            {JLPT_LEVELS.map((level) => <button type="button" key={level.value} className={jlptLevel === level.value ? 'active' : ''} onClick={() => { setJlptLevel(level.value); setPage(0); }}>{level.value}</button>)}
          </div>
          {currentUser?.role === 'Lecturer' && <label className="le-mine"><input type="checkbox" checked={onlyMine} onChange={(event) => { setOnlyMine(event.target.checked); setPage(0); }} /> Chỉ bài của tôi</label>}
        </div>
      </div>

      <div className="le-list-card">
        <div className="le-summary"><div><strong>{pageInfo.totalElements}</strong> bài nghe</div><span>Trang {pageInfo.totalPages ? page + 1 : 0}/{pageInfo.totalPages}</span></div>
        {loading ? <div className="le-state"><div className="le-spinner" /> Đang tải bài nghe...</div>
          : exercises.length === 0 ? <div className="le-empty"><Headphones size={32} /><h3>Chưa tìm thấy bài nghe</h3><p>Thay đổi bộ lọc hoặc tạo bài nghe đầu tiên.</p>{canCreate && <button type="button" className="le-button primary" onClick={() => setShowForm(true)}><Plus size={17} /> Tạo bài nghe</button>}</div>
            : <div className="le-table-scroll"><table className="le-table"><thead><tr><th>Bài nghe</th><th>JLPT</th><th>Audio</th><th>Người tạo</th><th>Cập nhật</th><th aria-label="Thao tác" /></tr></thead><tbody>
              {exercises.map((exercise) => <tr key={exercise.listeningExerciseId}>
                <td><button type="button" className="le-title" onClick={() => openDetail(exercise)}><strong>{exercise.title}</strong><small>ID #{exercise.listeningExerciseId}</small></button></td>
                <td><span className={`le-level is-${exercise.jlptLevel?.toLowerCase()}`}>{exercise.jlptLevel}</span></td>
                <td><audio className="le-table-audio" controls preload="none" src={resolveListeningAudioUrl(exercise.audioUrl)} /></td>
                <td><div className="le-author"><span>{(exercise.createdByName || 'L')[0].toUpperCase()}</span><div><strong>{exercise.createdByName || 'Lecturer'}</strong><small>{exercise.createdByEmail || ''}</small></div></div></td>
                <td>{formatDate(exercise.updatedAt)}</td>
                <td><div className="le-actions"><button type="button" title="Xem" onClick={() => openDetail(exercise)}><Eye size={17} /></button>{canModify(exercise) && <><button type="button" title="Sửa" onClick={() => { setEditing(exercise); setShowForm(true); }}><Edit3 size={17} /></button><button type="button" className="danger" title="Xóa" disabled={deletingId === exercise.listeningExerciseId} onClick={() => handleDelete(exercise)}><Trash2 size={17} /></button></>}</div></td>
              </tr>)}
            </tbody></table></div>}
        {pageInfo.totalPages > 1 && <div className="le-pagination"><button type="button" disabled={!pageInfo.hasPrevious || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /> Trang trước</button><span>{page + 1} / {pageInfo.totalPages}</span><button type="button" disabled={!pageInfo.hasNext || loading} onClick={() => setPage((value) => value + 1)}>Trang sau <ChevronRight size={17} /></button></div>}
      </div>

      {showForm && <ListeningExerciseFormModal exercise={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
      {viewing && <ListeningExerciseDetailModal exercise={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}
