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
  const [undoOutfit, setUndoOutfit] = useState<Outfit | null>(null) // '기본' 되돌리기용
  const gachaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
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
  useEffect(() => () => { clearTimeout(gachaTimer.current); clearTimeout(undoTimer.current) }, [])

  const outfit = progress.outfit
  const items = itemsByCategory(tab)
  // 탭(카테고리)마다 아이템 개수가 달라도 '아이템 영역 높이'를 고정 →
  // 탭을 바꿔도 전체 높이가 일정 → FitShell 스케일 고정 → 타일 크기가 출렁이지 않음.
  // 아이템이 많은 카테고리는 이 영역 안에서만 세로 스크롤(아이 손가락으로 쓸어 넘김).
  const gridCols = landscape ? 4 : 3
  const gridAreaH = landscape ? 330 : 470
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
    setUndoOutfit(outfit) // 되돌리기용으로 현재 옷 저장(실수로 눌러도 복구)
    CATEGORY_ORDER.forEach((cat) => dispatch({ type: 'equipItem', itemId: DEFAULT_OUTFIT[cat] }))
    speak('기본 공주님')
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setUndoOutfit(null), 6000)
  }
  function undoReset() {
    if (!undoOutfit) return
    CATEGORY_ORDER.forEach((cat) => dispatch({ type: 'equipItem', itemId: undoOutfit[cat] }))
    setUndoOutfit(null); speak('되돌렸어요')
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

      {/* 가진 옷으로 무료 변신 — '기본(리셋)'은 오터치 방지를 위해 멀리 떼고 약하게 */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
        <button onClick={randomize}
          style={{ border: 'none', borderRadius: 999, padding: '11px 22px', minHeight: 46, fontFamily: 'var(--font-warm)',
            fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, var(--c-pink), var(--c-accent))',
            boxShadow: '0 4px 0 #c4578f' }}>
          🎲 랜덤 변신 · 무료
        </button>
        {undoOutfit ? (
          <button onClick={undoReset}
            style={{ border: 'none', borderRadius: 999, padding: '9px 16px', minHeight: 44, fontFamily: 'var(--font-warm)',
              fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', background: 'var(--c-card)', boxShadow: '0 4px 0 #e3cba8' }}>
            ↩️ 되돌리기
          </button>
        ) : (
          <button onClick={resetOutfit} aria-label="기본 공주로"
            style={{ border: '2px solid #e3cba8', borderRadius: 999, padding: '8px 14px', minHeight: 44, fontFamily: 'var(--font-warm)',
              fontSize: 13, fontWeight: 800, color: 'var(--c-ink-soft)', background: 'transparent' }}>
            ↺ 기본
          </button>
        )}
      </div>

      </div>{/* 왼쪽 끝 */}

      {/* 오른쪽: 카테고리 탭 + 아이템 그리드 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        width: '100%', maxWidth: landscape ? 460 : 420 }}>

      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 440 }}>
        {CATEGORY_ORDER.map((cat) => (
          <button key={cat} onClick={() => setTab(cat)}
            style={{ border: 'none', borderRadius: 999, padding: '11px 18px', minHeight: 50,
              fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800,
              color: tab === cat ? '#fff' : 'var(--c-ink)',
              background: tab === cat ? 'var(--c-accent)' : 'var(--c-card)',
              boxShadow: 'var(--shadow-card)' }}>
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 14, width: '100%', maxWidth: landscape ? 480 : 420,
        height: gridAreaH, overflowY: 'auto', alignContent: 'start', paddingRight: 4,
        WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {items.map((item) => {
          const owned = progress.ownedItems.includes(item.id)
          const equipped = outfit[item.category] === item.id
          const affordable = progress.stars >= item.cost
          const previewOutfit: Outfit = { ...outfit, [item.category]: item.id }
          return (
            <button key={item.id} onClick={() => tapItem(item)}
              style={{ position: 'relative', border: equipped ? '3px solid var(--c-accent)' : '2px solid #f0e2d0',
                borderRadius: 'var(--radius-md)', background: 'var(--c-card)', padding: '8px 6px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                opacity: owned || affordable ? 1 : 0.55,
                boxShadow: equipped ? '0 0 0 2px #fff, var(--shadow-card)' : 'var(--shadow-card)' }}>
              {/* 글자 못 읽는 아이도 '이미 내 옷'을 한눈에: 보유 타일 우상단 초록 체크 */}
              {owned && (
                <span aria-hidden style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
                  background: 'var(--c-correct)', color: '#fff', fontSize: 13, fontWeight: 800, zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>✓</span>
              )}
              <div style={{ width: 64, height: 101, overflow: 'hidden', borderRadius: 10,
                background: 'linear-gradient(170deg,#fff6fb,#ffeaf4)' }}>
                <PrincessFigure outfit={previewOutfit} size={64} background={tab === 'background'} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', lineHeight: 1.15,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
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

      {/* 구매 확인 팝업 — 바뀐 모습을 크게 보여줌(지금 vs 입었을 때) */}
      {buyItem && (
        <div style={overlayStyle} onClick={() => setBuyItem(null)}>
          <div style={{ ...cardStyle, maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 110, height: 173, margin: '0 auto', opacity: 0.65 }}>
                  <PrincessFigure outfit={outfit} size={110} background />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-ink-soft)', marginTop: 2 }}>지금</div>
              </div>
              <div style={{ fontSize: 30, paddingBottom: 60, color: 'var(--c-accent-strong)' }}>➜</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 180, height: 283, margin: '0 auto' }}>
                  <PrincessFigure outfit={{ ...outfit, [buyItem.category]: buyItem.id }} size={180} background />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-accent-strong)', marginTop: 2 }}>입으면!</div>
              </div>
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
          <div style={{ ...cardStyle, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <Sparkles />
            <div style={{ width: 200, height: 314, margin: '0 auto' }}>
              <PrincessFigure outfit={{ ...outfit, [reveal.category]: reveal.id }} size={200} background />
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
