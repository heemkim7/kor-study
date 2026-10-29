import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { STICKERS } from '../reward/stickers'
import { PETS } from '../reward/pets'
import { CandyTile } from '../ui/CandyTile'
import { Icon } from '../ui/Icon'
import { Kong } from '../ui/Kong'

const Ico = ({ n }: { n: string }) => (
  <img src={`/img/icons/${n}.webp`} alt="" aria-hidden draggable={false} style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
)

/** 내 방 — 모은 보상과 꾸미기·창작 놀이를 한곳에 모은 화면(홈을 단순하게 유지하려고 분리) */
export function Room() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()

  const royalThumb = <img src="/img/royal/looks/rose.webp" alt="" aria-hidden
    style={{ height: '100%', aspectRatio: '1', borderRadius: 14, objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 3px 6px rgba(60,40,20,.25)' }} />

  // 놀이방 — 보상/창작(반응형 auto-fit 그리드: 폭에 따라 칸 수 자동)
  const playBlockInner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 12 }}>
        <CandyTile icon={<Ico n="dressup" />} label="공주 꾸미기" sub={`⭐${progress.stars}`} a="#ffeaf4" b="#fbc4dc" lip="var(--lip-pink)" color="#c24a86" onClick={() => go({ name: 'dressup' })} />
        <CandyTile icon={royalThumb} label="진짜 공주" sub="모으기" a="#f4eaff" b="#dcc6fb" lip="var(--lip-purple)" color="#7d4fd6" onClick={() => go({ name: 'royal' })} />
        <CandyTile icon={<Ico n="family" />} label="우리 가족" sub="읽기" a="#fff3dd" b="#fbd9a0" lip="var(--lip-orange)" color="#b8691a" onClick={() => go({ name: 'family' })} />
        <CandyTile icon={<Ico n="sticker" />} label="스티커 책" sub={`${progress.collectedStickers.length}/${STICKERS.length}`} a="#fff6d9" b="#fbe08a" lip="var(--lip-yellow)" color="#a87408" onClick={() => go({ name: 'stickers' })} />
        <CandyTile icon={<Ico n="draw" />} label="그림 그리기" sub="색칠" a="#e4f6ff" b="#b6e2f7" lip="var(--lip-sky)" color="#2a82ad" onClick={() => go({ name: 'draw' })} />
        <CandyTile icon={<Ico n="wordbook" />} label="낱말 도감" sub="단어" a="#fff0e2" b="#f9d2ae" lip="var(--lip-orange)" color="#b56a22" onClick={() => go({ name: 'wordbook' })} />
        <CandyTile icon={<Ico n="badge" />} label="내 뱃지" sub="업적" a="#fff5d8" b="#fadf8c" lip="var(--lip-yellow)" color="#a87408" onClick={() => go({ name: 'badges' })} />
        <CandyTile icon={<Ico n="egg" />} label="알 키우기" sub={`${progress.hatchedPets.length}/${PETS.length}`} a="#ffeaf1" b="#fbc6d7" lip="var(--lip-pink)" color="#c24a6a" onClick={() => go({ name: 'egg' })} />
        <CandyTile icon={<Ico n="garden" />} label="마법 정원" sub="꽃" a="#e8f9ec" b="#bfe8c8" lip="var(--lip-mint)" color="#2f8f50" onClick={() => go({ name: 'garden' })} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="집으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
        <Icon n="home" size={30} />
      </button>
      <Kong pose="wave" size={84} bob />
      <h1 className="kp-title" style={{ fontSize: 32 }}>내 방</h1>
      <div style={{ width: '100%', maxWidth: landscape ? 820 : 430 }}>{playBlockInner}</div>
    </div>
  )
}
