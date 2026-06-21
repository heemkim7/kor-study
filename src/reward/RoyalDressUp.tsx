import { useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { Sparkles } from '../ui/Sparkles'
import { playSticker } from '../audio/sound'
import {
  ROYAL_BASES, ROYAL_ITEMS, ROYAL_CATEGORIES, getRoyalBase, getRoyalItem,
  type RoyalCategory, type RoyalItem,
} from './royal'

type Tab = 'base' | RoyalCategory
// 합성 z-순서(뒤→앞). 왕관이 가장 위.
const LAYER_ORDER: RoyalCategory[] = ['necklace', 'shoes', 'hand', 'hair', 'crown']

/** 실사 공주 — 베이스 위에 부위별 악세서리를 겹쳐 꾸미는 종이인형식 꾸미기. */
export function RoyalDressUp() {
  const { go } = useNavigation()
  const { progress, dispatch } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const [tab, setTab] = useState<Tab>('crown')
  const [celebrate, setCelebrate] = useState(false)

  const unlocked = new Set(progress.royalUnlocked)
  const base = getRoyalBase(progress.royalBase) ?? ROYAL_BASES[0]

  function unlock(id: string, cost: number, name: string) {
    if (progress.stars < cost) { speak('별이 조금 더 필요해요'); return false }
    dispatch({ type: 'unlockRoyal', id })
    setCelebrate(true); playSticker(); speak('참 예뻐요!')
    void name
    window.setTimeout(() => setCelebrate(false), 900)
    return true
  }

  function tapBase(id: string) {
    const b = getRoyalBase(id)!
    if (unlocked.has(id)) { dispatch({ type: 'equipRoyalBase', id }); speak(b.name); return }
    if (unlock(id, b.cost, b.name)) dispatch({ type: 'equipRoyalBase', id })
  }

  function tapItem(it: RoyalItem) {
    if (unlocked.has(it.id)) { dispatch({ type: 'equipRoyalItem', category: it.category, id: it.id }); speak(it.name); return }
    if (unlock(it.id, it.cost, it.name)) dispatch({ type: 'equipRoyalItem', category: it.category, id: it.id })
  }

  // 큰 합성 미리보기(베이스 + 착용 악세서리 레이어)
  const preview = (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-card)', background: 'var(--c-card)', width: '100%', maxWidth: 300, aspectRatio: '3 / 4' }}>
      {celebrate && <Sparkles />}
      <img src={base.file} alt={base.name} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
      {LAYER_ORDER.map((cat) => {
        const id = progress.royalOutfit[cat]
        const it = id ? getRoyalItem(id) : undefined
        if (!it) return null
        return (
          <img key={cat} src={it.file} alt={it.name} aria-hidden
            style={{ position: 'absolute', left: `${it.xPct}%`, top: `${it.yPct}%`, width: `${it.wPct}%`,
              transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        )
      })}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px',
        background: 'linear-gradient(transparent, rgba(70,40,60,0.5))', color: '#fff',
        fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, textAlign: 'center' }}>{base.name}</div>
    </div>
  )

  // 탭 바: 베이스 + 카테고리
  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'base', label: '공주', emoji: '👗' },
    ...ROYAL_CATEGORIES,
  ]
  const tabBar = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 380 }}>
      {tabs.map((t) => {
        const on = tab === t.key
        return (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: '1 0 auto', minWidth: 56, padding: '8px 6px', borderRadius: 'var(--radius-md)',
              border: on ? '2px solid var(--c-pink)' : '2px solid transparent',
              background: on ? '#ffe4f1' : 'var(--c-card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer',
              fontFamily: 'var(--font-warm)', fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>
            <div style={{ fontSize: 20 }}>{t.emoji}</div>{t.label}
          </button>
        )
      })}
    </div>
  )

  // 타일 공통 렌더(베이스/악세서리)
  function tile(id: string, name: string, file: string, cost: number, selected: boolean, onTap: () => void, contain = false) {
    const have = unlocked.has(id)
    const affordable = progress.stars >= cost
    return (
      <button key={id} onClick={onTap}
        style={{ position: 'relative', border: selected ? '3px solid var(--c-pink)' : '2px solid #f0e2d0',
          borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#fff', padding: 0,
          cursor: 'pointer', boxShadow: 'var(--shadow-card)', opacity: have || affordable ? 1 : 0.6 }}>
        <div style={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf3ea' }}>
          <img src={file} alt={name} aria-hidden={!have}
            style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', padding: contain ? 6 : 0,
              filter: have ? 'none' : 'grayscale(0.6) brightness(0.92)' }} />
        </div>
        <div style={{ padding: '4px 3px', fontSize: 12, fontWeight: 800,
          color: have ? 'var(--c-ink)' : 'var(--c-ink-soft)', textAlign: 'center' }}>
          {have ? name : `🔒 ⭐${cost}`}
        </div>
      </button>
    )
  }

  // 활성 탭의 그리드
  let grid
  if (tab === 'base') {
    grid = (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {ROYAL_BASES.map((b) => tile(b.id, b.name, b.file, b.cost, progress.royalBase === b.id, () => tapBase(b.id)))}
      </div>
    )
  } else {
    const items = ROYAL_ITEMS.filter((i) => i.category === tab)
    const equipped = progress.royalOutfit[tab]
    grid = (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {/* 벗기(미착용) 타일 */}
        <button onClick={() => dispatch({ type: 'equipRoyalItem', category: tab, id: null })}
          style={{ border: !equipped ? '3px solid var(--c-pink)' : '2px solid #f0e2d0', borderRadius: 'var(--radius-md)',
            background: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', aspectRatio: '1 / 1', gap: 2 }}>
          <div style={{ fontSize: 26 }}>🚫</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-ink-soft)' }}>안 함</div>
        </button>
        {items.map((it) => tile(it.id, it.name, it.file, it.cost, equipped === it.id, () => tapItem(it), true))}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 25, marginTop: 4 }}>✨ 진짜 공주</h1>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#fff0b8,#ffd24d)',
        color: '#7a5a10', fontWeight: 800, fontSize: 18, padding: '6px 14px', borderRadius: 999, boxShadow: 'var(--shadow-card)' }}>⭐ {progress.stars}</div>

      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: landscape ? 'flex-start' : 'center',
        justifyContent: 'center', gap: landscape ? 28 : 12, width: '100%', maxWidth: landscape ? 760 : 360, marginTop: 4 }}>
        {preview}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
          {tabBar}
          {grid}
        </div>
      </div>
    </div>
  )
}
