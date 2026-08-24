import React, { useState } from 'react';
import { BookOpen, Languages, X } from 'lucide-react';
import './readingPassage.css';

export default function ReadingPassageDetailModal({ passage, onClose }) {
  const [showTranslation, setShowTranslation] = useState(true);

  if (!passage) return null;

  return (
    <div className="rp-modal-backdrop" onMouseDown={onClose}>
      <article className="rp-reader-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="rp-reader-header">
          <div className="rp-reader-icon"><BookOpen size={24} /></div>
          <div>
            <div className="rp-reader-meta">
              <span className={`rp-level rp-level-${passage.jlptLevel?.toLowerCase()}`}>{passage.jlptLevel}</span>
              {passage.isPreview && <span className="rp-preview-badge">PREVIEW</span>}
            </div>
            <h2>{passage.title}</h2>
            <p>Biên soạn bởi {passage.createdByName || 'Lecturer'}</p>
          </div>
          <button type="button" className="rp-icon-button" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <div className="rp-reader-body">
          <section className="rp-japanese-content" dangerouslySetInnerHTML={{ __html: passage.contentHtml || '' }} />

          {passage.translation && (
            <section className="rp-translation-panel">
              <button type="button" onClick={() => setShowTranslation((value) => !value)}>
                <Languages size={17} />
                {showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
              </button>
              {showTranslation && <p>{passage.translation}</p>}
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
