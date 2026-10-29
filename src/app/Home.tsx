import { useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { todayStr, canOpenChest, CHEST_STARS, CHEST_MILESTONE_STARS } from '../progress/progress'
import { CandyTile } from '../ui/CandyTile'
import { Kong } from '../ui/Kong'
import { recommendNext } from './recommend'
import { canPlayLesson, FREE_ENTITLEMENT } from '../entitlement/entitlement'
import { isBgmEnabled, toggleBgm, resumeAudio, playReward } from '../audio/sound'

/** 홈 메뉴 아이콘(제미나이 생성 입체 일러스트) */
const Ico = ({ n, h = '100%' }: { n: string; h?: string }) => (
  <img src={`/img/icons/${n}.webp`} alt="" aria-hidden draggable={false} style={{ height: h, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
)

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
    // 이미 받은 날 — 무음이면 '왜 별이 안 나오지' 혼란. 짧은 안내 음성으로 알려줌.
    if (!canOpen) { setChestReward(null); setChestOpen(true); resumeAudio(); speak('오늘 선물은 받았어요. 내일 또 와요!'); return }
    const milestone = progress.streak > 0 && progress.streak % 7 === 0
    const gain = milestone ? CHEST_MILESTONE_STARS : CHEST_STARS
    dispatch({ type: 'openChest', today: todayStr() })
    setChestReward(gain)
    setChestOpen(true)
    resumeAudio(); playReward()
    speak('오늘의 선물이에요!')
  }

  const sectionLabel = (text: string) => (
    <div className="kp-title" style={{ fontSize: 21, textAlign: 'left', margin: '4px 6px 0' }}>{text}</div>
  )

  // 오늘의 놀이 — 가장 덜 진행된 트랙의 다음 수업으로 바로 안내(아이가 고르는 부담을 덜어 줌)
  const rec = recommendNext(progress.completedLessons)
  const startToday = () => {
    if (!rec) { go({ name: 'subject', subject: 'hangul' }); return }
    const idx = rec.track.nodes.indexOf(rec.node)
    go(canPlayLesson(idx, FREE_ENTITLEMENT) ? rec.node.screen : { name: 'paywall' })
  }

  const todayBlock = (
    <button className="kp-tile" onClick={startToday} aria-label="오늘의 놀이 시작"
      style={{ '--tile-a': '#fff4d6', '--tile-b': '#ffd37a', '--tile-lip': '#e7a93c',
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 18px 14px 12px', minHeight: 130,
        textAlign: 'left' } as React.CSSProperties}>
      <Kong pose={rec ? 'point' : 'cheer'} size={104} bob />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, color: '#a86a10' }}>{rec ? '오늘의 놀이' : '모두 배웠어요!'}</div>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 32, color: 'var(--c-ink)', lineHeight: 1.15 }}>
          {rec ? rec.node.title : '복습하러 가요'}
        </div>
        {rec && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink-soft)', marginTop: 2 }}>{rec.track.label}</div>}
      </div>
      <div style={{ height: 84, flex: '0 0 auto', display: 'flex' }}><Ico n="play" /></div>
    </button>
  )

  const subjectBlock = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%' }}>
      <CandyTile big icon={<Ico n="hangul" />} label="한글" a="#f3ecff" b="#d9c8fb" lip="var(--lip-purple)" onClick={() => go({ name: 'subject', subject: 'hangul' })} />
      <CandyTile big icon={<Ico n="number" />} label="숫자" a="#eafaf1" b="#bfe9d0" lip="var(--lip-green)" onClick={() => go({ name: 'subject', subject: 'number' })} />
      <CandyTile big icon={<Ico n="english" />} label="영어" a="#eaf3ff" b="#bcd8f8" lip="var(--lip-blue)" onClick={() => go({ name: 'subject', subject: 'english' })} />
    </div>
  )

  const roomBlock = (
    <button className="kp-tile" onClick={() => go({ name: 'room' })}
      style={{ '--tile-a': '#ffeaf4', '--tile-b': '#fbc4dc', '--tile-lip': 'var(--lip-pink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%', minHeight: 92, padding: '10px 18px' } as React.CSSProperties}>
      <div style={{ height: 64, display: 'flex' }}><Ico n="dressup" /></div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 26, color: '#c24a86' }}>내 방</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink-soft)' }}>꾸미기 · 스티커 · 알 · 정원</div>
      </div>
      <div style={{ height: 52, display: 'flex' }}><Ico n="sticker" /></div>
    </button>
  )

  // 반응형 폭: 세로는 430(2~3칸), 가로는 820(=FitShell 가로 캔버스). 그리드가 폭에 맞춰 칸 수 자동 조절.
  const MAXW = landscape ? 820 : 430
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 24px', textAlign: 'center' }}>
      {/* 상단: 음소거 + 진행 카운터 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        maxWidth: MAXW }}>
        <button onClick={() => { resumeAudio(); setBgmOn(toggleBgm()) }} aria-label={bgmOn ? '배경음악 끄기' : '배경음악 켜기'}
          style={{ width: 54, height: 54, borderRadius: 999, border: 'none', background: 'var(--c-card)',
            fontSize: 24, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>{bgmOn ? '🔊' : '🔇'}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <div className="kp-chip" style={{ color: 'var(--c-accent-strong)', minWidth: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {progress.streak > 0 && <>🔥 {progress.streak} · </>}⭐ {progress.stars} · 🏅 {progress.stickers}
          </div>
          <button onClick={openTheChest} aria-label="오늘의 선물상자" className={canOpen ? 'kp-wiggle' : undefined}
            style={{ width: 54, height: 54, borderRadius: 999, border: 'none',
              background: canOpen ? 'linear-gradient(135deg,#ffd24d,#ff9ec7)' : 'var(--c-card)',
              padding: 8, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}><Ico n="gift" /></button>
        </div>
      </div>

      <img className="kp-bob" src="/img/mascot.webp" alt="" aria-hidden
        style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '5px solid #fff',
          boxShadow: '0 6px 0 rgba(0,0,0,.07), 0 14px 22px rgba(70,45,25,.2)' }} />
      <h1 className="kp-title" style={{ fontSize: 34, marginTop: 0 }}>우리 딸 배움터</h1>

      {/* 오늘의 목표 */}
      <div className="kp-chip" style={{
        background: goalMet ? 'linear-gradient(135deg,#d6f5e0,#f0fff6)' : 'rgba(255,255,255,.92)' }}>
        {goalMet
          ? <>🎉 오늘 목표 달성! {progress.streak > 1 && `🔥 ${progress.streak}일 연속`}</>
          : <>🎯 오늘의 목표 · 놀이 {todayCount}/{progress.dailyGoal}</>}
      </div>

      {/* 본문: 콤팩트 반응형 그리드(폭에 따라 칸 수 자동) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: MAXW, marginTop: 4 }}>
        {todayBlock}
        {sectionLabel('📚 배우기')}
        {subjectBlock}
        {roomBlock}
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
            <div style={{ fontSize: 84, lineHeight: 1 }}>{chestReward != null ? '🎁' : '😴'}</div>
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
            <button className="kp-primary" onClick={() => setChestOpen(false)}
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
