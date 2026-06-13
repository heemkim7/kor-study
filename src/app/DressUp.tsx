import { useEffect, useMemo, useState } from 'react'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { useTts } from '../tts/useTts'
import { PrincessFigure } from '../princess/PrincessFigure'
import { Sparkles } from '../ui/Sparkles'
import {
  CATEGORY_ORDER, CATEGORY_LABEL, itemsByCategory, getItem,
  type ItemCategory, type DressUpItem, type Outfit,
} from '../princess/catalog'
import { gachaPick, unownedItems, GACHA_COST } from '../princess/economy'

export function DressUp() {
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  const { speak } = useTts()
  const [tab, setTab] = useState<ItemCategory>('dress')
  const [reveal, setReveal] = useState<DressUpItem | null>(null)

  // 진입 안내 음성(1회)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('공주님을 예쁘게 꾸며요') }, [])

  const outfit = progress.outfit
  const items = itemsByCategory(tab)
  const remainingToCollect = useMemo(() => unownedItems(progress.ownedItems).length, [progress.ownedItems])
  const canGacha = remainingToCollect > 0 && progress.stars >= GACHA_COST

  function tapItem(item: DressUpItem) {
    const owned = progress.ownedItems.includes(item.id)
    if (owned) {
      dispatch({ type: 'equipItem', itemId: item.id })
      speak(`${item.name}`)
    } else if (progress.stars >= item.cost) {
      dispatch({ type: 'unlockItem', itemId: item.id })
      speak(`${item.name} 짠!`)
    } else {
      speak('별이 조금 더 필요해요')
    }
  }

  function doGacha() {
    if (progress.stars < GACHA_COST) { speak('별이 조금 더 필요해요'); return }
    const pick = gachaPick(progress.ownedItems, Math.random())
    if (!pick) { speak('아이템을 모두 모았어요'); return }
    dispatch({ type: 'unlockItem', itemId: pick, costOverride: GACHA_COST })
    const item = getItem(pick)!
    setTab(item.category)
    setReveal(item)
    speak(`우와! ${item.name}`)
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 14px 28px', gap: 12 }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 420 }}>
        <button onClick={() => go({ name: 'home' })}
          style={{ border: 'none', background: 'var(--c-card)', borderRadius: 999, padding: '8px 14px',
            fontWeight: 800, color: 'var(--c-ink)', boxShadow: 'var(--shadow-card)' }}>
          ← 집으로
        </button>
        <div style={{ fontWeight: 800, color: 'var(--c-accent-strong)', fontSize: 18 }}>⭐ {progress.stars}</div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, margin: '2px 0' }}>공주 꾸미기 👗</h1>

      {/* 공주 미리보기 */}
      <div style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
        padding: 12, display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 320 }}>
        <PrincessFigure outfit={outfit} size={196} animate background />
      </div>

      {/* 뽑기 */}
      <button onClick={doGacha} disabled={!canGacha}
        style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 22px',
          fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: '#fff',
          background: canGacha ? 'linear-gradient(135deg, var(--c-pink), var(--c-accent))' : '#d8c9b6',
          boxShadow: canGacha ? '0 5px 0 #c4578f' : 'none', cursor: canGacha ? 'pointer' : 'default' }}>
        🎁 뽑기 (⭐{GACHA_COST})
        {remainingToCollect === 0 && ' · 다 모았어요!'}
      </button>

      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420 }}>
        {CATEGORY_ORDER.map((cat) => (
          <button key={cat} onClick={() => setTab(cat)}
            style={{ border: 'none', borderRadius: 999, padding: '8px 16px',
              fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800,
              color: tab === cat ? '#fff' : 'var(--c-ink)',
              background: tab === cat ? 'var(--c-accent)' : 'var(--c-card)',
              boxShadow: 'var(--shadow-card)' }}>
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', maxWidth: 420 }}>
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
                boxShadow: equipped ? '0 0 0 2px #fff, var(--shadow-card)' : 'var(--shadow-card)',
                cursor: 'pointer' }}>
              <div style={{ width: 64, height: 101, overflow: 'hidden', borderRadius: 10,
                background: 'linear-gradient(170deg,#fff6fb,#ffeaf4)' }}>
                <PrincessFigure outfit={previewOutfit} size={64} background={tab === 'background'} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', lineHeight: 1.15 }}>
                {item.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800,
                color: equipped ? 'var(--c-correct)' : owned ? 'var(--c-ink-soft)' : affordable ? 'var(--c-accent-strong)' : 'var(--c-ink-soft)' }}>
                {equipped ? '입는 중 ✓' : owned ? '입기' : affordable ? `⭐ ${item.cost}` : `🔒 ⭐ ${item.cost}`}
              </div>
            </button>
          )
        })}
      </div>

      {/* 뽑기 결과 오버레이 */}
      {reveal && (
        <div onClick={() => setReveal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.45)', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ position: 'relative', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
            padding: '22px 24px', textAlign: 'center', maxWidth: 300, boxShadow: 'var(--shadow-card)' }}>
            <Sparkles />
            <div style={{ width: 120, height: 190, margin: '0 auto' }}>
              <PrincessFigure outfit={{ ...outfit, [reveal.category]: reveal.id }} size={120} background />
            </div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, marginTop: 8 }}>
              {reveal.name} 획득! 🎉
            </div>
            <button onClick={() => setReveal(null)}
              style={{ marginTop: 14, border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 26px',
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
