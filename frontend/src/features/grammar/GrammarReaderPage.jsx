import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { JLPT_LEVELS } from '../../assets/constants';

export default function GrammarReaderPage({ currentUser, onOpenAuth }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  
  // Khách chưa đăng nhập (Guest) mặc định bắt buộc là N5
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [expandedId, setExpandedId] = useState(null);

  const isGuest = !currentUser;

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      
      // Nếu là Guest thì chỉ được lấy N5, nếu đã đăng nhập thì lấy theo level được chọn
      const levelToFetch = isGuest ? 'N5' : selectedLevel;
      if (levelToFetch) params.append('jlptLevel', levelToFetch);
      
      // Guest chỉ lấy tối đa 3 bài đầu tiên N5, user đăng nhập lấy 50 bài
      params.append('size', isGuest ? '3' : '50');

      const res = await apiRequest(`/grammar-patterns?${params.toString()}`, 'GET');
      let dataList = res.data?.content || [];
      
      // Đảm bảo ở phía Client: Khách chỉ xem tối đa 3 ngữ pháp đầu tiên
      if (isGuest) {
        dataList = dataList.slice(0, 3);
      }
      
      setPatterns(dataList);
    } catch (err) {
      setError(err.message || 'Failed to load grammar lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [selectedLevel, isGuest]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatterns();
  };

  const handleLevelClick = (lvlValue) => {
    if (isGuest && lvlValue !== 'N5') {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        alert('🔒 Please log in to unlock JLPT ' + (lvlValue || 'All') + ' grammar lessons!');
      }
      return;
    }
    setSelectedLevel(lvlValue);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#fff',
        padding: '2.25rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.12)',
          padding: '0.3rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '1px',
          marginBottom: '0.65rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          文法 MASTER • JLPT GRAMMAR LIBRARY
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 0.5rem' }}>
          Explore Japanese Grammar Patterns
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto', opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.6 }}>
          Master key sentence structures, nuances, and practical formations with clear formulas and step-by-step usage explanations.
        </p>

        {/* Level Selector Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleLevelClick('')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: (!isGuest && selectedLevel === '') ? '#fff' : 'rgba(255,255,255,0.15)',
              color: (!isGuest && selectedLevel === '') ? '#1e1b4b' : '#fff'
            }}
          >
            {isGuest ? '🔒 All Levels' : 'All JLPT Levels'}
          </button>
          {JLPT_LEVELS.map(lvl => {
            const isLocked = isGuest && lvl.value !== 'N5';
            const isActive = isGuest ? (lvl.value === 'N5') : (selectedLevel === lvl.value);

            return (
              <button
                key={lvl.value}
                onClick={() => handleLevelClick(lvl.value)}
                style={{
                  padding: '0.5rem 1.15rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.15)',
                  color: isActive ? '#1e1b4b' : '#fff'
                }}
              >
                {isLocked ? `🔒 ${lvl.value}` : lvl.label}
              </button>
            );
          })}
        </div>

        {/* Guest Preview Notice Banner */}
        {isGuest && (
          <div style={{
            marginTop: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(254, 243, 199, 0.15)',
            border: '1px solid rgba(253, 230, 138, 0.4)',
            padding: '0.45rem 1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            color: '#fef08a'
          }}>
            <span>👁️</span>
            <span>Guest Preview: Viewing 3 introductory N5 grammar patterns.</span>
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              style={{
                background: '#fff',
                color: '#1e1b4b',
                border: 'none',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginLeft: '0.35rem'
              }}
            >
              Log In to Unlock All
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            placeholder={isGuest ? "Search N5 preview grammar points..." : "Search grammar point (e.g. 〜てもいい, permission, must, と思う)..."}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="form-input"
            style={{ flex: 1, fontSize: '0.92rem' }}
          />
          <button type="submit" className="btn-dash btn-dash-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}>
            🔍 Search
          </button>
        </form>
      </div>

      {/* Pattern Cards (Stable non-jumping rendering) */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Japanese grammar patterns...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
          ⚠️ {error}
        </div>
      ) : patterns.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.5rem' }}>
            No grammar patterns found
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            {isGuest ? 'No N5 grammar patterns currently available.' : 'Try searching for different keywords or select another JLPT level.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {patterns.map((p) => {
            const isExpanded = expandedId === p.patternId;

            return (
              <div
                key={p.patternId}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  border: '1px solid',
                  borderColor: isExpanded ? '#c4b5fd' : '#e2e8f0',
                  borderRadius: '14px',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      background: p.jlptLevel === 'N5' ? '#dcfce7' : p.jlptLevel === 'N4' ? '#e0e7ff' : p.jlptLevel === 'N3' ? '#fef3c7' : p.jlptLevel === 'N2' ? '#ffedd5' : '#fee2e2',
                      color: p.jlptLevel === 'N5' ? '#15803d' : p.jlptLevel === 'N4' ? '#4338ca' : p.jlptLevel === 'N3' ? '#b45309' : p.jlptLevel === 'N2' ? '#c2410c' : '#b91c1c'
                    }}>
                      {p.jlptLevel}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                      {p.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(p.patternId)}
                    style={{
                      background: isExpanded ? '#f5f3ff' : '#f8fafc',
                      color: isExpanded ? '#7C3AED' : '#64748b',
                      border: '1px solid #e2e8f0',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isExpanded ? '▲ Hide' : '▼ Details'}
                  </button>
                </div>

                {/* Structure formula */}
                <div style={{
                  marginTop: '0.75rem',
                  background: '#f8fafc',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Formula:
                  </span>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6d28d9', fontFamily: 'monospace' }}>
                    {p.structure}
                  </code>
                </div>

                {/* Details Section (No jumping effect) */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.85rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.9rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-line'
                  }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.35rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      💡 Usage Notes & Examples:
                    </div>
                    {p.usageNote || 'No detailed explanation provided for this pattern yet.'}

                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span>Author: <strong>{p.createdByName}</strong></span>
                      <span>Updated: {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Guest Unlock Card */}
          {isGuest && (
            <div style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '1.5px dashed #a78bfa',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🔓</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.4rem' }}>
                Want to learn all JLPT N5, N4, N3, N2, N1 Grammar?
              </h3>
              <p style={{ maxWidth: '520px', margin: '0 auto 1.25rem', fontSize: '0.88rem', color: '#6d28d9', lineHeight: 1.5 }}>
                Create a free JLMS account to unlock unlimited access to complete grammar patterns, formulas, audio, and exercises.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="btn-dash"
                  style={{ background: '#fff', color: '#5b21b6', fontWeight: 800, padding: '0.6rem 1.25rem', border: '1px solid #c4b5fd' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                  className="btn-dash btn-dash-primary"
                  style={{ padding: '0.6rem 1.5rem', fontWeight: 800 }}
                >
                  Sign Up Free →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
