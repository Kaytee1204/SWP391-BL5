import React from 'react';
import Navbar from '../../components/common/Navbar';
import IsometricStage from './components/IsometricStage';

export default function LandingPage({
  currentUser,
  onNavigate,
  onOpenAuth,
  onViewProfile,
  onLogout
}) {
  return (
    <div className="landing-bg">
      <div className="bg-canvas-glow"></div>

      <Navbar
        currentView="landing"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      <main className="hero-section">
        <div>
          <div className="announcement-badge" onClick={() => onNavigate('culture_reader')}>
            <span className="badge-sparkle">🌸</span>
            <span>New: Japanese Culture & Youth Slang Magazine is live</span>
            <span style={{ fontWeight: 800 }}>→</span>
          </div>
        </div>

        <h1 className="hero-heading">
          The Intelligent Platform Your{' '}
          <span className="hero-heading-gradient">Japanese Learning</span>{' '}
          Deserves
        </h1>

        <p className="hero-subheading">
          Master Kanji, JLPT grammar, cultural etiquette, and real-time AI conversation with a personalized learning path designed for your success on <strong>JLMS</strong>.
        </p>

        <div className="hero-cta-group">
          <button
            className="btn-primary-purple"
            style={{ fontSize: '1.05rem', padding: '0.9rem 2.2rem' }}
            onClick={() => {
              if (!currentUser) onOpenAuth('register');
              else onViewProfile();
            }}
          >
            <span>{currentUser ? '👤 View Profile & Target' : 'Start Learning Free'}</span>
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </button>
          <button
            className="btn-secondary-glass"
            style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}
            onClick={() => onNavigate('culture_reader')}
          >
            <span>Explore Culture Articles</span>
            <span>🏮</span>
          </button>
        </div>

        <div className="hero-trust-bar">
          <div className="trust-avatars">
            <img className="trust-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura" alt="u1" />
            <img className="trust-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji" alt="u2" />
            <img className="trust-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Taro" alt="u3" />
            <img className="trust-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki" alt="u4" />
          </div>
          <div>
            <span style={{ color: '#f59e0b', fontSize: '1.05rem' }}>★★★★★</span>{' '}
            <strong>4.9/5</strong> rating from <strong>45,000+</strong> JLPT candidates
          </div>
          <div style={{ color: 'var(--text-muted)' }}>•</div>
          <div>🎓 120+ Partner Universities</div>
        </div>

        <IsometricStage />
      </main>
    </div>
  );
}
