import { useEffect, useMemo, useRef, useState } from 'react'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { PrincessFigure } from '../princess/PrincessFigure'
import { Sparkles } from '../ui/Sparkles'
import {
  CATEGORY_ORDER, CATEGORY_LABEL, itemsByCategory, getItem, DEFAULT_OUTFIT,
  type ItemCategory, type DressUpItem, type Outfit,
} from '../princess/catalog'
import { gachaPick, unownedItems, GACHA_COST } from '../princess/economy'

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.5)', zIndex: 30,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, overflowY: 'auto',
}
const cardStyle: React.CSSProperties = {
  position: 'relative', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
  padding: '22px 22px 20px', textAlign: 'center', maxWidth: 320, width: '100%',
  maxHeight: 'calc(100dvh - 44px)', overflowY: 'auto', boxShadow: 'var(--shadow-card)',
}
const yesBtn: React.CSSProperties = {
  flex: 1, border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 0', minHeight: 52,
  fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: '#fff',
  background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a',
}
const noBtn: React.CSSProperties = {
  flex: 1, border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 0', minHeight: 52,
  fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: 'var(--c-ink-soft)',
  background: '#f0e7da',
}

export function DressUp() {
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const [tab, setTab] = useState<ItemCategory>('dress')
  const [buyItem, setBuyItem] = useState<DressUpItem | null>(null)
  const [gachaState, setGachaState] = useState<'confirm' | 'spinning' | null>(null)
  const [reveal, setReveal] = useState<DressUpItem | null>(null)
  const gachaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const resolving = useRef(false) // 뽑기 연타 이중 차감 방지

  // 별 변화 피드백(-N 떠오름 + 카운터 강조)
  const [starDelta, setStarDelta] = useState<number | null>(null)
  const [pulse, setPulse] = useState(false)
  const prevStars = useRef(progress.stars)
  useEffect(() => {
    if (progress.stars === prevStars.current) return
    if (progress.stars < prevStars.current) setStarDelta(prevStars.current - progress.stars)
    setPulse(true)
    prevStars.current = progress.stars
    const t1 = setTimeout(() => setPulse(false), 460)
    const t2 = setTimeout(() => setStarDelta(null), 1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [progress.stars])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('공주님을 예쁘게 꾸며요') }, [])
  useEffect(() => () => clearTimeout(gachaTimer.current), [])

  const outfit = progress.outfit
  const items = itemsByCategory(tab)
  const remaining = useMemo(() => unownedItems(progress.ownedItems).length, [progress.ownedItems])
  const canGacha = remaining > 0 && progress.stars >= GACHA_COST

  function tapItem(item: DressUpItem) {
    const owned = progress.ownedItems.includes(item.id)
    if (owned) { dispatch({ type: 'equipItem', itemId: item.id }); speak(item.name) }
    else if (progress.stars >= item.cost) { setBuyItem(item); speak('이걸 살까요?') }
    else speak('별이 조금 더 필요해요')
  }
  function confirmBuy() {
    const item = buyItem
    setBuyItem(null)
    if (!item) return
    dispatch({ type: 'unlockItem', itemId: item.id }) // 별 차감 + 보유 + 장착
    speak('샀어요!')
  }

  function openGacha() {
    if (remaining === 0) { speak('아이템을 모두 모았어요'); return }
    if (progress.stars < GACHA_COST) { speak('별이 조금 더 필요해요'); return }
    setGachaState('confirm'); speak('뽑기 할까요?')
  }
  function confirmGacha() {
    if (resolving.current) return // 같은 프레임 연타 시 2번째 무시(이중 차감 방지)
    resolving.current = true
    const pick = gachaPick(progress.ownedItems, Math.random())
    if (!pick) { resolving.current = false; setGachaState(null); return }
    dispatch({ type: 'unlockItem', itemId: pick, costOverride: GACHA_COST })
    const item = getItem(pick)!
    setGachaState('spinning'); speak('두구두구')
    gachaTimer.current = setTimeout(() => {
      resolving.current = false
      setGachaState(null); setTab(item.category); setReveal(item); speak(item.name)
    }, 1300)
  }

  function randomize() {
    CATEGORY_ORDER.forEach((cat) => {
      const owned = itemsByCategory(cat).filter((it) => progress.ownedItems.includes(it.id))
      if (owned.length) dispatch({ type: 'equipItem', itemId: owned[Math.floor(Math.random() * owned.length)].id })
    })
    speak('짠! 새로운 공주님')
  }
  function resetOutfit() {
    CATEGORY_ORDER.forEach((cat) => dispatch({ type: 'equipItem', itemId: DEFAULT_OUTFIT[cat] }))
    speak('기본 공주님')
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'max(12px, env(safe-area-inset-top)) 14px 28px', gap: 12 }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 420 }}>
        <button onClick={() => go({ name: 'home' })}
          style={{ border: 'none', background: 'var(--c-card)', borderRadius: 999, padding: '10px 18px',
            minHeight: 44, display: 'inline-flex', alignItems: 'center',
            fontWeight: 800, color: 'var(--c-ink)', boxShadow: 'var(--shadow-card)' }}>
          ← 집으로
        </button>
        {/* 내 별(눈에 띄게 + 변화 강조) */}
        <div style={{ position: 'relative' }}>
          <div className={pulse ? 'kp-pop' : undefined}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#fff0b8,#ffd24d)',
              color: '#7a5a10', fontWeight: 800, fontSize: 20, padding: '8px 16px', borderRadius: 999,
              boxShadow: 'var(--shadow-card)' }}>
            ⭐ {progress.stars}
          </div>
          {starDelta != null && (
            <div className="kp-float" style={{ position: 'absolute', right: 8, top: -6, color: '#e8852b',
              fontWeight: 800, fontSize: 16, pointerEvents: 'none' }}>
              −{starDelta} ⭐
            </div>
          )}
        </div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 25, margin: '0' }}>공주 꾸미기 👗</h1>

      {/* 가로면 [미리보기·뽑기·변신 | 탭·아이템] 2단, 세로면 위아래로 */}
      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: landscape ? 'flex-start' : 'center',
        justifyContent: 'center', gap: landscape ? 20 : 12, width: '100%', maxWidth: landscape ? 800 : 420 }}>
      {/* 왼쪽: 미리보기 + 뽑기 + 무료 변신 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        width: '100%', maxWidth: landscape ? 320 : 420 }}>

      {/* 공주 미리보기 */}
      <div style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
        padding: 10, display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 300 }}>
        <PrincessFigure outfit={outfit} size={184} animate background />
      </div>

      {/* 뽑기(확인 팝업으로) */}
      <button onClick={openGacha}
        style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 24px', minHeight: 50,
          fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800,
          color: canGacha ? '#fff' : '#7c6a4f',
          background: canGacha ? 'linear-gradient(135deg, var(--c-pink), var(--c-accent))' : '#e7dcc9',
          boxShadow: canGacha ? '0 5px 0 #c4578f' : 'none' }}>
        🎁 뽑기 (별 {GACHA_COST}개){remaining === 0 ? ' · 다 모았어요!' : ''}
      </button>

      {/* 가진 옷으로 무료 변신 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={randomize}
          style={{ border: 'none', borderRadius: 999, padding: '9px 18px', minHeight: 44, fontFamily: 'var(--font-warm)',
            fontSize: 15, fontWeight: 800, color: 'var(--c-pink)', background: 'var(--c-card)', boxShadow: 'var(--shadow-card)' }}>
          🎲 랜덤 변신 · 무료
        </button>
        <button onClick={resetOutfit}
          style={{ border: 'none', borderRadius: 999, padding: '9px 18px', minHeight: 44, fontFamily: 'var(--font-warm)',
            fontSize: 15, fontWeight: 800, color: 'var(--c-ink-soft)', background: 'var(--c-card)', boxShadow: 'var(--shadow-card)' }}>
          ↺ 기본
        </button>
      </div>

      </div>{/* 왼쪽 끝 */}

      {/* 오른쪽: 카테고리 탭 + 아이템 그리드 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        width: '100%', maxWidth: landscape ? 460 : 420 }}>

      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420 }}>
        {CATEGORY_ORDER.map((cat) => (
          <button key={cat} onClick={() => setTab(cat)}
            style={{ border: 'none', borderRadius: 999, padding: '9px 16px', minHeight: 44,
              fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800,
              color: tab === cat ? '#fff' : 'var(--c-ink)',
              background: tab === cat ? 'var(--c-accent)' : 'var(--c-card)',
              boxShadow: 'var(--shadow-card)' }}>
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${landscape ? 4 : 3}, 1fr)`, gap: 10, width: '100%', maxWidth: landscape ? 460 : 420 }}>
        {items.map((item) => {
          const owned = progress.ownedItems.includes(item.id)
          const equipped = outfit[item.category] === item.id
          const affordable = progress.stars >= item.cost
          const previewOutfit: Outfit = { ...outfit, [item.category]: item.id }
          return (
            <button key={item.id} onClick={() => tapItem(item)}
              style={{ border: equipped ? '3px solid var(--c-accent)' : '2px solid #f0e2d0',
                borderRadius: 'var(--radius-md)', background: 'var(--c-card)', padding: '8px 6px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                opacity: owned || affordable ? 1 : 0.55,
                boxShadow: equipped ? '0 0 0 2px #fff, var(--shadow-card)' : 'var(--shadow-card)' }}>
              <div style={{ width: 64, height: 101, overflow: 'hidden', borderRadius: 10,
                background: 'linear-gradient(170deg,#fff6fb,#ffeaf4)' }}>
                <PrincessFigure outfit={previewOutfit} size={64} background={tab === 'background'} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', lineHeight: 1.15 }}>
                {item.name}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800,
                color: equipped ? 'var(--c-correct)' : owned ? 'var(--c-ink-soft)' : affordable ? 'var(--c-accent-strong)' : 'var(--c-ink-soft)' }}>
                {equipped ? '입는 중 ✓' : owned ? '입기' : affordable ? `⭐${item.cost} 사기` : `🔒 ⭐${item.cost}`}
              </div>
            </button>
          )
        })}
      </div>

      </div>{/* 오른쪽 끝 */}
      </div>{/* 2단 래퍼 끝 */}

      {/* 구매 확인 팝업 */}
      {buyItem && (
        <div style={overlayStyle} onClick={() => setBuyItem(null)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 120, height: 190, margin: '0 auto' }}>
              <PrincessFigure outfit={{ ...outfit, [buyItem.category]: buyItem.id }} size={120} background />
            </div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, marginTop: 6 }}>{buyItem.name}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-accent-strong)', margin: '6px 0 2px' }}>
              ⭐ {buyItem.cost} 에 살까요?
            </div>
            <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginBottom: 14 }}>
              내 별 ⭐{progress.stars} → 사면 ⭐{progress.stars - buyItem.cost}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmBuy} style={yesBtn}>살래요</button>
              <button onClick={() => setBuyItem(null)} style={noBtn}>안 살래요</button>
            </div>
          </div>
        </div>
      )}

      {/* 뽑기 확인 팝업 */}
      {gachaState === 'confirm' && (
        <div style={overlayStyle} onClick={() => setGachaState(null)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 72 }}>🎁</div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800 }}>뽑기</div>
            <div style={{ fontSize: 16, color: 'var(--c-ink)', margin: '6px 0 2px' }}>
              별 {GACHA_COST}개로 새 아이템을 뽑아요!
            </div>
            <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginBottom: 14 }}>
              아직 못 모은 아이템 {remaining}개 · 내 별 ⭐{progress.stars}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmGacha} style={yesBtn}>뽑을래요</button>
              <button onClick={() => setGachaState(null)} style={noBtn}>안 뽑을래요</button>
            </div>
          </div>
        </div>
      )}

      {/* 뽑기 두구두구(서스펜스) */}
      {gachaState === 'spinning' && (
        <div style={overlayStyle}>
          <div style={{ textAlign: 'center' }}>
            <div className="kp-wiggle" style={{ fontSize: 96 }}>🎁</div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 10 }}>
              두구두구…
            </div>
          </div>
        </div>
      )}

      {/* 뽑기 결과 */}
      {reveal && (
        <div style={overlayStyle} onClick={() => setReveal(null)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <Sparkles />
            <div style={{ width: 120, height: 190, margin: '0 auto' }}>
              <PrincessFigure outfit={{ ...outfit, [reveal.category]: reveal.id }} size={120} background />
            </div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, marginTop: 8 }}>
              {reveal.name} 획득! 🎉
            </div>
            <div style={{ fontSize: 15, color: 'var(--c-ink-soft)', marginTop: 4, fontWeight: 800 }}>
              남은 별 ⭐{progress.stars}
            </div>
            <button onClick={() => setReveal(null)}
              style={{ marginTop: 14, border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 30px', minHeight: 50,
                fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: '#fff',
                background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a' }}>
              좋아요!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
