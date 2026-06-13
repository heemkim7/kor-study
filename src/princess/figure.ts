// 공주 피규어 SVG 렌더러 — 승인된 v3 베이스 + 갈아입을 수 있는 레이어.
// 순수 함수가 SVG 문자열을 만든다. 브라우저(인라인 SVG)와 Node 검증 스크립트가 공유.
import type { Outfit, HairId, DressId, CrownId } from './catalog'

// 잘못된 입력 방어용 기본값(렌더러 자체 폴백). 카탈로그 DEFAULT_OUTFIT과 같게 유지.
const FALLBACK_OUTFIT: Outfit = { hair: 'hair-blonde', dress: 'dress-pink', crown: 'crown-gold', accessory: 'acc-none' }

const G = { W: 380, H: 600, FCX: 190, FCY: 116, FRX: 44, FRY: 52, SHY: 184, WY: 250, HEMY: 574 }

// ---- 그리기 프리미티브 ----
const c = (x: number, y: number, r: number, f: string, e = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`
const ell = (x: number, y: number, rx: number, ry: number, f: string, e = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${e}/>`
const pth = (d: string, f: string, e = '') => `<path d="${d}" fill="${f}" ${e}/>`
const ln = (x1: number, y1: number, x2: number, y2: number, w: number, s: string) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" stroke-linecap="round"/>`
const stroke = (d: string, s: string, w: number, e = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${e}/>`

const STAR_PTS: [number, number][] = [
  [0, -1], [0.294, -0.405], [0.951, -0.309], [0.476, 0.155], [0.588, 0.809],
  [0, 0.5], [-0.588, 0.809], [-0.476, 0.155], [-0.951, -0.309], [-0.294, -0.405],
]
const star = (cx: number, cy: number, r: number, f: string, e = '') =>
  pth('M ' + STAR_PTS.map(([x, y], i) => `${i ? 'L' : ''} ${(cx + x * r).toFixed(1)} ${(cy + y * r).toFixed(1)}`).join(' ') + ' Z', f, e)
const heart = (cx: number, cy: number, s: number, f: string, e = '') =>
  pth(`M ${cx} ${cy + s * 0.9} C ${cx - s * 1.2} ${cy - s * 0.2} ${cx - s * 0.5} ${cy - s} ${cx} ${cy - s * 0.3} C ${cx + s * 0.5} ${cy - s} ${cx + s * 1.2} ${cy - s * 0.2} ${cx} ${cy + s * 0.9} Z`, f, e)

// ---- 색 팔레트 ----
const SKIN = '#ffe1c6', SKIN_SH = '#f3c6a2'
const TRIM = '#ffffff', GOLD = '#ffcf4d', GOLD_SH = '#e7a92a', GEM = '#7ec9f0', GEM_PINK = '#ff86c0'
const EYE = '#5b3b2a', WHITE = '#ffffff', CHEEK = '#f6a0bc', LIPS = '#e87a9a'

interface HairPal { base: string; sh: string; hi: string }
const HAIR: Record<HairId, HairPal> = {
  'hair-blonde': { base: '#ffd24d', sh: '#eeb52c', hi: '#ffe89a' },
  'hair-brown': { base: '#9c6b43', sh: '#7a5230', hi: '#c79a6e' },
  'hair-pink': { base: '#ff9ecb', sh: '#f06aa6', hi: '#ffc9e3' },
  'hair-black': { base: '#4a4a55', sh: '#33333b', hi: '#7b7b8a' },
  'hair-blue': { base: '#8fb8ef', sh: '#6f97d0', hi: '#bcd6f7' },
}

interface DressPal { main: string; sh: string; hi: string; under: string }
const DRESS: Record<DressId, DressPal> = {
  'dress-pink': { main: '#f2a6d0', sh: '#dd83ba', hi: '#ffd2ee', under: '#fff0f8' },
  'dress-blue': { main: '#9fc4ef', sh: '#6f9fd8', hi: '#d6e8ff', under: '#f0f6ff' },
  'dress-purple': { main: '#c3a6e8', sh: '#9d7fce', hi: '#e6d6ff', under: '#f6f0ff' },
  'dress-mint': { main: '#9fe0c4', sh: '#6fc4a0', hi: '#d2ffee', under: '#f0fff8' },
  'dress-peach': { main: '#ffc6a0', sh: '#f0a06f', hi: '#ffe6d2', under: '#fff4ec' },
  'dress-red': { main: '#f08a8a', sh: '#d86a6a', hi: '#ffd2d2', under: '#fff0f0' },
}

const { FCX, FCY, FRX, FRY, SHY, WY, HEMY, W, H } = G

// ---- 레이어 ----
function background(idPrefix: string): string {
  const p: string[] = []
  p.push(`<defs><radialGradient id="${idPrefix}-bg" cx="50%" cy="36%" r="72%"><stop offset="0" stop-color="#fff4fa"/><stop offset="1" stop-color="#ffe4f1"/></radialGradient></defs>`)
  p.push(`<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>`)
  for (const [x, y, r] of [[54, 84, 6], [322, 116, 7], [40, 300, 5], [338, 330, 6], [58, 470, 5], [330, 500, 5]]) {
    p.push(pth(`M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z`, '#ffcfe9'))
  }
  return p.join('')
}

function wings(): string {
  const cy = SHY + 36
  const wing = (sgn: number) => {
    const bx = FCX + sgn * 18
    return (
      pth(`M ${bx} ${cy} C ${bx + sgn * 70} ${cy - 60} ${bx + sgn * 96} ${cy - 6} ${bx + sgn * 70} ${cy + 40}
        C ${bx + sgn * 56} ${cy + 70} ${bx + sgn * 26} ${cy + 64} ${bx} ${cy + 30} Z`, '#eaf3ff', 'opacity="0.78"') +
      pth(`M ${bx} ${cy + 26} C ${bx + sgn * 44} ${cy + 64} ${bx + sgn * 66} ${cy + 96} ${bx + sgn * 50} ${cy + 116}
        C ${bx + sgn * 34} ${cy + 128} ${bx + sgn * 14} ${cy + 96} ${bx} ${cy + 60} Z`, '#dcebff', 'opacity="0.78"') +
      stroke(`M ${bx} ${cy + 4} C ${bx + sgn * 58} ${cy - 40} ${bx + sgn * 80} ${cy} ${bx + sgn * 60} ${cy + 36}`, '#c4ddff', 2.4, 'opacity="0.7"')
    )
  }
  return wing(-1) + wing(1)
}

function backHair(h: HairPal): string {
  return (
    pth(`M ${FCX - FRX} ${FCY - 2} C ${FCX - FRX - 26} ${FCY + 60} ${FCX - 66} ${FCY + 120} ${FCX - 56} ${FCY + 168}
      C ${FCX - 52} ${FCY + 192} ${FCX - 34} ${FCY + 190} ${FCX - 30} ${FCY + 166}
      C ${FCX - 26} ${FCY + 186} ${FCX + 26} ${FCY + 186} ${FCX + 30} ${FCY + 166}
      C ${FCX + 34} ${FCY + 190} ${FCX + 52} ${FCY + 192} ${FCX + 56} ${FCY + 168}
      C ${FCX + 66} ${FCY + 120} ${FCX + FRX + 26} ${FCY + 60} ${FCX + FRX} ${FCY - 2} Z`, h.base) +
    stroke(`M ${FCX - FRX - 6} ${FCY + 52} C ${FCX - 58} ${FCY + 110} ${FCX - 50} ${FCY + 150} ${FCX - 44} ${FCY + 168}`, h.hi, 4, 'opacity="0.5"') +
    stroke(`M ${FCX + FRX + 6} ${FCY + 52} C ${FCX + 58} ${FCY + 110} ${FCX + 50} ${FCY + 150} ${FCX + 44} ${FCY + 168}`, h.hi, 4, 'opacity="0.5"')
  )
}

function dressLayer(d: DressPal): string {
  const p: string[] = []
  // 속치마
  p.push(pth(`M ${FCX - 30} ${WY} L ${FCX + 30} ${WY} L ${FCX + 150} ${HEMY} Q ${FCX} ${HEMY + 22} ${FCX - 150} ${HEMY} Z`, d.under))
  // 신발 살짝
  p.push(ell(FCX - 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX + 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX - 16, HEMY + 4, 10, 5, TRIM))
  p.push(ell(FCX + 16, HEMY + 4, 10, 5, TRIM))
  // 메인 치마
  p.push(pth(`M ${FCX - 28} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX} ${HEMY + 14} ${FCX - 122} ${HEMY - 2} Z`, d.main))
  p.push(pth(`M ${FCX + 6} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX + 72} ${HEMY + 2} ${FCX + 42} ${HEMY - 2} Z`, d.sh, 'opacity="0.5"'))
  p.push(stroke(`M ${FCX - 14} ${WY + 8} Q ${FCX - 54} ${HEMY - 90} ${FCX - 74} ${HEMY - 6}`, d.hi, 6, 'opacity="0.7"'))
  p.push(stroke(`M ${FCX + 22} ${WY + 16} Q ${FCX + 16} ${HEMY - 80} ${FCX + 6} ${HEMY - 4}`, d.sh, 4, 'opacity="0.4"'))
  p.push(pth(`M ${FCX - 122} ${HEMY - 2} Q ${FCX} ${HEMY + 14} ${FCX + 122} ${HEMY - 2} L ${FCX + 117} ${HEMY + 8} Q ${FCX} ${HEMY + 24} ${FCX - 117} ${HEMY + 8} Z`, TRIM))
  return p.join('')
}

function arms(): string {
  return (
    ln(FCX - 36, SHY + 6, FCX - 44, WY - 8, 12, SKIN) +
    ln(FCX + 36, SHY + 6, FCX + 44, WY - 8, 12, SKIN) +
    c(FCX - 45, WY - 4, 8, SKIN) +
    c(FCX + 45, WY - 4, 8, SKIN)
  )
}

function bodice(d: DressPal): string {
  const p: string[] = []
  p.push(pth(`M ${FCX - 36} ${SHY} Q ${FCX} ${SHY + 6} ${FCX + 36} ${SHY} L ${FCX + 28} ${WY} Q ${FCX} ${WY + 10} ${FCX - 28} ${WY} Z`, d.sh))
  p.push(pth(`M ${FCX - 30} ${SHY + 2} Q ${FCX - 14} ${SHY + 20} ${FCX} ${SHY + 16} Q ${FCX + 14} ${SHY + 20} ${FCX + 30} ${SHY + 2} L ${FCX + 24} ${WY - 4} Q ${FCX} ${WY + 4} ${FCX - 24} ${WY - 4} Z`, d.main))
  // 퍼프 소매
  p.push(ell(FCX - 40, SHY + 6, 18, 14, d.main))
  p.push(ell(FCX + 40, SHY + 6, 18, 14, d.main))
  p.push(ell(FCX - 40, SHY + 2, 8, 4, d.hi, 'opacity="0.7"'))
  p.push(ell(FCX + 40, SHY + 2, 8, 4, d.hi, 'opacity="0.7"'))
  // 허리 리본
  p.push(ell(FCX, WY - 1, 13, 7, d.hi))
  p.push(pth(`M ${FCX - 13} ${WY - 1} l -18 -10 l 0 20 Z`, TRIM))
  p.push(pth(`M ${FCX + 13} ${WY - 1} l 18 -10 l 0 20 Z`, TRIM))
  return p.join('')
}

function neck(): string {
  return (
    `<rect x="${FCX - 9}" y="${FCY + FRY - 14}" width="18" height="24" rx="8" fill="${SKIN}"/>` +
    ell(FCX, FCY + FRY + 4, 12, 5, SKIN_SH, 'opacity="0.45"') +
    stroke(`M ${FCX - 18} ${SHY - 4} Q ${FCX} ${SHY + 8} ${FCX + 18} ${SHY - 4}`, GOLD, 2.2) +
    c(FCX, SHY + 5, 3.5, GEM_PINK)
  )
}

function necklacePendant(): string {
  // 기본 목걸이 위에 보석 펜던트 추가
  return (
    stroke(`M ${FCX - 20} ${SHY - 2} Q ${FCX} ${SHY + 14} ${FCX + 20} ${SHY - 2}`, GOLD, 2.4) +
    `<g transform="translate(${FCX} ${SHY + 16})">` +
    pth(`M -7 -6 L 7 -6 L 9 -2 L 0 10 L -9 -2 Z`, GEM) +
    pth(`M -7 -6 L 7 -6 L 4 -2 L -4 -2 Z`, '#bfe6f7') +
    pth(`M -4 -2 L 4 -2 L 0 10 Z`, '#5fb8e0') +
    `</g>`
  )
}

function face(): string {
  const p: string[] = []
  p.push(pth(`M ${FCX} ${FCY - FRY}
    C ${FCX - FRX * 1.04} ${FCY - FRY * 0.86} ${FCX - FRX} ${FCY + FRY * 0.28} ${FCX - FRX * 0.66} ${FCY + FRY * 0.74}
    Q ${FCX} ${FCY + FRY * 1.04} ${FCX + FRX * 0.66} ${FCY + FRY * 0.74}
    C ${FCX + FRX} ${FCY + FRY * 0.28} ${FCX + FRX * 1.04} ${FCY - FRY * 0.86} ${FCX} ${FCY - FRY} Z`, SKIN))
  p.push(ell(FCX - FRX * 0.34, FCY - FRY * 0.34, FRX * 0.3, FRY * 0.18, WHITE, 'opacity="0.3"'))
  // 눈
  for (const sgn of [-1, 1]) {
    const ex = FCX + sgn * FRX * 0.44, ey = FCY + FRY * 0.18
    p.push(ell(ex, ey, FRX * 0.18, FRY * 0.2, WHITE))
    p.push(c(ex, ey + FRY * 0.03, FRX * 0.15, EYE))
    p.push(c(ex - FRX * 0.05, ey - FRY * 0.05, FRX * 0.06, WHITE))
    p.push(c(ex + FRX * 0.06, ey + FRY * 0.07, FRX * 0.03, WHITE, 'opacity="0.85"'))
    p.push(stroke(`M ${ex - FRX * 0.2} ${ey - FRY * 0.16} Q ${ex} ${ey - FRY * 0.26} ${ex + FRX * 0.2} ${ey - FRY * 0.16}`, EYE, 3))
    p.push(ln(ex + sgn * FRX * 0.22, ey - FRY * 0.12, ex + sgn * FRX * 0.34, ey - FRY * 0.2, 2.4, EYE))
  }
  // 볼·코·입
  p.push(c(FCX - FRX * 0.5, FCY + FRY * 0.46, FRX * 0.13, CHEEK, 'opacity="0.6"'))
  p.push(c(FCX + FRX * 0.5, FCY + FRY * 0.46, FRX * 0.13, CHEEK, 'opacity="0.6"'))
  p.push(c(FCX, FCY + FRY * 0.36, 2, SKIN_SH))
  p.push(pth(`M ${FCX - 7} ${FCY + FRY * 0.56} Q ${FCX} ${FCY + FRY * 0.7} ${FCX + 7} ${FCY + FRY * 0.56} Q ${FCX} ${FCY + FRY * 0.61} ${FCX - 7} ${FCY + FRY * 0.56} Z`, LIPS))
  return p.join('')
}

function eyebrows(h: HairPal): string {
  return (
    stroke(`M ${FCX - FRX * 0.56} ${FCY - FRY * 0.14} Q ${FCX - FRX * 0.4} ${FCY - FRY * 0.24} ${FCX - FRX * 0.24} ${FCY - FRY * 0.14}`, h.sh, 2.6) +
    stroke(`M ${FCX + FRX * 0.24} ${FCY - FRY * 0.14} Q ${FCX + FRX * 0.4} ${FCY - FRY * 0.24} ${FCX + FRX * 0.56} ${FCY - FRY * 0.14}`, h.sh, 2.6)
  )
}

function frontHair(h: HairPal): string {
  return (
    pth(`M ${FCX - FRX - 2} ${FCY + 4} C ${FCX - FRX - 4} ${FCY - 48} ${FCX - 24} ${FCY - FRY - 10} ${FCX} ${FCY - FRY - 8}
      C ${FCX + 24} ${FCY - FRY - 10} ${FCX + FRX + 4} ${FCY - 48} ${FCX + FRX + 2} ${FCY + 4}
      C ${FCX + FRX - 4} ${FCY - 32} ${FCX + 30} ${FCY - FRY + 4} ${FCX + 4} ${FCY - FRY + 16}
      C ${FCX} ${FCY - FRY + 7} ${FCX} ${FCY - FRY + 7} ${FCX - 4} ${FCY - FRY + 16}
      C ${FCX - 30} ${FCY - FRY + 4} ${FCX - FRX + 4} ${FCY - 32} ${FCX - FRX - 2} ${FCY + 4} Z`, h.base) +
    stroke(`M ${FCX - 3} ${FCY - FRY + 16} C ${FCX - 20} ${FCY - FRY + 24} ${FCX - 34} ${FCY - FRY + 16} ${FCX - FRX + 6} ${FCY - 24}`, h.hi, 4, 'opacity="0.6"') +
    pth(`M ${FCX - FRX + 2} ${FCY + 2} C ${FCX - FRX - 12} ${FCY + 40} ${FCX - FRX - 4} ${FCY + 74} ${FCX - FRX + 10} ${FCY + 86} C ${FCX - FRX + 4} ${FCY + 56} ${FCX - FRX + 4} ${FCY + 28} ${FCX - FRX + 12} ${FCY + 6} Z`, h.base) +
    pth(`M ${FCX + FRX - 2} ${FCY + 2} C ${FCX + FRX + 12} ${FCY + 40} ${FCX + FRX + 4} ${FCY + 74} ${FCX + FRX - 10} ${FCY + 86} C ${FCX + FRX - 4} ${FCY + 56} ${FCX + FRX - 4} ${FCY + 28} ${FCX + FRX - 12} ${FCY + 6} Z`, h.base)
  )
}

function crown(id: CrownId): string {
  const ty = FCY - FRY + 2
  if (id === 'crown-gold') {
    return (
      pth(`M ${FCX - 36} ${ty + 10} L ${FCX - 20} ${ty - 6} L ${FCX - 11} ${ty + 4} L ${FCX} ${ty - 16} L ${FCX + 11} ${ty + 4} L ${FCX + 20} ${ty - 6} L ${FCX + 36} ${ty + 10} Z`, GOLD) +
      pth(`M ${FCX - 36} ${ty + 10} L ${FCX + 36} ${ty + 10} L ${FCX + 31} ${ty + 16} L ${FCX - 31} ${ty + 16} Z`, GOLD_SH) +
      c(FCX, ty - 10, 4.5, GEM_PINK) + c(FCX - 20, ty - 6, 3, GEM) + c(FCX + 20, ty - 6, 3, GEM)
    )
  }
  if (id === 'crown-flower') {
    const flower = (fx: number, fy: number, s: number, petal: string) => {
      let out = ''
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        out += ell(fx + Math.cos(a) * s, fy + Math.sin(a) * s, s * 0.7, s * 0.7, petal)
      }
      return out + c(fx, fy, s * 0.62, '#ffe08a')
    }
    const spots: [number, number, number, string][] = [
      [FCX - 34, ty + 12, 7, '#ff9ecb'], [FCX - 17, ty + 4, 8, '#fff0f6'],
      [FCX, ty, 8.5, '#ff86c0'], [FCX + 17, ty + 4, 8, '#fff0f6'], [FCX + 34, ty + 12, 7, '#ff9ecb'],
    ]
    return stroke(`M ${FCX - 38} ${ty + 14} Q ${FCX} ${ty - 6} ${FCX + 38} ${ty + 14}`, '#7ec98a', 4) +
      spots.map(([x, y, s, col]) => flower(x, y, s, col)).join('')
  }
  if (id === 'crown-star') {
    return (
      pth(`M ${FCX - 36} ${ty + 12} Q ${FCX} ${ty - 4} ${FCX + 36} ${ty + 12} L ${FCX + 31} ${ty + 18} Q ${FCX} ${ty + 4} ${FCX - 31} ${ty + 18} Z`, GOLD) +
      star(FCX, ty - 10, 11, GOLD, `stroke="${GOLD_SH}" stroke-width="1.5"`) +
      star(FCX - 24, ty + 2, 7, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
      star(FCX + 24, ty + 2, 7, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
      c(FCX, ty - 10, 2.4, '#fff6c8')
    )
  }
  // crown-heart
  return (
    pth(`M ${FCX - 36} ${ty + 12} Q ${FCX} ${ty - 4} ${FCX + 36} ${ty + 12} L ${FCX + 31} ${ty + 18} Q ${FCX} ${ty + 4} ${FCX - 31} ${ty + 18} Z`, GOLD) +
    heart(FCX, ty - 12, 11, GEM_PINK) +
    heart(FCX - 25, ty + 1, 6, '#ffb3da') +
    heart(FCX + 25, ty + 1, 6, '#ffb3da')
  )
}

function wand(): string {
  // 오른손(FCX+45, WY-4)에서 위로 뻗은 요술봉
  const hx = FCX + 45, hy = WY - 4
  const tx = hx + 16, ty = hy - 84
  return (
    ln(hx, hy, tx, ty, 5, '#f3d9a0') +
    star(tx, ty, 15, GOLD, `stroke="${GOLD_SH}" stroke-width="2"`) +
    star(tx, ty, 7, '#fff6c8') +
    c(tx - 22, ty + 6, 2.4, '#fff6c8', 'opacity="0.9"') +
    c(tx + 18, ty + 16, 2, '#fff6c8', 'opacity="0.8"') +
    c(tx + 4, ty + 26, 1.6, '#fff6c8', 'opacity="0.7"')
  )
}

const ANIM = `<style>
@keyframes pr-sway{0%,100%{transform:rotate(-1.2deg) translateY(0)}50%{transform:rotate(1.2deg) translateY(-4px)}}
@keyframes pr-twinkle{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.12)}}
.pr-body{transform-origin:190px 360px;transform-box:view-box;animation:pr-sway 4.2s ease-in-out infinite}
.pr-crown{transform-origin:190px 70px;transform-box:view-box;animation:pr-twinkle 2.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.pr-body,.pr-crown{animation:none}}
</style>`

export interface FigureOpts {
  idPrefix?: string
  background?: boolean
  animate?: boolean
}

let _seq = 0

/** outfit으로부터 완성된 공주 SVG 문자열을 만든다. */
export function buildPrincessSvg(outfit: Partial<Outfit> = {}, opts: FigureOpts = {}): string {
  const o: Outfit = { ...FALLBACK_OUTFIT, ...outfit }
  const idPrefix = opts.idPrefix ?? `pr${_seq++}`
  const showBg = opts.background !== false
  const animate = opts.animate === true
  const h = HAIR[o.hair] ?? HAIR['hair-blonde']
  const d = DRESS[o.dress] ?? DRESS['dress-pink']

  const body: string[] = []
  if (o.accessory === 'acc-wings') body.push(wings())
  body.push(backHair(h))
  body.push(dressLayer(d))
  body.push(arms())
  body.push(bodice(d))
  body.push(neck())
  if (o.accessory === 'acc-necklace') body.push(necklacePendant())
  body.push(face())
  body.push(eyebrows(h))
  body.push(frontHair(h))
  if (o.accessory === 'acc-wand') body.push(wand())

  const crownSvg = crown(o.crown)

  const inner = animate
    ? `${ANIM}<g class="pr-body">${body.join('')}</g><g class="pr-crown">${crownSvg}</g>`
    : `<g>${body.join('')}</g>${crownSvg}`

  const bg = showBg ? background(idPrefix) : ''
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">${bg}${inner}</svg>`
}
