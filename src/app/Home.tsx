import { useState, type ReactNode } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { STICKERS } from '../reward/stickers'
import { PETS } from '../reward/pets'
import { todayStr, canOpenChest, CHEST_STARS, CHEST_MILESTONE_STARS } from '../progress/progress'
import { isBgmEnabled, toggleBgm, resumeAudio, playReward } from '../audio/sound'

export function Home() {
  const { go } = useNavigation()
  const { progress, dispatch } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const [bgmOn, setBgmOn] = useState(isBgmEnabled())
  const [chestOpen, setChestOpen] = useState(false)
  const [chestReward, setChestReward] = useState<number | null>(null)
  const todayCount = progress.playLog[todayStr()] ?? 0
  const goalMet = todayCount >= progress.dailyGoal
  const canOpen = canOpenChest(progress, todayStr())

  // 매일 선물상자 — 하루 1회 별 보너스(스트릭 마일스톤이면 더)
  function openTheChest() {
    if (!canOpen) { setChestReward(null); setChestOpen(true); return } // 이미 받은 날
    const milestone = progress.streak > 0 && progress.streak % 7 === 0
    const gain = milestone ? CHEST_MILESTONE_STARS : CHEST_STARS
    dispatch({ type: 'openChest', today: todayStr() })
    setChestReward(gain)
    setChestOpen(true)
    resumeAudio(); playReward()
    speak('오늘의 선물이에요!')
  }

  // 과목 타일(콤팩트) — 큰 아이콘 + 제목
  const subjTile = (emoji: string, title: string, bg: string, onClick: () => void) => (
    <button onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        minHeight: 112, padding: '14px 8px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
        background: bg, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 48 }}>{emoji}</div>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>{title}</div>
    </button>
  )

  // 놀이 타일(콤팩트) — 아이콘 + 이름 + 작은 설명
  const playTile = (icon: ReactNode, label: string, sub: string, bg: string, color: string, onClick: () => void) => (
    <button onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        minHeight: 106, padding: '12px 6px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
        background: bg, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15.5, fontWeight: 800, color }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--c-ink-soft)' }}>{sub}</div>}
    </button>
  )

  const sectionLabel = (text: string) => (
    <div style={{ fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink-soft)',
      textAlign: 'left', margin: '2px 4px' }}>{text}</div>
  )

  // 배우기 — 과목(3칸 그리드)
  const learnBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {sectionLabel('📚 배우기')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {subjTile('📖', '한글', 'linear-gradient(135deg,#efe6ff,#f8f4ff)', () => go({ name: 'subject', subject: 'hangul' }))}
        {subjTile('🔢', '숫자', 'linear-gradient(135deg,#e3f7ec,#f3fff8)', () => go({ name: 'subject', subject: 'number' }))}
        {subjTile('🔤', '영어', 'linear-gradient(135deg,#e6f1ff,#f5faff)', () => go({ name: 'subject', subject: 'english' }))}
      </div>
    </div>
  )

  const royalThumb = <img src="/img/royal/looks/rose.webp" alt="" aria-hidden
    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', boxShadow: 'var(--shadow-card)' }} />

  // 놀이방 — 보상/창작(반응형 auto-fit 그리드: 폭에 따라 칸 수 자동)
  const playBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {sectionLabel('🎈 놀이방')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 12 }}>
        {playTile('👗', '공주 꾸미기', `⭐${progress.stars}`, 'linear-gradient(135deg,#ffe4f1,#fff0f8)', 'var(--c-pink)', () => go({ name: 'dressup' }))}
        {playTile(royalThumb, '진짜 공주', '모으기', 'linear-gradient(135deg,#efe0ff,#fbf3ff)', '#9b6bff', () => go({ name: 'royal' }))}
        {playTile('👨‍👩‍👧', '우리 가족', '읽기', 'linear-gradient(135deg,#fff0d9,#fffaf2)', '#e0922a', () => go({ name: 'family' }))}
        {playTile('🏅', '스티커 책', `${progress.collectedStickers.length}/${STICKERS.length}`, 'linear-gradient(135deg,#fff3d6,#fffaf0)', 'var(--c-accent-strong)', () => go({ name: 'stickers' }))}
        {playTile('🎨', '그림 그리기', '색칠', 'linear-gradient(135deg,#d9f2ff,#f0fbff)', '#3aa0d0', () => go({ name: 'draw' }))}
        {playTile('📚', '낱말 도감', '단어', 'linear-gradient(135deg,#ffeede,#fff8f0)', '#d98a3a', () => go({ name: 'wordbook' }))}
        {playTile('🏆', '내 뱃지', '업적', 'linear-gradient(135deg,#fff0d6,#fffbf0)', '#e0a020', () => go({ name: 'badges' }))}
        {playTile('🥚', '알 키우기', `${progress.hatchedPets.length}/${PETS.length}`, 'linear-gradient(135deg,#ffe1ec,#fff2f7)', 'var(--c-pink)', () => go({ name: 'egg' }))}
        {playTile('🪴', '마법 정원', '꽃', 'linear-gradient(135deg,#e3f7e8,#f3fff7)', '#3ec46d', () => go({ name: 'garden' }))}
      </div>
    </div>
  )

  // 반응형 폭: 세로는 430(2~3칸), 가로는 860(여러 칸). 그리드가 폭에 맞춰 칸 수 자동 조절.
  const MAXW = landscape ? 860 : 430
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 24px', textAlign: 'center' }}>
      {/* 상단: 음소거 + 진행 카운터 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        maxWidth: MAXW }}>
        <button onClick={() => { resumeAudio(); setBgmOn(toggleBgm()) }} aria-label={bgmOn ? '배경음악 끄기' : '배경음악 켜기'}
          style={{ width: 54, height: 54, borderRadius: 999, border: 'none', background: 'var(--c-card)',
            fontSize: 24, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>{bgmOn ? '🔊' : '🔇'}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 800, color: 'var(--c-accent-strong)' }}>
            {progress.streak > 0 && <>🔥 {progress.streak} · </>}⭐ {progress.stars} · 🏅 {progress.stickers}
          </div>
          <button onClick={openTheChest} aria-label="오늘의 선물상자" className={canOpen ? 'kp-wiggle' : undefined}
            style={{ width: 54, height: 54, borderRadius: 999, border: 'none',
              background: canOpen ? 'linear-gradient(135deg,#ffd24d,#ff9ec7)' : 'var(--c-card)',
              fontSize: 26, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🎁</button>
        </div>
      </div>

      <img src="/img/mascot.webp" alt="" aria-hidden
        style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-card)' }} />
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 2 }}>우리 딸 배움터</h1>

      {/* 오늘의 목표 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
        background: goalMet ? 'linear-gradient(135deg,#d6f5e0,#f0fff6)' : 'linear-gradient(135deg,#fff3d6,#fffaf0)',
        boxShadow: 'var(--shadow-card)', fontWeight: 800, fontSize: 14, color: 'var(--c-ink)' }}>
        {goalMet
          ? <>🎉 오늘 목표 달성! {progress.streak > 1 && `🔥 ${progress.streak}일 연속`}</>
          : <>🎯 오늘의 목표 · 놀이 {todayCount}/{progress.dailyGoal}</>}
      </div>

      {/* 본문: 콤팩트 반응형 그리드(폭에 따라 칸 수 자동) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: MAXW, marginTop: 4 }}>
        {learnBlock}
        {playBlock}
      </div>

      {/* 보호자 입구(작게) */}
      <button onClick={() => go({ name: 'parent' })}
        style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--c-ink-soft)',
          fontSize: 13, fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>
        📊 보호자 · 학습 리포트
      </button>

      {/* 매일 선물상자 팝업 */}
      {chestOpen && (
        <div onClick={() => setChestOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.5)', zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: '28px 28px 22px',
              textAlign: 'center', maxWidth: 320, width: '100%', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 84, lineHeight: 1 }}>🎁</div>
            {chestReward != null ? (
              <>
                <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, marginTop: 6 }}>오늘의 선물!</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-accent-strong)', marginTop: 6 }}>⭐ +{chestReward}</div>
              </>
            ) : (
              <div style={{ fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>
                오늘 선물은 받았어요.<br />내일 또 만나요! 👋
              </div>
            )}
            <button onClick={() => setChestOpen(false)}
              style={{ marginTop: 16, border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 30px', minHeight: 50,
                fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: '#fff', background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a' }}>
              좋아요!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
