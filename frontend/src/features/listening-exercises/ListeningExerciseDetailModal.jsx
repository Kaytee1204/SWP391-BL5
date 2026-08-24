import React, { useState } from 'react';
import { FileText, Languages, X } from 'lucide-react';
import { resolveListeningAudioUrl } from '../../api/listeningExerciseApi';
import './listeningExercise.css';

export default function ListeningExerciseDetailModal({ exercise, onClose }) {
  const [showScript, setShowScript] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  if (!exercise) return null;

  return (
    <div className="le-modal-backdrop" onMouseDown={onClose}>
      <article className="le-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="le-detail-header">
          <div><span className={`le-level is-${exercise.jlptLevel?.toLowerCase()}`}>{exercise.jlptLevel}</span><h2>{exercise.title}</h2><p>{exercise.createdByName || 'Lecturer'} · {exercise.audioOriginalName}</p></div>
          <button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </header>
        <div className="le-detail-body">
          <audio className="le-detail-audio" controls preload="metadata" src={resolveListeningAudioUrl(exercise.audioUrl)} />

          <section className="le-detail-section">
            <button type="button" onClick={() => setShowScript((value) => !value)}><FileText size={17} />{showScript ? 'Ẩn script' : 'Hiện script'}</button>
            {showScript && <div className="le-script-text jp-font">{exercise.scriptText}</div>}
          </section>

          {exercise.translation && <section className="le-detail-section translation">
            <button type="button" onClick={() => setShowTranslation((value) => !value)}><Languages size={17} />{showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}</button>
            {showTranslation && <div className="le-translation-text">{exercise.translation}</div>}
          </section>}
        </div>
      </article>
    </div>
  );
}
