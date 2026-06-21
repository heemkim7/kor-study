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
const rct = (x: number, y: number, w: number, h: number, f: string, rx = 0, e = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${e}/>`
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
  'hair-red': { base: '#c4604a', sh: '#9c4030', hi: '#e0917e' },
  'hair-orange': { base: '#e8954a', sh: '#c4702a', hi: '#f5bd86' },
  'hair-white': { base: '#ededf2', sh: '#c8c8d4', hi: '#ffffff' },
  'hair-lavender': { base: '#c4a8e8', sh: '#9f80d0', hi: '#e0ccf7' },
  'hair-mint': { base: '#8fd8bc', sh: '#5fb898', hi: '#c2f0de' },
  'hair-purple': { base: '#b083d6', sh: '#8a5cb8', hi: '#d2b0ee' },
  'hair-teal': { base: '#6cc2c2', sh: '#4a9e9e', hi: '#b8eeee' },
  'hair-gray': { base: '#b2b2be', sh: '#8c8c9a', hi: '#d6d6de' },
  'hair-rose': { base: '#e89ab2', sh: '#c86e8c', hi: '#ffc2d8' },
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
  'dress-coral': { main: '#ff9e8a', sh: '#e87a66', hi: '#ffd2c6', under: '#fff0ec' },
  'dress-lemon': { main: '#ffe07a', sh: '#ecc44a', hi: '#fff4c0', under: '#fffce8' },
  'dress-lime': { main: '#b8e06a', sh: '#94c44a', hi: '#e0f5b8', under: '#f4ffe8' },
  'dress-rose': { main: '#f2a0b8', sh: '#d87a96', hi: '#ffd2e0', under: '#fff0f4' },
  'dress-lavender': { main: '#cbb3ee', sh: '#a98fd6', hi: '#e8daff', under: '#f7f2ff' },
  'dress-emerald': { main: '#6fcfa0', sh: '#4aab7e', hi: '#c2f2db', under: '#ecfff6' },
  'dress-ivory': { main: '#f3e8cf', sh: '#ddccaa', hi: '#fff8e8', under: '#fffdf6' },
  'dress-gold': { main: '#f1cf63', sh: '#d4ad3e', hi: '#ffeeb0', under: '#fffae5' },
  'dress-beige': { main: '#e2c6a4', sh: '#c4a47e', hi: '#f5e6d2', under: '#fff8f0' },
  'dress-orange': { main: '#ffb060', sh: '#ec8f40', hi: '#ffdcb6', under: '#fff4ea' },
  'dress-magenta': { main: '#e87ac4', sh: '#c44f9e', hi: '#ffc2ec', under: '#fff0fa' },
  'dress-aqua': { main: '#7fd8d0', sh: '#4fb4ac', hi: '#c6f2ee', under: '#effdfb' },
  'dress-navy': { main: '#8090d4', sh: '#5f6fb4', hi: '#c4d0fa', under: '#eef2ff' },
  'dress-cocoa': { main: '#c08f6a', sh: '#a06f4a', hi: '#e8cdb4', under: '#fbf2ea' },
}

const { FCX, FCY, FRX, FRY, SHY, WY, HEMY, W, H } = G

// 치비 비율: 머리(헤어·얼굴·왕관)만 목을 기준으로 확대해 또렷하게 보이게 한다.
// 몸/들고 있는 소품은 그대로라 "얼굴이 크고 몸이 짤막한" 유아 친화 비율이 된다.
// (경로 수식은 손대지 않고 변환만 적용 — 안전. 값은 가장 큰 왕관도 화면 위로 안 잘리게 튜닝.)
const HEAD_SCALE = 1.24
const HEAD_PIVOT_Y = FCY + FRY - 12 // 목 부근
const HEAD_DY = 16 // 살짝 내려 목을 짧게(치비)
const HEAD_TRANSFORM = `translate(0 ${HEAD_DY}) translate(${FCX} ${HEAD_PIVOT_Y}) scale(${HEAD_SCALE}) translate(${-FCX} ${-HEAD_PIVOT_Y})`

// ---- 배경 ----
function background(id: BackgroundId, idPrefix: string): string {
  const sparkles = (col: string) =>
    [[54, 84, 6], [322, 116, 7], [40, 300, 5], [338, 330, 6], [58, 470, 5], [330, 500, 5]]
      .map(([x, y, r]) => pth(`M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z`, col)).join('')
  const grad = (a: string, b: string) =>
    `<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${idPrefix}-bg)"/>`

  if (id === 'bg-beach') {
    return grad('#aee4ff', '#eaf7ff') + c(302, 84, 28, '#fff3b0') + c(302, 84, 28, '#ffe98a', 'opacity="0.5"') +
      ell(70, 120, 30, 14, '#ffffff', 'opacity="0.8"') +
      rct(0, 392, W, 74, '#7fc4e8') + pth(`M 0 396 q 95 12 190 0 q 95 -12 190 0 L ${W} 466 L 0 466 Z`, '#9fd6ee') +
      `<rect x="0" y="460" width="${W}" height="${H - 460}" fill="#f3e3bb"/>` +
      star(116, 542, 9, '#ff9ecb', `stroke="#e87aaa" stroke-width="1"`) + ell(286, 558, 11, 7, '#ffd0b0') + ell(60, 572, 9, 6, '#ffd0b0')
  }
  if (id === 'bg-snow') {
    return grad('#dbeeff', '#f4faff') +
      pth(`M 0 472 Q ${FCX} 442 ${W} 472 L ${W} ${H} L 0 ${H} Z`, '#ffffff') +
      [[60, 90], [150, 140], [320, 100], [44, 300], [340, 260], [80, 430], [330, 410], [200, 70]]
        .map(([x, y]) => c(x, y, 3.2, '#ffffff') + [0, 1, 2].map((k) => ln(x - 5, y + (k - 1) * 5, x + 5, y + (k - 1) * 5, 1, '#cfe6ff')).join('')).join('') +
      c(110, 520, 5, '#ffffff') + c(300, 540, 5, '#ffffff')
  }
  if (id === 'bg-space') {
    return grad('#15163a', '#3a2a5e') +
      [[40, 70], [120, 130], [300, 60], [340, 180], [60, 250], [330, 320], [200, 50], [250, 420], [90, 460]]
        .map(([x, y]) => star(x, y, 5, '#fff6c8', 'opacity="0.9"')).join('') +
      c(300, 130, 30, '#ffb0d4') + ell(300, 130, 44, 12, 'none', `stroke="#ffd6e8" stroke-width="3" opacity="0.7" transform="rotate(-20 300 130)"`) +
      c(70, 360, 16, '#9fd4ee') + c(64, 354, 4, '#cfeeff', 'opacity="0.7"')
  }
  if (id === 'bg-forest') {
    const tree = (x: number, s: number) => `<rect x="${x - s * 0.16}" y="${480 - s * 0.2}" width="${s * 0.32}" height="${s + 20}" rx="4" fill="#b07a4e"/>` +
      c(x, 470 - s, s * 0.9, '#5fae46') + c(x - s * 0.6, 470 - s * 0.6, s * 0.66, '#7cc35e') + c(x + s * 0.6, 470 - s * 0.55, s * 0.66, '#7cc35e') + c(x, 470 - s * 1.1, s * 0.7, '#7cc35e')
    return grad('#cfeeff', '#eafbf0') + c(312, 86, 26, '#fff3b0') +
      `<path d="M 0 490 Q ${FCX} 462 ${W} 490 L ${W} ${H} L 0 ${H} Z" fill="#bfe9c8"/>` +
      tree(48, 40) + tree(340, 46) + tree(120, 30) +
      flower(70, 540, 8, '#ff9ecb') + flower(320, 552, 8, '#ffd24d')
  }
  if (id === 'bg-flower') {
    return grad('#eafaff', '#fff0f6') + c(312, 84, 26, '#fff3b0') +
      `<path d="M 0 ${H - 96} Q ${FCX} ${H - 130} ${W} ${H - 96} L ${W} ${H} L 0 ${H} Z" fill="#bfe9c8"/>` +
      [[40, H - 80, '#ff9ecb'], [110, H - 64, '#ffd24d'], [250, H - 70, '#b58bff'], [320, H - 84, '#ff86c0'], [180, H - 58, '#ffd24d'], [346, H - 56, '#ff9ecb']]
        .map(([x, y, col]) => flower(x as number, y as number, 9, col as string)).join('')
  }
  if (id === 'bg-ballroom') {
    return grad('#f6e3c8', '#fff3e2') +
      `<rect x="22" y="120" width="40" height="${H - 120}" fill="#e8d4b0"/><rect x="${W - 62}" y="120" width="40" height="${H - 120}" fill="#e8d4b0"/>` +
      `<rect x="0" y="${H - 90}" width="${W}" height="90" fill="#dcc39a"/>` +
      `<line x1="${FCX}" y1="0" x2="${FCX}" y2="64" stroke="#d4ad3e" stroke-width="3"/>` +
      ell(FCX, 78, 34, 16, GOLD) + [-22, 0, 22].map((dx) => c(FCX + dx, 92, 5, '#fff6c8') + ln(FCX + dx, 84, FCX + dx, 100, 2, GOLD)).join('') +
      sparkles('#ffe9b8')
  }
  if (id === 'bg-sunset') {
    return grad('#ffd6a0', '#ffc2dc') + c(FCX, 200, 56, '#ff9e5a', 'opacity="0.55"') + c(FCX, 200, 40, '#ffd24d') +
      ell(80, 120, 30, 14, '#fff', 'opacity="0.7"') + ell(310, 150, 26, 12, '#fff', 'opacity="0.7"') +
      pth(`M 0 ${H - 110} Q ${FCX} ${H - 150} ${W} ${H - 110} L ${W} ${H} L 0 ${H} Z`, '#caa063')
  }
  if (id === 'bg-room') {
    return grad('#ffe8d8', '#fff4ec') +
      `<rect x="0" y="${H - 120}" width="${W}" height="120" fill="#e8c9a8"/>` +
      `<rect x="60" y="120" width="120" height="120" rx="8" fill="#bfe6ff"/><rect x="60" y="120" width="120" height="120" rx="8" fill="none" stroke="#e0c6a0" stroke-width="6"/>` +
      `<line x1="120" y1="120" x2="120" y2="240" stroke="#e0c6a0" stroke-width="4"/><line x1="60" y1="180" x2="180" y2="180" stroke="#e0c6a0" stroke-width="4"/>` +
      star(300, 150, 8, '#ffd24d') + star(330, 200, 6, '#ff9ecb') + star(280, 220, 6, '#7ec9f0')
  }

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
// 치마 외곽 경로(무늬 클리핑·본체에 공용)
const SKIRT_PATH = `M ${FCX - 28} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX} ${HEMY + 14} ${FCX - 122} ${HEMY - 2} Z`

