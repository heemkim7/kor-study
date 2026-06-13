// 공주 피규어 SVG 렌더러 — 승인된 v3 베이스 + 갈아입을 수 있는 레이어.
// 순수 함수가 SVG 문자열을 만든다. 브라우저(인라인 SVG)와 Node 검증 스크립트가 공유.
import type { Outfit, HairId, DressId, CrownId, BackgroundId } from './catalog'

// 잘못된 입력 방어용 기본값(렌더러 자체 폴백). 카탈로그 DEFAULT_OUTFIT과 같게 유지.
const FALLBACK_OUTFIT: Outfit = {
  hair: 'hair-blonde', dress: 'dress-pink', crown: 'crown-gold', accessory: 'acc-none', background: 'bg-pink',
}

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
const flower = (fx: number, fy: number, s: number, petal: string, center = '#ffe08a') => {
  let out = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    out += ell(fx + Math.cos(a) * s, fy + Math.sin(a) * s, s * 0.7, s * 0.7, petal)
  }
  return out + c(fx, fy, s * 0.62, center)
}

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
  'hair-twin': { base: '#ff9ecb', sh: '#f06aa6', hi: '#ffc9e3' },
  'hair-bun': { base: '#9c6b43', sh: '#7a5230', hi: '#c79a6e' },
  'hair-bob': { base: '#4a4a55', sh: '#33333b', hi: '#7b7b8a' },
}
type HairStyle = 'long' | 'twin' | 'bun' | 'bob'
const HAIR_STYLE: Record<HairId, HairStyle> = {
  'hair-blonde': 'long', 'hair-brown': 'long', 'hair-pink': 'long', 'hair-black': 'long', 'hair-blue': 'long',
  'hair-twin': 'twin', 'hair-bun': 'bun', 'hair-bob': 'bob',
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

// ---- 배경 ----
function background(id: BackgroundId, idPrefix: string): string {
  const sparkles = (col: string) =>
    [[54, 84, 6], [322, 116, 7], [40, 300, 5], [338, 330, 6], [58, 470, 5], [330, 500, 5]]
      .map(([x, y, r]) => pth(`M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z`, col)).join('')

  if (id === 'bg-garden') {
    return `<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1ff"/><stop offset="0.6" stop-color="#eafbf0"/><stop offset="1" stop-color="#d6f3df"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>` +
      c(316, 86, 30, '#fff3b0') + c(316, 86, 30, '#ffe98a', 'opacity="0.5"') +
      ell(70, 120, 34, 16, '#ffffff', 'opacity="0.8"') + ell(110, 128, 26, 13, '#ffffff', 'opacity="0.8"') +
      pth(`M 0 ${H - 80} Q ${W / 2} ${H - 120} ${W} ${H - 80} L ${W} ${H} L 0 ${H} Z`, '#bfe9c8') +
      [[40, H - 70], [120, H - 56], [300, H - 60], [346, H - 78]].map(([x, y], i) => flower(x, y, i % 2 ? 9 : 7, i % 2 ? '#ff9ecb' : '#fff0a8', '#ff86c0')).join('')
  }
  if (id === 'bg-castle') {
    const tower = (x: number, wd: number, top: number) =>
      `<rect x="${x}" y="${top}" width="${wd}" height="${H - top}" fill="#cdbce8"/>` +
      pth(`M ${x - 4} ${top} L ${x + wd / 2} ${top - 26} L ${x + wd + 4} ${top} Z`, '#9d7fce') +
      `<rect x="${x + wd / 2 - 6}" y="${top + 24}" width="12" height="18" rx="4" fill="#6f5aa0"/>`
    return `<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff"/><stop offset="1" stop-color="#f3e8ff"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>` +
      ell(60, 110, 30, 15, '#ffffff', 'opacity="0.85"') + ell(320, 150, 30, 15, '#ffffff', 'opacity="0.85"') +
      tower(40, 60, 150) + tower(280, 60, 150) + `<rect x="96" y="200" width="188" height="${H - 200}" fill="#bda9e0"/>` +
      pth(`M 92 200 L 190 170 L 288 200 Z`, '#9d7fce') +
      `<rect x="170" y="300" width="40" height="${H - 300}" rx="20" fill="#7a64ad"/>` +
      sparkles('#ffffff')
  }
  if (id === 'bg-night') {
    return `<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a5e"/><stop offset="1" stop-color="#5b4a8a"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>` +
      c(312, 92, 28, '#fff3c4') + c(322, 86, 24, '#2a2a5e') +
      [[40, 70, 8], [120, 130, 6], [70, 240, 7], [330, 300, 6], [44, 430, 6], [340, 470, 8], [200, 56, 6]]
        .map(([x, y, r]) => star(x, y, r, '#fff6c8', 'opacity="0.9"')).join('') +
      [[90, 90], [260, 160], [150, 380], [300, 420]].map(([x, y]) => c(x, y, 1.6, '#ffffff', 'opacity="0.8"')).join('')
  }
  if (id === 'bg-rainbow') {
    const arc = (r: number, col: string) =>
      stroke(`M ${190 - r} 250 A ${r} ${r} 0 0 1 ${190 + r} 250`, col, 13)
    return `<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf6ff"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>` +
      [['#ff9aa2', 170], ['#ffd59e', 157], ['#fff3a0', 144], ['#b8e6b8', 131], ['#a8d8ff', 118], ['#c9b6f0', 105]]
        .map(([col, r]) => arc(r as number, col as string)).join('') +
      ell(72, 268, 30, 15, '#ffffff', 'opacity="0.9"') + ell(110, 276, 22, 11, '#ffffff', 'opacity="0.9"') +
      ell(300, 250, 30, 15, '#ffffff', 'opacity="0.9"') + ell(266, 258, 22, 11, '#ffffff', 'opacity="0.9"') +
      sparkles('#ffd0e6')
  }
  // bg-pink (기본)
  return `<defs><radialGradient id="${idPrefix}-bg" cx="50%" cy="36%" r="72%"><stop offset="0" stop-color="#fff4fa"/><stop offset="1" stop-color="#ffe4f1"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>` + sparkles('#ffcfe9')
}

// ---- 헤어 ----
function backHair(h: HairPal, style: HairStyle): string {
  if (style === 'long') {
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
  if (style === 'bob') {
    return pth(`M ${FCX - FRX} ${FCY - 6} C ${FCX - FRX - 22} ${FCY + 34} ${FCX - FRX - 18} ${FCY + 78} ${FCX - FRX - 6} ${FCY + 104}
      Q ${FCX} ${FCY + 120} ${FCX + FRX + 6} ${FCY + 104}
      C ${FCX + FRX + 18} ${FCY + 78} ${FCX + FRX + 22} ${FCY + 34} ${FCX + FRX} ${FCY - 6} Z`, h.base)
  }
  // bun / twin 은 짧은 뒤통수 캡 + (twin) 양 갈래
  const cap = pth(`M ${FCX - FRX + 2} ${FCY - 8} C ${FCX - FRX - 8} ${FCY + 22} ${FCX - FRX - 4} ${FCY + 52} ${FCX - FRX + 8} ${FCY + 66}
    Q ${FCX} ${FCY + 74} ${FCX + FRX - 8} ${FCY + 66}
    C ${FCX + FRX + 4} ${FCY + 52} ${FCX + FRX + 8} ${FCY + 22} ${FCX + FRX - 2} ${FCY - 8} Z`, h.base)
  if (style === 'bun') return cap
  // twin: 양 갈래 묶음머리
  const tail = (sgn: number) => {
    const tx = FCX + sgn * (FRX + 2)
    return pth(`M ${tx} ${FCY + 8} C ${tx + sgn * 30} ${FCY + 34} ${tx + sgn * 34} ${FCY + 96} ${tx + sgn * 22} ${FCY + 156}
      C ${tx + sgn * 18} ${FCY + 184} ${tx - sgn * 2} ${FCY + 182} ${tx - sgn * 4} ${FCY + 154}
      C ${tx - sgn * 6} ${FCY + 100} ${tx - sgn * 6} ${FCY + 50} ${tx - sgn * 8} ${FCY + 16} Z`, h.base) +
      stroke(`M ${tx + sgn * 14} ${FCY + 50} C ${tx + sgn * 22} ${FCY + 90} ${tx + sgn * 18} ${FCY + 120} ${tx + sgn * 12} ${FCY + 146}`, h.hi, 3, 'opacity="0.5"')
  }
  return tail(-1) + tail(1) + cap
}

function frontHair(h: HairPal, style: HairStyle): string {
  // 공통 앞머리(가르마)
  const bangs = pth(`M ${FCX - FRX - 2} ${FCY + 4} C ${FCX - FRX - 4} ${FCY - 48} ${FCX - 24} ${FCY - FRY - 10} ${FCX} ${FCY - FRY - 8}
    C ${FCX + 24} ${FCY - FRY - 10} ${FCX + FRX + 4} ${FCY - 48} ${FCX + FRX + 2} ${FCY + 4}
    C ${FCX + FRX - 4} ${FCY - 32} ${FCX + 30} ${FCY - FRY + 4} ${FCX + 4} ${FCY - FRY + 16}
    C ${FCX} ${FCY - FRY + 7} ${FCX} ${FCY - FRY + 7} ${FCX - 4} ${FCY - FRY + 16}
    C ${FCX - 30} ${FCY - FRY + 4} ${FCX - FRX + 4} ${FCY - 32} ${FCX - FRX - 2} ${FCY + 4} Z`, h.base)
  const bangHi = stroke(`M ${FCX - 3} ${FCY - FRY + 16} C ${FCX - 20} ${FCY - FRY + 24} ${FCX - 34} ${FCY - FRY + 16} ${FCX - FRX + 6} ${FCY - 24}`, h.hi, 4, 'opacity="0.6"')

  // 옆 프레임(턱선 따라) — long 만 길게
  const sideLong =
    pth(`M ${FCX - FRX + 2} ${FCY + 2} C ${FCX - FRX - 12} ${FCY + 40} ${FCX - FRX - 4} ${FCY + 74} ${FCX - FRX + 10} ${FCY + 86} C ${FCX - FRX + 4} ${FCY + 56} ${FCX - FRX + 4} ${FCY + 28} ${FCX - FRX + 12} ${FCY + 6} Z`, h.base) +
    pth(`M ${FCX + FRX - 2} ${FCY + 2} C ${FCX + FRX + 12} ${FCY + 40} ${FCX + FRX + 4} ${FCY + 74} ${FCX + FRX - 10} ${FCY + 86} C ${FCX + FRX - 4} ${FCY + 56} ${FCX + FRX - 4} ${FCY + 28} ${FCX + FRX - 12} ${FCY + 6} Z`, h.base)
  // 짧은 옆 프레임(귀 옆)
  const sideShort =
    pth(`M ${FCX - FRX + 2} ${FCY + 2} C ${FCX - FRX - 8} ${FCY + 26} ${FCX - FRX - 4} ${FCY + 46} ${FCX - FRX + 8} ${FCY + 54} C ${FCX - FRX + 4} ${FCY + 36} ${FCX - FRX + 4} ${FCY + 20} ${FCX - FRX + 12} ${FCY + 4} Z`, h.base) +
    pth(`M ${FCX + FRX - 2} ${FCY + 2} C ${FCX + FRX + 8} ${FCY + 26} ${FCX + FRX + 4} ${FCY + 46} ${FCX + FRX - 8} ${FCY + 54} C ${FCX + FRX - 4} ${FCY + 36} ${FCX + FRX - 4} ${FCY + 20} ${FCX + FRX - 12} ${FCY + 4} Z`, h.base)

  if (style === 'long') return bangs + bangHi + sideLong
  if (style === 'bob') {
    // 단발: 턱 길이로 곧게 내려와 안쪽으로 살짝 말림
    const bobSide =
      pth(`M ${FCX - FRX + 2} ${FCY} C ${FCX - FRX - 10} ${FCY + 40} ${FCX - FRX - 6} ${FCY + 76} ${FCX - FRX + 12} ${FCY + 92} C ${FCX - FRX + 16} ${FCY + 74} ${FCX - FRX + 6} ${FCY + 40} ${FCX - FRX + 12} ${FCY + 4} Z`, h.base) +
      pth(`M ${FCX + FRX - 2} ${FCY} C ${FCX + FRX + 10} ${FCY + 40} ${FCX + FRX + 6} ${FCY + 76} ${FCX + FRX - 12} ${FCY + 92} C ${FCX + FRX - 16} ${FCY + 74} ${FCX + FRX - 6} ${FCY + 40} ${FCX + FRX - 12} ${FCY + 4} Z`, h.base)
    return bangs + bangHi + bobSide
  }
  if (style === 'bun') {
    // 올림머리: 정수리 위 번 + 작은 묶음 + 짧은 옆머리
    const top = FCY - FRY - 6
    const bun = c(FCX, top - 2, 17, h.base) + c(FCX - 6, top - 6, 6, h.hi, 'opacity="0.5"') +
      ell(FCX, top + 14, 12, 7, h.sh) // 묶은 밑동
    return bun + bangs + bangHi + sideShort
  }
  // twin: 앞머리 + 짧은 옆 + 묶음 리본(양옆)
  const ribbon = (sgn: number) => {
    const rx = FCX + sgn * (FRX + 2), ry = FCY + 10
    return ell(rx, ry, 6, 5, h.sh) +
      pth(`M ${rx} ${ry} l ${sgn * -12} -7 l 0 14 Z`, '#ff86c0') +
      pth(`M ${rx} ${ry} l ${sgn * 12} -7 l 0 14 Z`, '#ff86c0') + c(rx, ry, 3, '#ffd2ee')
  }
  return bangs + bangHi + sideShort + ribbon(-1) + ribbon(1)
}

// ---- 몸/옷 ----
function dressLayer(d: DressPal): string {
  const p: string[] = []
  p.push(pth(`M ${FCX - 30} ${WY} L ${FCX + 30} ${WY} L ${FCX + 150} ${HEMY} Q ${FCX} ${HEMY + 22} ${FCX - 150} ${HEMY} Z`, d.under))
  p.push(ell(FCX - 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX + 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX - 16, HEMY + 4, 10, 5, TRIM))
  p.push(ell(FCX + 16, HEMY + 4, 10, 5, TRIM))
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
  p.push(ell(FCX - 40, SHY + 6, 18, 14, d.main))
  p.push(ell(FCX + 40, SHY + 6, 18, 14, d.main))
  p.push(ell(FCX - 40, SHY + 2, 8, 4, d.hi, 'opacity="0.7"'))
  p.push(ell(FCX + 40, SHY + 2, 8, 4, d.hi, 'opacity="0.7"'))
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
  for (const sgn of [-1, 1]) {
    const ex = FCX + sgn * FRX * 0.44, ey = FCY + FRY * 0.18
    p.push(ell(ex, ey, FRX * 0.18, FRY * 0.2, WHITE))
    p.push(c(ex, ey + FRY * 0.03, FRX * 0.15, EYE))
    p.push(c(ex - FRX * 0.05, ey - FRY * 0.05, FRX * 0.06, WHITE))
    p.push(c(ex + FRX * 0.06, ey + FRY * 0.07, FRX * 0.03, WHITE, 'opacity="0.85"'))
    p.push(stroke(`M ${ex - FRX * 0.2} ${ey - FRY * 0.16} Q ${ex} ${ey - FRY * 0.26} ${ex + FRX * 0.2} ${ey - FRY * 0.16}`, EYE, 3))
    p.push(ln(ex + sgn * FRX * 0.22, ey - FRY * 0.12, ex + sgn * FRX * 0.34, ey - FRY * 0.2, 2.4, EYE))
  }
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

function glasses(): string {
  const ey = FCY + FRY * 0.18
  const lx = FCX - FRX * 0.44, rx = FCX + FRX * 0.44, r = 12
  return (
    c(lx, ey, r, 'none', `stroke="#5b4632" stroke-width="2.6"`) +
    c(rx, ey, r, 'none', `stroke="#5b4632" stroke-width="2.6"`) +
    ln(lx + r, ey, rx - r, ey, 2.6, '#5b4632') +
    ln(lx - r, ey - 1, FCX - FRX, ey - 3, 2.4, '#5b4632') +
    ln(rx + r, ey - 1, FCX + FRX, ey - 3, 2.4, '#5b4632') +
    c(lx - 3, ey - 3, 3, WHITE, 'opacity="0.6"') + c(rx - 3, ey - 3, 3, WHITE, 'opacity="0.6"')
  )
}

function crown(id: CrownId): string {
  if (id === 'crown-none') return ''
  const ty = FCY - FRY + 2
  if (id === 'crown-gold') {
    return (
      pth(`M ${FCX - 36} ${ty + 10} L ${FCX - 20} ${ty - 6} L ${FCX - 11} ${ty + 4} L ${FCX} ${ty - 16} L ${FCX + 11} ${ty + 4} L ${FCX + 20} ${ty - 6} L ${FCX + 36} ${ty + 10} Z`, GOLD) +
      pth(`M ${FCX - 36} ${ty + 10} L ${FCX + 36} ${ty + 10} L ${FCX + 31} ${ty + 16} L ${FCX - 31} ${ty + 16} Z`, GOLD_SH) +
      c(FCX, ty - 10, 4.5, GEM_PINK) + c(FCX - 20, ty - 6, 3, GEM) + c(FCX + 20, ty - 6, 3, GEM)
    )
  }
  if (id === 'crown-flower') {
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
      star(FCX, ty - 11, 12, GOLD, `stroke="${GOLD_SH}" stroke-width="1.5"`) +
      star(FCX - 25, ty + 1, 7.5, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
      star(FCX + 25, ty + 1, 7.5, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
      star(FCX, ty - 11, 5, '#fff6c8')
    )
  }
  // crown-heart
  return (
    pth(`M ${FCX - 36} ${ty + 12} Q ${FCX} ${ty - 4} ${FCX + 36} ${ty + 12} L ${FCX + 31} ${ty + 18} Q ${FCX} ${ty + 4} ${FCX - 31} ${ty + 18} Z`, GOLD) +
    heart(FCX, ty - 13, 12, GEM_PINK) +
    heart(FCX - 26, ty + 1, 7, '#ffb3da') +
    heart(FCX + 26, ty + 1, 7, '#ffb3da')
  )
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

function wand(): string {
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

function parasol(): string {
  // 오른손에서 위로 비스듬히 든 레이스 양산
  const hx = FCX + 45, hy = WY - 4
  const cx = hx + 52, cy = 150
  return (
    ln(hx, hy, cx, cy, 4, '#caa9d8') +
    pth(`M ${cx - 56} ${cy} A 56 56 0 0 1 ${cx + 56} ${cy} Z`, '#f4b8da') +
    pth(`M ${cx - 56} ${cy} A 56 56 0 0 1 ${cx + 56} ${cy}`, '#ffffff', 'opacity="0"') +
    stroke(`M ${cx} ${cy - 56} L ${cx} ${cy}`, '#dd83ba', 1.6, 'opacity="0.6"') +
    stroke(`M ${cx - 30} ${cy - 47} L ${cx - 16} ${cy}`, '#dd83ba', 1.4, 'opacity="0.5"') +
    stroke(`M ${cx + 30} ${cy - 47} L ${cx + 16} ${cy}`, '#dd83ba', 1.4, 'opacity="0.5"') +
    // 레이스 스캘럽 가장자리
    [-48, -32, -16, 0, 16, 32, 48].map((dx) => c(cx + dx, cy, 8, '#ffd6ec')).join('') +
    pth(`M ${cx - 56} ${cy} A 56 56 0 0 1 ${cx + 56} ${cy} L ${cx + 56} ${cy} L ${cx - 56} ${cy} Z`, 'none', `stroke="#dd83ba" stroke-width="1.5"`) +
    c(cx, cy - 56, 4, GOLD) + c(hx, hy + 60, 0, 'none')
  )
}

function pet(): string {
  // 치마 옆에 앉은 아기 고양이
  const px = 96, py = 556
  return (
    ell(px, py + 14, 26, 7, '#00000010') +
    ell(px, py, 22, 19, '#bdbdc9') +
    pth(`M ${px - 16} ${py - 12} l -3 -16 l 14 6 Z`, '#bdbdc9') +
    pth(`M ${px + 16} ${py - 12} l 3 -16 l -14 6 Z`, '#bdbdc9') +
    pth(`M ${px - 14} ${py - 12} l -2 -10 l 8 4 Z`, '#ffc6d9') +
    pth(`M ${px + 14} ${py - 12} l 2 -10 l -8 4 Z`, '#ffc6d9') +
    c(px - 8, py - 2, 3, '#3a3a44') + c(px + 8, py - 2, 3, '#3a3a44') +
    c(px - 7, py - 3, 1, WHITE) + c(px + 9, py - 3, 1, WHITE) +
    pth(`M ${px - 2} ${py + 4} l 2 3 l 2 -3 Z`, '#ff86c0') +
    stroke(`M ${px} ${py + 7} q -5 4 -10 2`, '#3a3a44', 1) +
    stroke(`M ${px} ${py + 7} q 5 4 10 2`, '#3a3a44', 1) +
    c(px - 13, py + 4, 3, '#ffc6d9', 'opacity="0.6"') + c(px + 13, py + 4, 3, '#ffc6d9', 'opacity="0.6"') +
    pth(`M ${px + 18} ${py + 6} q 18 -2 14 -22 q -2 -6 -7 -3 q 4 16 -10 19 Z`, '#bdbdc9')
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
  const style = HAIR_STYLE[o.hair] ?? 'long'
  const d = DRESS[o.dress] ?? DRESS['dress-pink']

  const body: string[] = []
  if (o.accessory === 'acc-wings') body.push(wings())
  body.push(backHair(h, style))
  body.push(dressLayer(d))
  body.push(arms())
  body.push(bodice(d))
  body.push(neck())
  if (o.accessory === 'acc-necklace') body.push(necklacePendant())
  body.push(face())
  body.push(eyebrows(h))
  if (o.accessory === 'acc-glasses') body.push(glasses())
  body.push(frontHair(h, style))
  if (o.accessory === 'acc-wand') body.push(wand())
  if (o.accessory === 'acc-parasol') body.push(parasol())

  const crownSvg = crown(o.crown)
  const petSvg = o.accessory === 'acc-pet' ? pet() : ''

  const inner = animate
    ? `${ANIM}<g class="pr-body">${body.join('')}</g><g class="pr-crown">${crownSvg}</g>${petSvg}`
    : `<g>${body.join('')}</g>${crownSvg}${petSvg}`

  const bg = showBg ? background(o.background, idPrefix) : ''
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">${bg}${inner}</svg>`
}
