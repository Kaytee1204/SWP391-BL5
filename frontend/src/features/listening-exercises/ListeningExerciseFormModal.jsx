import React, { useEffect, useMemo, useState } from 'react';
import { FileAudio, Upload, X } from 'lucide-react';
import { JLPT_LEVELS } from '../../assets/constants';
import { listeningExerciseApi, resolveListeningAudioUrl } from '../../api/listeningExerciseApi';
import './listeningExercise.css';

const EMPTY_FORM = { jlptLevel: 'N5', title: '', scriptText: '', translation: '' };

export default function ListeningExerciseFormModal({ exercise, onClose, onSaved }) {
  const editing = Boolean(exercise?.listeningExerciseId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [audioFile, setAudioFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(exercise ? {
      jlptLevel: exercise.jlptLevel || 'N5',
      title: exercise.title || '',
      scriptText: exercise.scriptText || '',
      translation: exercise.translation || ''
    } : EMPTY_FORM);
  }, [exercise]);

  const localAudioUrl = useMemo(
    () => (audioFile ? URL.createObjectURL(audioFile) : ''),
    [audioFile]
  );

  useEffect(() => () => {
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
  }, [localAudioUrl]);

  const audioPreviewUrl = localAudioUrl || resolveListeningAudioUrl(exercise?.audioUrl);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const selectAudio = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 25 * 1024 * 1024) {
      setError('File audio không được vượt quá 25MB.');
      event.target.value = '';
      return;
    }
    setAudioFile(file);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.title.trim() || !form.scriptText.trim()) {
      setError('Tiêu đề và script không được để trống.');
      return;
    }
    if (!editing && !audioFile) {
      setError('Vui lòng chọn file audio cho bài nghe.');
      return;
    }

    const payload = {
      jlptLevel: form.jlptLevel,
      title: form.title.trim(),
      scriptText: form.scriptText.trim(),
      translation: form.translation.trim()
    };

    setSaving(true);
    try {
      const response = editing
        ? await listeningExerciseApi.update(exercise.listeningExerciseId, payload, audioFile)
        : await listeningExerciseApi.create(payload, audioFile);
      onSaved(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu bài nghe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="le-modal-backdrop" onMouseDown={onClose}>
      <section className="le-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="le-modal-header">
          <div><span>LISTENING EXERCISE</span><h3>{editing ? 'Cập nhật bài nghe' : 'Tạo bài nghe mới'}</h3></div>
          <button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="le-modal-body">
            {error && <div className="le-alert le-alert-error">⚠ {error}</div>}

            <div className="le-form-grid">
              <label className="le-field">
                <span>JLPT level *</span>
                <select name="jlptLevel" value={form.jlptLevel} onChange={updateField}>
                  {JLPT_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                </select>
              </label>
              <label className="le-field">
                <span>Tiêu đề *</span>
                <input name="title" value={form.title} onChange={updateField} maxLength={200} placeholder="Ví dụ: 駅での会話" />
              </label>
            </div>

            <div className="le-audio-upload">
              <div className="le-upload-heading"><FileAudio size={20} /><div><strong>Audio file {editing ? '(không bắt buộc thay)' : '*'}</strong><small>MP3, WAV, M4A, OGG hoặc AAC — tối đa 25MB</small></div></div>
              <label className="le-file-picker">
                <Upload size={17} />
                <span>{audioFile?.name || (editing ? 'Chọn audio mới' : 'Chọn file audio')}</span>
                <input type="file" accept="audio/*,.m4a,.aac" onChange={selectAudio} />
              </label>
              {audioPreviewUrl && <audio className="le-audio-player" controls preload="metadata" src={audioPreviewUrl} />}
              {editing && !audioFile && <small className="le-current-file">Đang dùng: {exercise.audioOriginalName}</small>}
            </div>

            <label className="le-field">
              <span>Listening script *</span>
              <textarea name="scriptText" value={form.scriptText} onChange={updateField} rows={8} placeholder="Nhập nội dung tiếng Nhật trong audio..." />
              <small>Script sẽ được hiển thị nguyên dòng và xuống dòng như nội dung đã nhập.</small>
            </label>

            <label className="le-field">
              <span>Bản dịch</span>
              <textarea name="translation" value={form.translation} onChange={updateField} rows={5} placeholder="Nhập bản dịch tiếng Việt (không bắt buộc)..." />
            </label>
          </div>

          <footer className="le-modal-footer">
            <button type="button" className="le-button secondary" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="le-button primary" disabled={saving}>
              {saving ? 'Đang tải lên...' : editing ? 'Lưu thay đổi' : 'Tạo bài nghe'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
