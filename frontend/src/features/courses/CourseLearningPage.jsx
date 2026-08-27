import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';

export default function CourseLearningPage({
  course,
  currentUser,
  onNavigate,
  onViewProfile,
  onLogout
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);

  // Duolingo-style Pathway Nodes (S-Curve)
  const pathNodes = [
    {
      id: 1,
      type: 'lesson',
      step: 'Bài 1',
      title: 'Bảng Chữ Cái & Chào Hỏi (Aisatsu)',
      status: 'completed', // 'completed' | 'active' | 'locked'
      stars: 3,
      offsetX: 0, // Center
      level: 'N5 Cơ bản',
      exp: 15,
      description: 'Làm quen bảng chữ cái Hiragana, Katakana, quy tắc biến âm và 10 câu chào hỏi chuẩn Tokyo.',
      sampleVocab: [
        { jp: 'おはようございます', vi: 'Chào buổi sáng (Lịch sự)' },
        { jp: 'こんにちは', vi: 'Xin chào / Chào buổi trưa' },
        { jp: 'ありがとう', vi: 'Cảm ơn' }
      ],
      quiz: {
        question: 'Chào buổi sáng với thầy cô hoặc người lớn dùng câu nào?',
        options: ['おはよう', 'おはようございます', 'こんばんは', 'さようなら'],
        correctIndex: 1,
        explain: 'Chào người lớn hoặc thầy cô buổi sáng cần dùng thể lịch sự "おはようございます (Ohayou gozaimasu)".'
      }
    },
    {
      id: 2,
      type: 'lesson',
      step: 'Bài 2',
      title: 'Ngữ Pháp Danh Từ & Trợ Từ (〜は〜です)',
      status: 'completed',
      stars: 3,
      offsetX: -55, // Left
      level: 'N5 Nền tảng',
      exp: 20,
      description: 'Cấu trúc câu khẳng định, phủ định và nghi vấn với trợ từ は (wa), の (no), も (mo).',
      sampleVocab: [
        { jp: 'わたしは がくせいです。', vi: 'Tôi là học sinh.' },
        { jp: 'これは なんですか。', vi: 'Đây là cái gì thế?' }
      ],
      quiz: {
        question: 'Điền trợ từ đúng: わたし (___) ベトナムじんです。',
        options: ['を', 'は (wa)', 'に', 'で'],
        correctIndex: 1,
        explain: 'Trợ từ "は" (đọc là wa) dùng để chỉ chủ ngữ/chủ đề trong câu.'
      }
    },
    {
      id: 3,
      type: 'lesson',
      step: 'Bài 3',
      title: 'Luyện Nghe: Mua Sắm Konbini & Đi Tàu Điện',
      status: 'active', // Active Current Node with Sakura tree next to it!
      stars: 1,
      offsetX: -90, // Far Left
      level: 'N5 Giao tiếp',
      exp: 25,
      description: 'Luyện phản xạ nghe hiểu hội thoại thực tế tại siêu thị tiện lợi Nhật Bản (7-Eleven, Lawson) và hỏi đường đi tàu.',
      sampleVocab: [
        { jp: 'いくらですか。', vi: 'Bao nhiêu tiền thế ạ?' },
        { jp: 'ふくろは いりますか。', vi: 'Quý khách có cần túi nilon không?' }
      ],
      quiz: {
        question: 'Khi nhân viên hỏi "ふくろは いりますか。", nếu không cần túi bạn trả lời:',
        options: ['はい、ください', 'だいじょうぶです (Khỏi cần ạ)', 'ありがとう', 'すみません'],
        correctIndex: 1,
        explain: '"だいじょうぶです (Daijoubu desu)" mang nghĩa lịch sự "Tôi ổn rồi, không cần túi đâu ạ".'
      }
    },
    {
      id: 4,
      type: 'chest',
      step: 'Rương Quà',
      title: 'Rương Kho Báu: Bộ 50 Flashcard Kanji N5',
      status: 'active',
      offsetX: -60, // Mid Left
      reward: '🌸 +50 EXP & Bộ Flashcard Kanji N5 Độc Quyền'
    },
    {
      id: 5,
      type: 'lesson',
      step: 'Bài 4',
      title: 'Chữ Hán Kanji Cơ Bản: 30 Chữ Sinh Hoạt',
      status: 'locked',
      stars: 0,
      offsetX: 10, // Slightly Right
      level: 'N5 Kanji',
      exp: 30,
      description: '30 chữ Hán Kanji tượng hình thông dụng (Nhật, Nguyệt, Hỏa, Thủy, Mộc, Kim, Thổ...) qua tranh vẽ.'
    },
    {
      id: 6,
      type: 'lesson',
      step: 'Bài 5',
      title: 'Bài Test Tổng Kết & Đánh Giá JLPT N5',
      status: 'locked',
      stars: 0,
      offsetX: 65, // Far Right
      level: 'N5 Tổng kết',
      exp: 50,
      description: 'Bài thi thử 25 câu trắc nghiệm tổng hợp toàn bộ từ vựng, ngữ pháp và nghe hiểu chặng 1.'
    }
  ];

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setQuizAnswer(null);
    setShowQuizResult(false);
  };

  const handleOpenChest = () => {
    setChestOpened(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff5f7 0%, #fdf2f5 35%, #fff0f4 70%, #fef2f6 100%)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Top Standard Navbar */}
      <Navbar
        currentView="courses"
        currentUser={currentUser}
        onNavigate={onNavigate}
        onOpenAuth={() => {}}
        onViewProfile={onViewProfile}
        onLogout={onLogout}
      />

      {/* ==================================================================== */}
      {/* DUOLINGO-STYLE HEADER STATUS BAR                                     */}
      {/* ==================================================================== */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid #fce7f3',
        padding: '0.85rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 2px 10px rgba(244, 114, 182, 0.05)'
      }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            onClick={() => onNavigate('courses')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>←</span>
            <span>Khóa học</span>
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {course?.title || 'Khóa Học Tiếng Nhật Toàn Diện'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
              ⛩️ CỔNG TRỜI TRI THỨC • CHẶNG 1 (N5)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>
              <span>🔥</span>
              <span>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, fontSize: '0.9rem', color: '#ec4899' }}>
              <span>🌸</span>
              <span>180</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN WINDING PATH CONTAINER (S-CURVE DUOLINGO PATHWAY)              */}
      {/* ==================================================================== */}
      <main style={{ maxWidth: '640px', margin: '2rem auto 6rem', padding: '0 1rem' }}>
        
        {/* Welcome Toast Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          border: '2px solid #fecdd3',
          boxShadow: '0 4px 16px rgba(225, 29, 72, 0.08)',
          marginBottom: '2.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#be123c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
            🌸 CẢM ƠN BẠN {currentUser?.fullName?.toUpperCase() || 'HỌC VIÊN'} ĐÃ THAM GIA!
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#881337', fontWeight: 600 }}>
            Hãy cùng Cây Hoa Anh Đào bước qua các Cổng Trời Torii để chinh phục từng bài học nhé!
          </p>
        </div>

        {/* The Vertical Path */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.25rem',
          padding: '1rem 0 3rem'
        }}>

          {pathNodes.map((node) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';

            return (
              <div
                key={node.id}
                style={{
                  position: 'relative',
                  transform: `translateX(${node.offsetX}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* -------------------------------------------------------- */}
                {/* 🌸 SAKURA CHERRY BLOSSOM TREE MASCOT (BESIDE ACTIVE NODE) */}
                {/* -------------------------------------------------------- */}
                {node.id === 3 && (
                  <div style={{
                    position: 'absolute',
                    left: '105px', // Next to node 3 on the right
                    top: '-30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10,
                    animation: 'floatSakura 3s ease-in-out infinite'
                  }}>
                    {/* Cute Sakura Tree Mascot */}
                    <div style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fdf2f8 0%, #fce7f3 70%, #fbcfe8 100%)',
                      boxShadow: '0 8px 20px rgba(236, 72, 153, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid #fff',
                      position: 'relative'
                    }}>
                      {/* Sakura Tree SVG */}
                      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Tree Trunk */}
                        <path d="M46 55 L42 90 L58 90 L54 55 Z" fill="#78350f" rx="3" />
                        <path d="M42 90 L34 94 L42 90 Z" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                        <path d="M58 90 L66 94 L58 90 Z" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                        {/* Branch */}
                        <path d="M47 62 C38 56 34 50 32 46" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                        <path d="M53 60 C62 54 66 48 68 44" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Pink Blossom Foliage Clouds */}
                        <circle cx="50" cy="38" r="26" fill="#f472b6" opacity="0.9" />
                        <circle cx="36" cy="40" r="18" fill="#ec4899" />
                        <circle cx="64" cy="40" r="18" fill="#f43f5e" />
                        <circle cx="50" cy="24" r="20" fill="#fb7185" />
                        <circle cx="42" cy="28" r="15" fill="#fda4af" />
                        <circle cx="58" cy="28" r="15" fill="#fecdd3" />
                        
                        {/* Little Cute Blossoms on Tree */}
                        <circle cx="36" cy="34" r="4" fill="#fff" />
                        <circle cx="62" cy="32" r="4" fill="#fff" />
                        <circle cx="48" cy="44" r="3.5" fill="#fff" />
                        <circle cx="52" cy="18" r="3" fill="#fff" />
                      </svg>

                      {/* Small Floating Petals */}
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '1.1rem' }}>🌸</span>
                    </div>

                    {/* 3 Stars Progress below Sakura Tree */}
                    <div style={{
                      display: 'flex',
                      gap: '0.2rem',
                      marginTop: '0.4rem',
                      background: 'rgba(255,255,255,0.95)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid #f1f5f9'
                    }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>★</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>★</span>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* NODE BUTTON: TORII GATE OR CHEST                         */}
                {/* -------------------------------------------------------- */}
                {node.type === 'chest' ? (
                  // GOLDEN JAPANESE TREASURE CHEST
                  <button
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '22px',
                      background: chestOpened ? '#fef3c7' : 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                      border: 'none',
                      boxShadow: chestOpened
                        ? '0 4px 0 #d97706, 0 8px 16px rgba(217, 119, 6, 0.2)'
                        : '0 6px 0 #b45309, 0 12px 24px rgba(217, 119, 6, 0.35)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem',
                      transition: 'transform 0.1s ease',
                      position: 'relative'
                    }}
                  >
                    {chestOpened ? '🎁' : '🧰'}
                    {!chestOpened && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '999px',
                        border: '2px solid #fff'
                      }}>
                        NHẬN
                      </span>
                    )}
                  </button>
                ) : (
                  // ⛩️ TORII GATE 3D ROUND BUTTON
                  <button
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      border: 'none',
                      background: isCompleted
                        ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)' // Gold for completed
                        : isActive
                        ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%)' // Bright Red for active
                        : 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)', // Gray for locked
                      boxShadow: isCompleted
                        ? '0 6px 0 #b45309, 0 10px 20px rgba(245, 158, 11, 0.35)'
                        : isActive
                        ? '0 6px 0 #991b1b, 0 10px 24px rgba(220, 38, 38, 0.4)'
                        : '0 6px 0 #94a3b8',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'transform 0.1s ease',
                      outline: isActive ? '4px solid rgba(220, 38, 38, 0.25)' : 'none',
                      outlineOffset: '4px'
                    }}
                  >
                    {/* Torii Gate Icon on Top */}
                    <span style={{
                      fontSize: '1.9rem',
                      lineHeight: 1,
                      filter: isLocked ? 'grayscale(1) opacity(0.6)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>
                      ⛩️
                    </span>

                    {/* Badge on Node */}
                    {isCompleted && (
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-2px',
                        background: '#10b981',
                        color: '#fff',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        border: '2px solid #fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}>
                        ✓
                      </span>
                    )}

                    {isLocked && (
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-2px',
                        background: '#64748b',
                        color: '#fff',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        border: '2px solid #fff'
                      }}>
                        🔒
                      </span>
                    )}
                  </button>
                )}

                {/* Node Label Below */}
                <div style={{
                  position: 'absolute',
                  top: '84px',
                  whiteSpace: 'nowrap',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: isCompleted ? '#b45309' : isActive ? '#b91c1c' : '#94a3b8',
                  background: '#fff',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f1f5f9'
                }}>
                  {node.step}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ==================================================================== */}
      {/* DUOLINGO-STYLE LESSON POPUP MODAL (WHEN NODE IS CLICKED)            */}
      {/* ==================================================================== */}
      {selectedNode && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNode(null)}
          style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              padding: '1.75rem',
              borderRadius: '24px',
              textAlign: 'center',
              border: '2px solid #f1f5f9',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            {/* Modal Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: selectedNode.status === 'completed' ? '#ecfdf5' : '#fef2f2',
                color: selectedNode.status === 'completed' ? '#059669' : '#dc2626',
                fontWeight: 900,
                fontSize: '0.8rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid currentColor'
              }}>
                ⛩️ {selectedNode.step} {selectedNode.level ? `• ${selectedNode.level}` : ''}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {selectedNode.type === 'chest' ? (
              // CHEST MODAL
              <div>
                <div style={{ fontSize: '4.5rem', margin: '0.5rem 0' }}>
                  {chestOpened ? '🎉 🎁' : '🧰'}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b45309', margin: '0 0 0.5rem' }}>
                  {selectedNode.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  {selectedNode.reward}
                </p>

                {chestOpened ? (
                  <div style={{
                    background: '#ecfdf5',
                    padding: '1rem',
                    borderRadius: '16px',
                    color: '#065f46',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    border: '1px solid #a7f3d0'
                  }}>
                    ✨ Bạn đã mở rương nhận thành công 50 Flashcard Kanji N5!
                  </div>
                ) : (
                  <button
                    className="btn-primary-purple"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                      boxShadow: '0 4px 0 #b45309',
                      border: 'none',
                      borderRadius: '16px'
                    }}
                    onClick={handleOpenChest}
                  >
                    🎁 MỞ RƯƠNG NGAY
                  </button>
                )}
              </div>
            ) : (
              // LESSON POPUP MODAL
              <div>
                <div style={{ fontSize: '3rem', margin: '0.25rem 0' }}>
                  {selectedNode.status === 'completed' ? '⛩️ 🌸' : selectedNode.status === 'active' ? '⛩️' : '🔒'}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-heading)', margin: '0 0 0.5rem' }}>
                  {selectedNode.title}
                </h3>
                <p style={{ color: 'var(--text-body)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {selectedNode.description}
                </p>

                {/* Sample Vocab Preview */}
                {selectedNode.sampleVocab && (
                  <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '14px', marginBottom: '1.25rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.4rem' }}>
                      📚 Mẫu từ vựng trọng tâm:
                    </div>
                    {selectedNode.sampleVocab.map((v, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                        <strong style={{ color: '#b91c1c' }}>{v.jp}</strong>
                        <span style={{ color: '#475569' }}>{v.vi}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mini Quiz in Modal */}
                {selectedNode.quiz && (
                  <div style={{ background: '#fff7ed', padding: '0.85rem 1rem', borderRadius: '14px', marginBottom: '1.25rem', textAlign: 'left', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', marginBottom: '0.35rem' }}>
                      ✍️ Câu hỏi nhanh: {selectedNode.quiz.question}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {selectedNode.quiz.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuizAnswer(idx);
                            setShowQuizResult(true);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: showQuizResult && idx === selectedNode.quiz.correctIndex ? '2px solid #10b981' : '1px solid #fdba74',
                            background: showQuizResult && idx === selectedNode.quiz.correctIndex ? '#ecfdf5' : '#fff',
                            color: showQuizResult && idx === selectedNode.quiz.correctIndex ? '#059669' : '#1e293b',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {showQuizResult && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: quizAnswer === selectedNode.quiz.correctIndex ? '#059669' : '#e11d48', fontWeight: 700 }}>
                        {quizAnswer === selectedNode.quiz.correctIndex ? '🎉 Chính xác! ' : '⚠️ Chưa đúng! '} {selectedNode.quiz.explain}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="button"
                  className="btn-primary-purple"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 900,
                    background: selectedNode.status === 'locked'
                      ? '#94a3b8'
                      : 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: selectedNode.status === 'locked' ? 'none' : '0 5px 0 #991b1b',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: selectedNode.status === 'locked' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (selectedNode.status === 'locked') {
                      alert('Vui lòng hoàn thành các bài học trước để mở khóa bài học này!');
                    } else {
                      alert(`Đang mở giao diện học chi tiết cho ${selectedNode.step}: ${selectedNode.title}...`);
                      setSelectedNode(null);
                    }
                  }}
                >
                  {selectedNode.status === 'completed'
                    ? '📖 ÔN TẬP LẠI (+10 EXP)'
                    : selectedNode.status === 'active'
                    ? '▶️ BẮT ĐẦU HỌC (+25 EXP)'
                    : '🔒 CHƯA MỞ KHÓA'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating animation keyframes for Sakura Tree */}
      <style>{`
        @keyframes floatSakura {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
}