// 작은 4각 반짝이
const sparkle4 = (x: number, y: number, s: number, col: string, op: number) =>
  pth(`M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3} L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`, col, `opacity="${op}"`)

type Motif = 'dots' | 'stars' | 'hearts' | 'sparkle'
/** 드레스마다 무늬를 다르게(id 해시로 결정) — 화려하게. */
function dressMotif(id: string): Motif {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return (['dots', 'stars', 'hearts', 'sparkle'] as const)[h % 4]
}

/** 치마 위에 흩뿌리는 무늬(클립으로 치마 모양 안쪽만 남김). */
function skirtMotifs(motif: Motif, d: DressPal): string {
  const out: string[] = []
  let r = 0
  for (let y = WY + 50; y < HEMY - 6; y += 42, r++) {
    const half = 28 + (122 - 28) * (y - WY) / (HEMY - WY)
    const offset = r % 2 ? 19 : 0
    for (let x = FCX - half + 16 + offset; x <= FCX + half - 16; x += 38) {
      const white = (Math.round(x) + r) % 3 === 0
      const col = white ? TRIM : d.hi
      const op = white ? 0.65 : 0.55
      if (motif === 'stars') out.push(star(x, y, 6.5, col, `opacity="${op}"`))
      else if (motif === 'hearts') out.push(heart(x, y, 5.5, col, `opacity="${op}"`))
      else if (motif === 'sparkle') out.push(sparkle4(x, y, 6, col, op))
      else out.push(c(x, y, 5, col, `opacity="${op}"`))
    }
  }
  return out.join('')
}

