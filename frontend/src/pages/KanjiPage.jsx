import React, { useEffect, useState } from 'react';
import { kanjiApi, deckApi } from '../api';
import { Modal } from '../components/Modal';
import { BookmarkPlus, Edit2, Folder, Plus, Search, Trash2 } from 'lucide-react';

const emptyKanji = {
  moduleId: '',
  character: '',
  onyomi: '',
  kunyomi: '',
  meaning: '',
  compoundWords: '',
};

export const KanjiPage = ({ currentUser }) => {
  const role = currentUser?.role;
  const isStudent = role === 'Student';
  const canManageContent = ['Manager', 'Lecturer', 'Author'].includes(role);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [modules, setModules] = useState([]);
  const [kanjiList, setKanjiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [isKanjiModalOpen, setIsKanjiModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState(null);
  const [kanjiForm, setKanjiForm] = useState(emptyKanji);

  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);
  const [selectedKanjiForDeck, setSelectedKanjiForDeck] = useState(null);
  const [myKanjiDecks, setMyKanjiDecks] = useState([]);
  const [targetDeckId, setTargetDeckId] = useState('');
  const [memorizationNote, setMemorizationNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedLevel !== 'ALL') params.jlptLevel = selectedLevel;
      if (selectedModuleId) params.moduleId = selectedModuleId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const [mods, kanji] = await Promise.all([
        kanjiApi.getModules(selectedLevel === 'ALL' ? null : selectedLevel),
        kanjiApi.getKanjiDetails(params),
      ]);
      setModules(Array.isArray(mods) ? mods : []);
      setKanjiList(Array.isArray(kanji) ? kanji : []);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to load Kanji data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLevel, selectedModuleId]);

  const openKanjiModal = (kanji = null) => {
    setEditingKanji(kanji);
    if (kanji) {
      setKanjiForm({
        moduleId: String(kanji.moduleId || ''),
        character: kanji.character,
        onyomi: kanji.onyomi || '',
        kunyomi: kanji.kunyomi || '',
        meaning: kanji.meaning,
        compoundWords: kanji.compoundWords || '',
      });
    } else {
      setKanjiForm({
        ...emptyKanji,
        moduleId: selectedModuleId || (modules[0]?.moduleId ? String(modules[0].moduleId) : ''),
      });
    }
    setIsKanjiModalOpen(true);
  };

  const saveKanji = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        moduleId: Number(kanjiForm.moduleId),
        character: kanjiForm.character.trim(),
        onyomi: kanjiForm.onyomi.trim() || null,
        kunyomi: kanjiForm.kunyomi.trim() || null,
        meaning: kanjiForm.meaning.trim(),
        compoundWords: kanjiForm.compoundWords.trim() || null,
      };

      if (editingKanji) {
        await kanjiApi.updateKanji(editingKanji.kanjiId, payload);
        setFeedback({ type: 'success', msg: 'Kanji updated successfully!' });
      } else {
        await kanjiApi.createKanji(payload);
        setFeedback({ type: 'success', msg: 'New Kanji created successfully!' });
      }
      setIsKanjiModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Operation failed: ' + err.message });
    }
  };

  const deleteKanji = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Kanji?')) return;
    try {
      await kanjiApi.deleteKanji(id);
      setFeedback({ type: 'success', msg: 'Kanji deleted successfully!' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Delete failed: ' + err.message });
    }
  };

  const openAddToDeck = async (kanji) => {
    try {
      setSelectedKanjiForDeck(kanji);
      setMemorizationNote('');
      const decks = await deckApi.getMyKanjiDecks();
      setMyKanjiDecks(decks);
      setTargetDeckId(decks[0]?.deckId ? String(decks[0].deckId) : '');
      setIsAddToDeckModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Cannot load Kanji decks: ' + err.message });
    }
  };

  const saveToDeck = async () => {
    if (!targetDeckId) return;
    try {
      await deckApi.addKanjiToDeck(targetDeckId, {
        kanjiId: selectedKanjiForDeck.kanjiId,
        memorizationNote: memorizationNote.trim() || null,
      });
      setFeedback({ type: 'success', msg: `Added [${selectedKanjiForDeck.character}] to your deck!` });
      setIsAddToDeckModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to add Kanji to deck: ' + err.message });
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Kanji Dictionary (漢字)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Look up Japanese Kanji characters by lesson modules and JLPT levels
          </p>
        </div>
        <div className="filter-group">
          <div className="level-tabs">
            {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <button key={level} className={`level-tab-btn ${selectedLevel === level ? 'active' : ''}`} onClick={() => { setSelectedLevel(level); setSelectedModuleId(''); }}>
                {level}
              </button>
            ))}
          </div>
          {canManageContent && <button className="btn btn-primary" onClick={() => openKanjiModal()}><Plus size={16} /> Add Kanji</button>}
        </div>
      </div>

      {feedback.msg && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', backgroundColor: feedback.type === 'error' ? '#fee2e2' : '#d1fae5', color: feedback.type === 'error' ? '#dc2626' : '#065f46' }}>{feedback.msg}</div>}

      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <Folder size={18} style={{ color: 'var(--text-muted)' }} />
            <select className="form-select" value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
              <option value="">-- All Modules ({modules.length}) --</option>
              {modules.map((module) => <option key={module.moduleId} value={module.moduleId}>[{module.jlptLevel}] {module.title} ({module.kanjiCount} kanji)</option>)}
            </select>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <input className="form-input" placeholder="Search by Kanji character, meaning, Onyomi, Kunyomi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="btn btn-secondary"><Search size={16} /></button>
          </form>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading Kanji characters...</div> : kanjiList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Kanji characters found matching your filter.</p>
          {canManageContent && <button className="btn btn-primary" onClick={() => openKanjiModal()} style={{ marginTop: '12px' }}><Plus size={16} /> Add First Kanji</button>}
        </div>
      ) : (
        <div className="grid-kanji">
          {kanjiList.map((kanji) => (
            <div key={kanji.kanjiId} className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`badge-jlpt badge-${(kanji.jlptLevel || 'N5').toLowerCase()}`}>{kanji.jlptLevel || 'N5'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kanji.moduleTitle}</span>
              </div>
              <div style={{ margin: '8px 0' }}><span className="jp-font" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>{kanji.character}</span></div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>{kanji.meaning}</div>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', textAlign: 'left', marginBottom: '12px' }}>
                <div><strong>On:</strong> {kanji.onyomi || '-'}</div>
                <div style={{ marginTop: '2px' }}><strong>Kun:</strong> {kanji.kunyomi || '-'}</div>
              </div>
              {kanji.compoundWords && <div className="jp-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '12px', flex: 1 }}><strong>Compounds:</strong> {kanji.compoundWords}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: 'auto' }}>
                {isStudent && <button className="btn btn-secondary btn-sm" title="Save to Kanji Deck" onClick={() => openAddToDeck(kanji)}><BookmarkPlus size={14} /> Save to Deck</button>}
                {canManageContent && <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-secondary btn-sm" title="Edit Kanji" onClick={() => openKanjiModal(kanji)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" title="Delete Kanji" onClick={() => deleteKanji(kanji.kanjiId)}><Trash2 size={14} /></button>
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isKanjiModalOpen} onClose={() => setIsKanjiModalOpen(false)} title={editingKanji ? 'Edit Kanji' : 'Add New Kanji'}>
        <form onSubmit={saveKanji}>
          <div className="form-group"><label className="form-label">Lesson Module</label><select className="form-select" required value={kanjiForm.moduleId} onChange={(e) => setKanjiForm({ ...kanjiForm, moduleId: e.target.value })}><option value="">-- Select Module --</option>{modules.map((m) => <option key={m.moduleId} value={m.moduleId}>[{m.jlptLevel}] {m.title}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}><div className="form-group"><label className="form-label">Kanji Character</label><input className="form-input" required maxLength={10} placeholder="E.g., 日" value={kanjiForm.character} onChange={(e) => setKanjiForm({ ...kanjiForm, character: e.target.value })} /></div><div className="form-group"><label className="form-label">Meaning</label><input className="form-input" required maxLength={300} placeholder="E.g., Sun, Day" value={kanjiForm.meaning} onChange={(e) => setKanjiForm({ ...kanjiForm, meaning: e.target.value })} /></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div className="form-group"><label className="form-label">Onyomi (Katakana)</label><input className="form-input" maxLength={200} placeholder="E.g., ニチ, ジツ" value={kanjiForm.onyomi} onChange={(e) => setKanjiForm({ ...kanjiForm, onyomi: e.target.value })} /></div><div className="form-group"><label className="form-label">Kunyomi (Hiragana)</label><input className="form-input" maxLength={200} placeholder="E.g., ひ, -び, -か" value={kanjiForm.kunyomi} onChange={(e) => setKanjiForm({ ...kanjiForm, kunyomi: e.target.value })} /></div></div>
          <div className="form-group"><label className="form-label">Common Compounds</label><textarea className="form-textarea" placeholder="E.g., 日本 (Nihon - Japan), 日曜日 (Nichiyoubi - Sunday)" value={kanjiForm.compoundWords} onChange={(e) => setKanjiForm({ ...kanjiForm, compoundWords: e.target.value })} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><button type="button" className="btn btn-secondary" onClick={() => setIsKanjiModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingKanji ? 'Save Changes' : 'Add Kanji'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isAddToDeckModalOpen} onClose={() => setIsAddToDeckModalOpen(false)} title={`Save [${selectedKanjiForDeck?.character}] to Deck`}>
        {myKanjiDecks.length === 0 ? <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No Kanji decks found. Please go to <strong>My Kanji Decks</strong> to create a deck first!</p> : <>
          <div className="form-group"><label className="form-label">Select Target Deck</label><select className="form-select" value={targetDeckId} onChange={(e) => setTargetDeckId(e.target.value)}>{myKanjiDecks.map((deck) => <option key={deck.deckId} value={deck.deckId}>{deck.title} ({deck.totalItems} kanji)</option>)}</select></div>
          <div className="form-group"><label className="form-label">Memorization Note</label><textarea className="form-textarea" maxLength={500} placeholder="E.g., Resembles a sun with a window..." value={memorizationNote} onChange={(e) => setMemorizationNote(e.target.value)} /></div>
        </>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}><button className="btn btn-secondary" onClick={() => setIsAddToDeckModalOpen(false)}>Cancel</button>{myKanjiDecks.length > 0 && <button className="btn btn-primary" onClick={saveToDeck}><BookmarkPlus size={16} /> Save to Deck</button>}</div>
      </Modal>
    </div>
  );
};
