import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { JLPT_LEVELS } from '../../assets/constants';
import { readingPassageApi } from '../../api/readingPassageApi';
import ReadingPassageDetailModal from './ReadingPassageDetailModal';
import ReadingPassageFormModal from './ReadingPassageFormModal';
import './readingPassage.css';

const PAGE_SIZE = 8;

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(parsed);
};

export default function ReadingPassageManagementView({ currentUser }) {
  const [passages, setPassages] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [jlptLevel, setJlptLevel] = useState('');
  const [onlyMine, setOnlyMine] = useState(currentUser?.role === 'Lecturer');
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingPassage, setEditingPassage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingPassage, setViewingPassage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const canCreate = currentUser?.role === 'Lecturer';

  const loadPassages = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        keyword,
        jlptLevel,
        page,
        size: PAGE_SIZE,
        sort: 'passageId,asc'
      };
      const response = onlyMine
        ? await readingPassageApi.getMine(params)
        : await readingPassageApi.getAll(params);
      const data = response.data || {};

      setPassages(data.content || []);
      setPageInfo({
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        hasNext: Boolean(data.hasNext),
        hasPrevious: Boolean(data.hasPrevious)
      });
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải danh sách bài đọc.');
      setPassages([]);
    } finally {
      setLoading(false);
    }
  }, [jlptLevel, keyword, onlyMine, page]);

  useEffect(() => {
    loadPassages();
  }, [loadPassages]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const handleOpenCreate = () => {
    setEditingPassage(null);
    setShowForm(true);
  };

  const handleOpenEdit = (passage) => {
    setEditingPassage(passage);
    setShowForm(true);
  };

  const handleView = async (passage) => {
    try {
      const response = await readingPassageApi.getById(passage.passageId);
      setViewingPassage(response.data || passage);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải chi tiết bài đọc.');
    }
  };

  const handleSaved = (savedPassage) => {
    const wasEditing = Boolean(editingPassage);
    setShowForm(false);
    setEditingPassage(null);
    setNotice(wasEditing ? 'Đã cập nhật bài đọc.' : 'Đã tạo bài đọc mới.');

    if (savedPassage && wasEditing) {
      setPassages((items) => items.map((item) => (
        item.passageId === savedPassage.passageId ? savedPassage : item
      )));
    } else {
      setPage(0);
      loadPassages();
    }
  };

  const handleDelete = async (passage) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa bài “${passage.title}”? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setDeletingId(passage.passageId);
    setError('');
    try {
      await readingPassageApi.delete(passage.passageId);
      setNotice('Đã xóa bài đọc.');
      if (passages.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        loadPassages();
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể xóa bài đọc.');
    } finally {
      setDeletingId(null);
    }
  };

  const canModify = (passage) => (
    currentUser?.role === 'Manager'
    || (currentUser?.role === 'Lecturer' && passage.createdById === currentUser?.accountId)
  );

  return (
    <section className="rp-workspace">
      <header className="rp-hero">
        <div className="rp-hero-copy">
          <div className="rp-hero-icon"><BookOpen size={25} /></div>
          <div>
            <span className="rp-eyebrow rp-eyebrow-light">LECTURER WORKSPACE</span>
            <h2>Reading Passage Management</h2>
            <p>Biên soạn bài đọc tiếng Nhật có Furigana, bản dịch và chế độ xem thử.</p>
          </div>
        </div>
        {canCreate && (
          <button type="button" className="rp-button rp-button-hero" onClick={handleOpenCreate}>
            <Plus size={18} /> Tạo bài đọc
          </button>
        )}
      </header>

      {notice && <div className="rp-alert rp-alert-success">✓ {notice}</div>}
      {error && <div className="rp-alert rp-alert-error">⚠ {error}</div>}

      <div className="rp-filter-card">
        <form className="rp-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Tìm theo tiêu đề hoặc bản dịch..."
          />
          {keywordInput && (
            <button
              type="button"
              className="rp-search-clear"
              onClick={() => {
                setKeywordInput('');
                setKeyword('');
                setPage(0);
              }}
            >
              Xóa
            </button>
          )}
          <button type="submit" className="rp-search-submit">Tìm kiếm</button>
        </form>

        <div className="rp-filter-row">
          <div className="rp-level-filter">
            <button
              type="button"
              className={!jlptLevel ? 'active' : ''}
              onClick={() => { setJlptLevel(''); setPage(0); }}
            >
              Tất cả
            </button>
            {JLPT_LEVELS.map((level) => (
              <button
                type="button"
                key={level.value}
                className={jlptLevel === level.value ? 'active' : ''}
                onClick={() => { setJlptLevel(level.value); setPage(0); }}
              >
                {level.value}
              </button>
            ))}
          </div>

          {currentUser?.role === 'Lecturer' && (
            <label className="rp-mine-toggle">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(event) => {
                  setOnlyMine(event.target.checked);
                  setPage(0);
                }}
              />
              Chỉ bài của tôi
            </label>
          )}
        </div>
      </div>

      <div className="rp-table-card">
        <div className="rp-table-summary">
          <div>
            <strong>{pageInfo.totalElements}</strong> bài đọc
          </div>
          <span>Trang {pageInfo.totalPages ? page + 1 : 0}/{pageInfo.totalPages}</span>
        </div>

        {loading ? (
          <div className="rp-state"><div className="rp-spinner" />Đang tải bài đọc...</div>
        ) : passages.length === 0 ? (
          <div className="rp-empty">
            <div><FileText size={30} /></div>
            <h3>Chưa tìm thấy bài đọc</h3>
            <p>Thay đổi bộ lọc hoặc tạo bài đọc đầu tiên của bạn.</p>
            {canCreate && (
              <button type="button" className="rp-button rp-button-primary" onClick={handleOpenCreate}>
                <Plus size={17} /> Tạo bài đọc
              </button>
            )}
          </div>
        ) : (
          <div className="rp-table-scroll">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Bài đọc</th>
                  <th>JLPT</th>
                  <th>Người tạo</th>
                  <th>Cập nhật</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {passages.map((passage,index) => (
                  <tr key={passage.passageId}>
                    <td>{page*PAGE_SIZE+index+1}</td>
                    <td>
                      <button type="button" className="rp-title-button" onClick={() => handleView(passage)}>
                        <span>{passage.title}</span>
                        <small>ID #{passage.passageId}</small>
                      </button>
                    </td>
                    <td>
                      <span className={`rp-level rp-level-${passage.jlptLevel?.toLowerCase()}`}>{passage.jlptLevel}</span>
                    </td>
                    <td>
                      <div className="rp-author">
                        <span>{(passage.createdByName || 'L').charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{passage.createdByName || 'Lecturer'}</strong>
                          <small>{passage.createdByEmail || 'Người biên soạn'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(passage.updatedAt || passage.updateAt)}</td>
                    <td>
                      {passage.isPreview
                        ? <span className="rp-status rp-status-preview">Xem thử</span>
                        : <span className="rp-status rp-status-private">Nội bộ</span>}
                    </td>
                    <td>
                      <div className="rp-actions">
                        <button type="button" onClick={() => handleView(passage)} title="Xem"><Eye size={17} /></button>
                        {canModify(passage) && (
                          <>
                            <button type="button" onClick={() => handleOpenEdit(passage)} title="Sửa"><Edit3 size={17} /></button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDelete(passage)}
                              disabled={deletingId === passage.passageId}
                              title="Xóa"
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageInfo.totalPages > 1 && (
          <div className="rp-pagination">
            <button type="button" disabled={!pageInfo.hasPrevious || loading} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft size={17} /> Trang trước
            </button>
            <span>{page + 1} / {pageInfo.totalPages}</span>
            <button type="button" disabled={!pageInfo.hasNext || loading} onClick={() => setPage((current) => current + 1)}>
              Trang sau <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <ReadingPassageFormModal
          passage={editingPassage}
          onClose={() => { setShowForm(false); setEditingPassage(null); }}
          onSaved={handleSaved}
        />
      )}

      {viewingPassage && (
        <ReadingPassageDetailModal passage={viewingPassage} onClose={() => setViewingPassage(null)} />
      )}
    </section>
  );
}
