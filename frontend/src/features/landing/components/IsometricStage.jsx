import React from 'react';

export default function IsometricStage() {
  return (
    <div className="isometric-stage">
      <div className="isometric-plane">
        <div className="isometric-grid-floor"></div>

        {/* Card 1: AI Speaking */}
        <div className="iso-card iso-card-ai">
          <div className="card-badge">🤖 Sensei AI • Realtime Speaking</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7C3AED', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              JP
            </div>
            <div style={{ flex: 1, background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>こんにちは！</div>
              <div style={{ color: '#475569' }}>今日、JLPT N2の文法と会話練習を始めましょうか？</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
            <span>🎙️ Voice Pronunciation Accuracy</span>
            <span style={{ background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>98.5%</span>
          </div>
        </div>

        {/* Card 2: Kanji N2 */}
        <div className="iso-card iso-card-kanji">
          <div className="card-badge" style={{ background: '#fce7f3', color: '#be185d' }}>漢 Kanji N2</div>
          <div style={{ textAlign: 'center', margin: '0.4rem 0' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#be185d', lineHeight: 1, fontFamily: 'Noto Sans JP' }}>夢</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>Yume • Dream</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', background: '#fff1f2', padding: '4px 8px', borderRadius: '8px', textAlign: 'center' }}>
            音: ム | 訓: ゆめ
          </div>
        </div>

        {/* Card 3: Listening Chōkai */}
        <div className="iso-card iso-card-listening">
          <div className="card-badge" style={{ background: '#fff7ed', color: '#c2410c' }}>🎧 JLPT N1 Chōkai</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Listening Comprehension</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '0.4rem 0' }}>
            <div style={{ width: '4px', height: '14px', background: '#ea580c', borderRadius: '2px' }}></div>
            <div style={{ width: '4px', height: '22px', background: '#ea580c', borderRadius: '2px' }}></div>
            <div style={{ width: '4px', height: '16px', background: '#ea580c', borderRadius: '2px' }}></div>
            <div style={{ width: '4px', height: '20px', background: '#ea580c', borderRadius: '2px' }}></div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
            Speed: 1.0x • Audio Track #14
          </div>
        </div>

        {/* Card 4: Score Prediction */}
        <div className="iso-card iso-card-score">
          <div className="card-badge" style={{ background: '#ecfdf5', color: '#059669' }}>🎯 Predicted JLPT Score</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>168 / 180</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>JLPT N2 Pass Probability: 96%</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#059669', background: '#ecfdf5' }}>
              A+
            </div>
          </div>
        </div>

        {/* Card 5: Flashcard */}
        <div className="iso-card iso-card-flashcard">
          <div className="card-badge" style={{ background: '#fef3c7', color: '#b45309' }}>🌸 SRS Flashcard</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>桜 (さくら)</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>Cherry Blossom</div>
          <div style={{ marginTop: '0.5rem', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '92%', height: '100%', background: '#7C3AED' }}></div>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#7C3AED', fontWeight: 700, marginTop: '3px' }}>92% Mastered</div>
        </div>
      </div>
    </div>
  );
}
