import { useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { PrincessFigure } from '../princess/PrincessFigure'
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

  const subjectCard = (emoji: string, title: string, desc: string, bg: string, onClick: () => void, badge?: string) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%',
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

  // 배우기 — 과목 선택(한글·숫자·영어)
  const learnBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink-soft)',
        textAlign: 'left', margin: '0 4px' }}>📚 배우기</div>
      {subjectCard('📖', '한글', '글자와 단어를 배워요', 'linear-gradient(135deg,#efe6ff,#f8f4ff)', () => go({ name: 'subject', subject: 'hangul' }))}
      {subjectCard('🔢', '숫자', '수를 세고 비교해요', 'linear-gradient(135deg,#e3f7ec,#f3fff8)', () => go({ name: 'subject', subject: 'number' }))}
      {subjectCard('🔤', '영어', '알파벳 ABC를 배워요', 'linear-gradient(135deg,#e6f1ff,#f5faff)', () => go({ name: 'subject', subject: 'english' }))}
    </div>
  )

  // 놀이방 — 보상/창작
  const playBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
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
      <button onClick={() => go({ name: 'royal' })}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 18px',
          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#efe0ff,#fbf3ff)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ width: 52, height: 70, flex: '0 0 auto', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <img src="/img/royal/looks/rose.webp" alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 21, fontWeight: 800, color: '#9b6bff' }}>✨ 진짜 공주</div>
          <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>예쁜 공주를 별로 모아요</div>
        </div>
        <div style={{ fontSize: 24 }}>▶</div>
      </button>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button onClick={() => go({ name: 'stickers' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#fff3d6,#fffaf0)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>🏅</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: 'var(--c-accent-strong)' }}>스티커 책</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>{progress.collectedStickers.length} / {STICKERS.length}장</div>
        </button>
        <button onClick={() => go({ name: 'draw' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#d9f2ff,#f0fbff)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>🎨</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#3aa0d0' }}>그림 그리기</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>색칠하고 그려요</div>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button onClick={() => go({ name: 'wordbook' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ffeede,#fff8f0)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>📚</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#d98a3a' }}>낱말 도감</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>배운 단어 모으기</div>
        </button>
        <button onClick={() => go({ name: 'badges' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#fff0d6,#fffbf0)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>🏆</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#e0a020' }}>내 뱃지</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>업적을 모아요</div>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button onClick={() => go({ name: 'egg' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ffe1ec,#fff2f7)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>🥚</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: 'var(--c-pink)' }}>알 키우기</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>{progress.hatchedPets.length} / {PETS.length}마리</div>
        </button>
        <button onClick={() => go({ name: 'garden' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '18px 8px', minHeight: 92,
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#e3f7e8,#f3fff7)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 40 }}>🪴</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#3ec46d' }}>마법 정원</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>꽃을 키워요</div>
        </button>
      </div>
      <button onClick={() => go({ name: 'family' })}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 18px',
          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#fff0d9,#fffaf2)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 34, flex: '0 0 auto', width: 48, textAlign: 'center' }}>👨‍👩‍👧</div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 21, fontWeight: 800, color: '#e0922a' }}>우리 가족 읽기</div>
          <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>
            {progress.familyWords.length > 0 ? `내 이름과 가족 단어 ${progress.familyWords.length}개를 읽어요` : '보호자가 이름을 넣어 주세요'}
          </div>
        </div>
        <div style={{ fontSize: 24 }}>▶</div>
      </button>
    </div>
  )

  // 컬럼(세로) 폭은 380 고정, 가로일 땐 두 블록을 좌우로 펼침
  const COL = 380
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(20px, env(safe-area-inset-top)) 16px 28px', textAlign: 'center' }}>
      {/* 상단: 음소거 + 진행 카운터 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        maxWidth: landscape ? COL * 2 + 24 : COL }}>
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
        style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-card)', marginTop: 2 }} />
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 30, marginTop: 2 }}>우리 딸 배움터</h1>
      <p style={{ color: 'var(--c-ink-soft)', marginTop: -8 }}>콩콩이와 함께 배워요!</p>

      {/* 오늘의 목표 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
        background: goalMet ? 'linear-gradient(135deg,#d6f5e0,#f0fff6)' : 'linear-gradient(135deg,#fff3d6,#fffaf0)',
        boxShadow: 'var(--shadow-card)', fontWeight: 800, fontSize: 14, color: 'var(--c-ink)' }}>
        {goalMet
          ? <>🎉 오늘 목표 달성! {progress.streak > 1 && `🔥 ${progress.streak}일 연속`}</>
          : <>🎯 오늘의 목표 · 놀이 {todayCount}/{progress.dailyGoal}</>}
      </div>

      {/* 본문: 가로면 [배우기 | 놀이방] 2단, 세로면 위아래로 */}
      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column',
        alignItems: 'flex-start', justifyContent: 'center', gap: landscape ? 24 : 10,
        width: '100%', maxWidth: landscape ? COL * 2 + 24 : COL, marginTop: 6 }}>
        <div style={{ flex: landscape ? `0 1 ${COL}px` : '0 0 auto', width: '100%', maxWidth: COL }}>{learnBlock}</div>
        <div style={{ flex: landscape ? `0 1 ${COL}px` : '0 0 auto', width: '100%', maxWidth: COL }}>{playBlock}</div>
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