/** 허리 새시 리본 꼬리(치마에 드리움 — 상의 밑으로 살짝 보임). */
function sashTails(d: DressPal): string {
  const y = WY + 2
  return pth(`M ${FCX - 3} ${y} q -15 24 -7 44 l 9 -7 q -4 -17 5 -33 Z`, d.hi, 'opacity="0.9"') +
    pth(`M ${FCX + 3} ${y} q 15 24 7 44 l -9 -7 q 4 -17 -5 -33 Z`, d.hi, 'opacity="0.9"')
}

/** 밑단 레이스 프릴(흰 스캘럽이 치마 곡선을 따라). */
function hemRuffle(): string {
  const out: string[] = []
  for (let x = FCX - 110; x <= FCX + 110; x += 20) {
    const t = (x - FCX) / 122
    const y = HEMY - 2 + 14 * (1 - t * t)
    out.push(`<path d="M ${x - 11} ${y} a 11 8 0 0 0 22 0" fill="none" stroke="${TRIM}" stroke-width="5" opacity="0.85"/>`)
  }
  return out.join('')
}

function dressLayer(d: DressPal, idPrefix: string, motif: Motif): string {
  const p: string[] = []
  const clipId = `${idPrefix}-skirt`
  const gradId = `${idPrefix}-skgr`
  // 새틴 그라데이션(위 밝고 아래 진하게) — 고급스러운 입체감
  p.push(`<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${d.hi}"/><stop offset="0.42" stop-color="${d.main}"/><stop offset="1" stop-color="${d.sh}"/></linearGradient></defs>`)
  // 속치마
  p.push(pth(`M ${FCX - 30} ${WY} L ${FCX + 30} ${WY} L ${FCX + 150} ${HEMY} Q ${FCX} ${HEMY + 22} ${FCX - 150} ${HEMY} Z`, d.under))
  p.push(ell(FCX - 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX + 16, HEMY + 6, 12, 7, d.sh))
  p.push(ell(FCX - 16, HEMY + 4, 10, 5, TRIM))
  p.push(ell(FCX + 16, HEMY + 4, 10, 5, TRIM))
  // 겉치마 본체(그라데이션)
  p.push(pth(SKIRT_PATH, `url(#${gradId})`))
  // 무늬(치마 모양으로 클리핑)
  p.push(`<clipPath id="${clipId}"><path d="${SKIRT_PATH}"/></clipPath>`)
  p.push(`<g clip-path="url(#${clipId})">${skirtMotifs(motif, d)}</g>`)
  // 음영·하이라이트(무늬 위로 은은하게)
  p.push(pth(`M ${FCX + 6} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX + 72} ${HEMY + 2} ${FCX + 42} ${HEMY - 2} Z`, d.sh, 'opacity="0.35"'))
  // 새틴 광택(왼쪽 위에서 비치는 부드러운 흰 빛 — 치마 모양 안쪽만)
  p.push(`<g clip-path="url(#${clipId})">${ell(FCX - 28, WY + 120, 30, 150, TRIM, 'opacity="0.14"')}${ell(FCX - 40, WY + 80, 14, 90, TRIM, 'opacity="0.16"')}</g>`)
  p.push(stroke(`M ${FCX - 14} ${WY + 8} Q ${FCX - 54} ${HEMY - 90} ${FCX - 74} ${HEMY - 6}`, d.hi, 6, 'opacity="0.55"'))
  // 허리 새시 리본 꼬리
  p.push(sashTails(d))
  // 밑단 프릴 + 흰 띠
  p.push(hemRuffle())
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

function bodice(d: DressPal, idPrefix: string): string {
  const p: string[] = []
  const bg = `${idPrefix}-bdgr`
  p.push(`<defs><linearGradient id="${bg}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${d.hi}"/><stop offset="0.5" stop-color="${d.main}"/><stop offset="1" stop-color="${d.sh}"/></linearGradient></defs>`)
  p.push(pth(`M ${FCX - 36} ${SHY} Q ${FCX} ${SHY + 6} ${FCX + 36} ${SHY} L ${FCX + 28} ${WY} Q ${FCX} ${WY + 10} ${FCX - 28} ${WY} Z`, d.sh))
  p.push(pth(`M ${FCX - 30} ${SHY + 2} Q ${FCX - 14} ${SHY + 20} ${FCX} ${SHY + 16} Q ${FCX + 14} ${SHY + 20} ${FCX + 30} ${SHY + 2} L ${FCX + 24} ${WY - 4} Q ${FCX} ${WY + 4} ${FCX - 24} ${WY - 4} Z`, `url(#${bg})`))
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
  const band = (col = GOLD) => pth(`M ${FCX - 36} ${ty + 12} Q ${FCX} ${ty - 4} ${FCX + 36} ${ty + 12} L ${FCX + 31} ${ty + 18} Q ${FCX} ${ty + 4} ${FCX - 31} ${ty + 18} Z`, col)
  switch (id) {
    case 'crown-flower': {
      const spots: [number, number, number, string][] = [
        [FCX - 34, ty + 12, 7, '#ff9ecb'], [FCX - 17, ty + 4, 8, '#fff0f6'],
        [FCX, ty, 8.5, '#ff86c0'], [FCX + 17, ty + 4, 8, '#fff0f6'], [FCX + 34, ty + 12, 7, '#ff9ecb'],
      ]
      return stroke(`M ${FCX - 38} ${ty + 14} Q ${FCX} ${ty - 6} ${FCX + 38} ${ty + 14}`, '#7ec98a', 4) +
        spots.map(([x, y, s, col]) => flower(x, y, s, col)).join('')
    }
    case 'crown-star':
      return band() +
        star(FCX, ty - 11, 12, GOLD, `stroke="${GOLD_SH}" stroke-width="1.5"`) +
        star(FCX - 25, ty + 1, 7.5, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
        star(FCX + 25, ty + 1, 7.5, GOLD, `stroke="${GOLD_SH}" stroke-width="1"`) +
        star(FCX, ty - 11, 5, '#fff6c8')
    case 'crown-heart':
      return band() + heart(FCX, ty - 13, 12, GEM_PINK) + heart(FCX - 26, ty + 1, 7, '#ffb3da') + heart(FCX + 26, ty + 1, 7, '#ffb3da')
    case 'crown-bow': {
      const by = ty - 4
      return stroke(`M ${FCX - 36} ${ty + 14} Q ${FCX} ${ty} ${FCX + 36} ${ty + 14}`, '#ff86c0', 5) +
        pth(`M ${FCX} ${by} C ${FCX - 26} ${by - 14} ${FCX - 26} ${by + 14} ${FCX} ${by} Z`, '#ff86c0') +
        pth(`M ${FCX} ${by} C ${FCX + 26} ${by - 14} ${FCX + 26} ${by + 14} ${FCX} ${by} Z`, '#ff86c0') +
        ell(FCX - 13, by, 7, 9, '#ffb3da', 'opacity="0.8"') + ell(FCX + 13, by, 7, 9, '#ffb3da', 'opacity="0.8"') +
        c(FCX, by, 5, '#ff6aa6')
    }
    case 'crown-catears': {
      const ear = (sgn: number) => {
        const ex = FCX + sgn * 20
        return pth(`M ${ex - 13} ${ty + 8} L ${ex} ${ty - 22} L ${ex + 13} ${ty + 8} Z`, '#3a3a44') +
          pth(`M ${ex - 7} ${ty + 4} L ${ex} ${ty - 14} L ${ex + 7} ${ty + 4} Z`, '#ffb3da')
      }
      return stroke(`M ${FCX - 34} ${ty + 14} Q ${FCX} ${ty + 2} ${FCX + 34} ${ty + 14}`, '#3a3a44', 4) + ear(-1) + ear(1)
    }
    case 'crown-bunnyears': {
      const ear = (sgn: number) => ell(FCX + sgn * 14, ty - 20, 9, 26, '#ffffff', `stroke="#f0d6e0" stroke-width="1.5" transform="rotate(${sgn * 10} ${FCX + sgn * 14} ${ty - 8})"`) +
        ell(FCX + sgn * 14, ty - 20, 4.5, 18, '#ffc6da', `transform="rotate(${sgn * 10} ${FCX + sgn * 14} ${ty - 8})"`)
      return ear(-1) + ear(1)
    }
    case 'crown-halo':
      return ell(FCX, ty - 16, 28, 9, 'none', `stroke="#ffe89a" stroke-width="7" opacity="0.6"`) +
        ell(FCX, ty - 16, 28, 9, 'none', `stroke="${GOLD}" stroke-width="4"`)
    case 'crown-pearl':
      return band(GOLD) + [-30, -20, -10, 0, 10, 20, 30].map((dx, i) => c(FCX + dx, ty + 6 - (i === 3 ? 4 : Math.abs(dx) < 15 ? 1 : 0), i === 3 ? 5 : 4, '#fbf2f6') + c(FCX + dx - 1, ty + 4, 1.5, '#ffffff', 'opacity="0.9"')).join('')
    case 'crown-party': {
      const apex = ty - 40
      return pth(`M ${FCX - 22} ${ty + 14} L ${FCX} ${apex} L ${FCX + 22} ${ty + 14} Z`, '#ff86c0') +
        pth(`M ${FCX - 8} ${ty - 6} L ${FCX + 2} ${apex + 14} L ${FCX + 10} ${ty - 2} Z`, '#fff0f6', 'opacity="0.6"') +
        [ty + 6, ty - 6, ty - 18].map((yy, i) => c(FCX + (i - 1) * 4, yy, 3, ['#7ec9f0', '#ffe14d', '#9fe0c4'][i])).join('') +
        c(FCX, apex, 6, '#fff6c8') + c(FCX, apex, 3.5, '#ffe14d')
    }
    case 'crown-snow': {
      const cx = FCX, cy = ty - 8
      let fl = ''
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; fl += ln(cx, cy, cx + Math.cos(a) * 13, cy + Math.sin(a) * 13, 2.4, '#cdeeff') }
      return band('#bcd6f7') + fl + c(cx, cy, 3.5, '#ffffff') + c(FCX - 24, ty + 2, 2.5, '#eaf7ff') + c(FCX + 24, ty + 2, 2.5, '#eaf7ff')
    }
    case 'crown-moon':
      return band() + pth(`M ${FCX - 2} ${ty - 18} A 11 11 0 1 0 ${FCX - 2} ${ty + 4} A 8 8 0 1 1 ${FCX - 2} ${ty - 18} Z`, '#fff3c4', `stroke="#e7d9a8" stroke-width="1"`) +
        star(FCX - 22, ty + 2, 4, GOLD) + star(FCX + 22, ty + 2, 4, GOLD)
    default: // crown-gold (및 알 수 없는 id)
      return (
        pth(`M ${FCX - 36} ${ty + 10} L ${FCX - 20} ${ty - 6} L ${FCX - 11} ${ty + 4} L ${FCX} ${ty - 16} L ${FCX + 11} ${ty + 4} L ${FCX + 20} ${ty - 6} L ${FCX + 36} ${ty + 10} Z`, GOLD) +
        pth(`M ${FCX - 36} ${ty + 10} L ${FCX + 36} ${ty + 10} L ${FCX + 31} ${ty + 16} L ${FCX - 31} ${ty + 16} Z`, GOLD_SH) +
        c(FCX, ty - 10, 4.5, GEM_PINK) + c(FCX - 20, ty - 6, 3, GEM) + c(FCX + 20, ty - 6, 3, GEM)
      )
  }
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
    stroke(`M ${cx} ${cy - 56} L ${cx} ${cy}`, '#dd83ba', 1.6, 'opacity="0.6"') +
    stroke(`M ${cx - 30} ${cy - 47} L ${cx - 16} ${cy}`, '#dd83ba', 1.4, 'opacity="0.5"') +
    stroke(`M ${cx + 30} ${cy - 47} L ${cx + 16} ${cy}`, '#dd83ba', 1.4, 'opacity="0.5"') +
    // 레이스 스캘럽 가장자리
    [-48, -32, -16, 0, 16, 32, 48].map((dx) => c(cx + dx, cy, 8, '#ffd6ec')).join('') +
    pth(`M ${cx - 56} ${cy} A 56 56 0 0 1 ${cx + 56} ${cy} L ${cx + 56} ${cy} L ${cx - 56} ${cy} Z`, 'none', `stroke="#dd83ba" stroke-width="1.5"`) +
    c(cx, cy - 56, 4, GOLD)
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

function sunglasses(): string {
  const ey = FCY + FRY * 0.18, lx = FCX - FRX * 0.44, rx = FCX + FRX * 0.44, r = 12
  return ell(lx, ey, r, r * 0.9, '#3a3a44') + ell(rx, ey, r, r * 0.9, '#3a3a44') +
    ln(lx + r, ey, rx - r, ey, 3, '#3a3a44') +
    ln(lx - r, ey - 1, FCX - FRX, ey - 3, 2.4, '#3a3a44') + ln(rx + r, ey - 1, FCX + FRX, ey - 3, 2.4, '#3a3a44') +
    ell(lx - 3, ey - 3, 4, 2.5, '#ffffff', 'opacity="0.4"') + ell(rx - 3, ey - 3, 4, 2.5, '#ffffff', 'opacity="0.4"')
}
function earrings(): string {
  const ey = FCY + FRY * 0.66
  const one = (sgn: number) => {
    const x = FCX + sgn * FRX * 0.96
    return ln(x, ey - 4, x, ey, 1.5, GOLD) + c(x, ey + 3, 3.4, GEM_PINK) + c(x - 1, ey + 2, 1.2, WHITE, 'opacity="0.8"')
  }
  return one(-1) + one(1)
}
function bowtieAcc(): string {
  const bx = FCX, by = SHY + 4
  return pth(`M ${bx} ${by} l -13 -8 l 0 16 Z`, '#5b8def') + pth(`M ${bx} ${by} l 13 -8 l 0 16 Z`, '#5b8def') + c(bx, by, 4, '#3f63b0')
}
function cape(): string {
  return pth(`M ${FCX - 34} ${SHY - 2} Q ${FCX} ${SHY + 8} ${FCX + 34} ${SHY - 2} L ${FCX + 70} ${HEMY - 30} Q ${FCX} ${HEMY + 6} ${FCX - 70} ${HEMY - 30} Z`, '#d6485a', 'opacity="0.92"') +
    pth(`M ${FCX - 34} ${SHY - 2} Q ${FCX} ${SHY + 8} ${FCX + 34} ${SHY - 2} L ${FCX + 30} ${SHY + 8} Q ${FCX} ${SHY + 18} ${FCX - 30} ${SHY + 8} Z`, WHITE, 'opacity="0.85"')
}
function heldBalloon(): string {
  const hx = FCX + 45, hy = WY - 4, bx = hx + 30, by = 150
  return ln(hx, hy, bx, by + 30, 1.6, '#b58b6a') + ell(bx, by, 22, 26, '#ef6aa6') + ell(bx - 7, by - 9, 5, 7, WHITE, 'opacity="0.5"') + pth(`M ${bx - 4} ${by + 25} l 4 6 l 4 -6 Z`, '#ef6aa6')
}
function bouquet(): string {
  const hx = FCX + 45, hy = WY - 4
  return ln(hx, hy, hx + 4, hy - 28, 4, '#7cc35e') +
    pth(`M ${hx - 8} ${hy - 28} L ${hx + 14} ${hy - 28} L ${hx + 8} ${hy + 2} L ${hx - 2} ${hy + 2} Z`, '#fff0f6', 'opacity="0.7"') +
    flower(hx - 6, hy - 34, 7, '#ff86c0') + flower(hx + 10, hy - 36, 7, '#ffd24d') + flower(hx + 2, hy - 46, 7, '#b58bff')
}
function heldTeddy(): string {
  const tx = FCX + 50, ty = WY + 8, s = 13
  return ell(tx, ty + s * 0.5, s * 0.8, s, '#c79a6e') +
    c(tx - s * 0.6, ty - s * 0.85, s * 0.32, '#c79a6e') + c(tx + s * 0.6, ty - s * 0.85, s * 0.32, '#c79a6e') +
    c(tx, ty - s * 0.3, s * 0.72, '#c79a6e') + ell(tx, ty - s * 0.1, s * 0.4, s * 0.32, '#e8cdb4') +
    c(tx - s * 0.26, ty - s * 0.4, 1.7, '#5b3b2a') + c(tx + s * 0.26, ty - s * 0.4, 1.7, '#5b3b2a') + c(tx, ty - s * 0.12, 2, '#7a5436')
}
function starStaff(): string {
  const hx = FCX + 45, hy = WY - 4, tx = hx + 10, ty = hy - 90
  return ln(hx, hy, tx, ty, 5, '#caa9d8') +
    star(tx, ty, 16, '#b58bff', `stroke="#9060b8" stroke-width="2"`) + star(tx, ty, 8, '#e6d6ff') +
    c(tx - 18, ty + 10, 2, '#e6d6ff', 'opacity="0.8"') + c(tx + 14, ty + 18, 1.6, '#e6d6ff', 'opacity="0.7"')
}

const ANIM = `<style>
@keyframes pr-sway{0%,100%{transform:rotate(-1.2deg) translateY(0)}50%{transform:rotate(1.2deg) translateY(-4px)}}
@keyframes pr-twinkle{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.12)}}
.pr-body{transform-origin:190px 360px;transform-box:view-box;animation:pr-sway 4.2s ease-in-out infinite}
.pr-crown{transform-origin:190px 52px;transform-box:view-box;animation:pr-twinkle 2.6s ease-in-out infinite}
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
  // 알 수 없는 드레스 id는 분홍으로 폴백 — 팔레트와 무늬 모두 같은 해결 id 기준(폴백 동등성 보장).
  const dressId = o.dress in DRESS ? o.dress : 'dress-pink'
  const d = DRESS[dressId]

  const acc = o.accessory
  // 머리 요소(헤어/얼굴/왕관)는 HEAD_TRANSFORM으로 키운다. 몸/소품은 그대로.
  const headWrap = (c: string) => `<g transform="${HEAD_TRANSFORM}">${c}</g>`

  // 1) 뒤쪽: 바닥 그림자 → 망토·날개(몸) → 뒷머리(머리)
  const behind: string[] = []
  behind.push(ell(FCX, HEMY + 18, 96, 14, '#00000016')) // 서 있는 바닥 그림자(입체감)
  if (acc === 'acc-cape') behind.push(cape())
  if (acc === 'acc-wings') behind.push(wings())
  behind.push(headWrap(backHair(h, style)))

  // 2) 몸통: 드레스·팔·상의·목·가슴 액세서리
  const mid: string[] = [dressLayer(d, idPrefix, dressMotif(dressId)), arms(), bodice(d, idPrefix), neck()]
  if (acc === 'acc-necklace') mid.push(necklacePendant())
  if (acc === 'acc-bowtie') mid.push(bowtieAcc())

  // 3) 얼굴층(머리): 얼굴·눈썹·안경·앞머리·귀걸이
  const faceLayer: string[] = [face(), eyebrows(h)]
  if (acc === 'acc-glasses') faceLayer.push(glasses())
  if (acc === 'acc-sunglasses') faceLayer.push(sunglasses())
  faceLayer.push(frontHair(h, style))
  if (acc === 'acc-earrings') faceLayer.push(earrings())

  // 4) 손에 든 소품(몸): 앞쪽에 그림
  const held: string[] = []
  if (acc === 'acc-wand') held.push(wand())
  if (acc === 'acc-parasol') held.push(parasol())
  if (acc === 'acc-balloon') held.push(heldBalloon())
  if (acc === 'acc-bouquet') held.push(bouquet())
  if (acc === 'acc-teddy') held.push(heldTeddy())
  if (acc === 'acc-starstaff') held.push(starStaff())

  const bodyContent = behind.join('') + mid.join('') + headWrap(faceLayer.join('')) + held.join('')
  const crownSvg = headWrap(crown(o.crown))
  const petSvg = acc === 'acc-pet' ? pet() : ''

  const inner = animate
    ? `${ANIM}<g class="pr-body">${bodyContent}</g><g class="pr-crown">${crownSvg}</g>${petSvg}`
    : `<g>${bodyContent}</g>${crownSvg}${petSvg}`

  const bg = showBg ? background(o.background, idPrefix) : ''
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">${bg}${inner}</svg>`
}
