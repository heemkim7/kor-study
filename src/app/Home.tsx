import { useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useTts } from '../tts/useTts'
import { PrincessFigure } from '../princess/PrincessFigure'
import { STICKERS } from '../reward/stickers'
import { todayStr } from '../progress/progress'
import { isBgmEnabled, toggleBgm, resumeAudio } from '../audio/sound'

export function Home() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { speak } = useTts()
  const [bgmOn, setBgmOn] = useState(isBgmEnabled())
  const playedToday = progress.lastPlayedDate === todayStr()

  const subjectCard = (emoji: string, title: string, desc: string, bg: string, onClick: () => void, badge?: string) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 380,
        padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
        background: bg, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 42, flex: '0 0 auto', width: 52, textAlign: 'center' }}>{emoji}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 24, fontWeight: 800, color: 'var(--c-ink)' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-ink-soft)' }}>{badge ?? '▶'}</div>
    </button>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(20px, env(safe-area-inset-top)) 16px 32px', textAlign: 'center' }}>
      {/* 상단: 음소거 + 진행 카운터 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 380 }}>
        <button onClick={() => { resumeAudio(); setBgmOn(toggleBgm()) }} aria-label={bgmOn ? '배경음악 끄기' : '배경음악 켜기'}
          style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'var(--c-card)',
            fontSize: 18, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>{bgmOn ? '🔊' : '🔇'}</button>
        <div style={{ fontWeight: 800, color: 'var(--c-accent-strong)' }}>
          {progress.streak > 0 && <>🔥 {progress.streak} · </>}⭐ {progress.stars} · 🏅 {progress.stickers}
        </div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 30, marginTop: -2 }}>우리 딸 배움터</h1>
      <p style={{ color: 'var(--c-ink-soft)', marginTop: -8 }}>무엇을 배워 볼까요?</p>

      {/* 오늘의 목표 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
        background: playedToday ? 'linear-gradient(135deg,#d6f5e0,#f0fff6)' : 'linear-gradient(135deg,#fff3d6,#fffaf0)',
        boxShadow: 'var(--shadow-card)', fontWeight: 800, fontSize: 14, color: 'var(--c-ink)' }}>
        {playedToday
          ? <>🎉 오늘 목표 달성! {progress.streak > 1 && `🔥 ${progress.streak}일 연속`}</>
          : <>🎯 오늘의 목표 · 놀이 1개 하기</>}
      </div>

      {/* 학습 — 과목 선택 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380, marginTop: 6 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink-soft)',
          textAlign: 'left', margin: '0 4px' }}>📚 배우기</div>
        {subjectCard('📖', '한글', '글자와 단어를 배워요', 'linear-gradient(135deg,#efe6ff,#f8f4ff)', () => go({ name: 'subject', subject: 'hangul' }))}
        {subjectCard('🔢', '숫자', '수를 세고 비교해요', 'linear-gradient(135deg,#e3f7ec,#f3fff8)', () => go({ name: 'subject', subject: 'number' }))}
        {subjectCard('🔤', '영어', '곧 만나요!', 'linear-gradient(135deg,#e6f1ff,#f5faff)', () => speak('영어는 곧 만나요'), '🔜')}
      </div>

      {/* 놀이방 — 보상/창작 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380, marginTop: 10 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink-soft)',
          textAlign: 'left', margin: '0 4px' }}>🎈 놀이방</div>
        <button onClick={() => go({ name: 'dressup' })}
          style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 18px',
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ffe4f1,#fff0f8)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: 56, height: 88, flex: '0 0 auto' }}>
            <PrincessFigure outfit={progress.outfit} size={56} animate background={false} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 21, fontWeight: 800, color: 'var(--c-pink)' }}>👗 공주 꾸미기</div>
            <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>별 ⭐{progress.stars}개로 옷과 왕관을 모아요</div>
          </div>
          <div style={{ fontSize: 24 }}>▶</div>
        </button>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={() => go({ name: 'stickers' })}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '12px 8px',
              borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#fff3d6,#fffaf0)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 30 }}>🏅</div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: 'var(--c-accent-strong)' }}>스티커 책</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>{progress.collectedStickers.length} / {STICKERS.length}장</div>
          </button>
          <button onClick={() => go({ name: 'draw' })}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '12px 8px',
              borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#d9f2ff,#f0fbff)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 30 }}>🎨</div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#3aa0d0' }}>그림 그리기</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>색칠하고 그려요</div>
          </button>
        </div>
      </div>

      {/* 보호자 입구(작게) */}
      <button onClick={() => go({ name: 'parent' })}
        style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--c-ink-soft)',
          fontSize: 13, fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>
        📊 보호자 · 학습 리포트
      </button>
    </div>
  )
}
