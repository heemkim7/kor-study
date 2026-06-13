// 공주 샘플 v3 — 갸름한 얼굴 + 짧은 보디스(높은 허리) + 긴 가운. 균형 개선.
//   node scripts/gen-princess-sample.mjs  → .preview/princess-sample.png
import { writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const W = 380, H = 600
const C = {
  skin: '#ffe1c6', skinSh: '#f3c6a2',
  hair: '#ffd24d', hairSh: '#eeb52c', hairHi: '#ffe89a',
  dress: '#f2a6d0', dressSh: '#dd83ba', dressHi: '#ffd2ee', under: '#fff0f8', trim: '#ffffff',
  gold: '#ffcf4d', goldSh: '#e7a92a', gem: '#7ec9f0', gemPink: '#ff86c0',
  eye: '#5b3b2a', white: '#ffffff', cheek: '#f6a0bc', lips: '#e87a9a',
  bg1: '#fff4fa', bg2: '#ffe4f1',
}
const c = (x, y, r, f, e = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`
const ell = (x, y, rx, ry, f, e = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${e}/>`
const pth = (d, f, e = '') => `<path d="${d}" fill="${f}" ${e}/>`
const ln = (x1, y1, x2, y2, w, s) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" stroke-linecap="round"/>`
const stroke = (d, s, w, e = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${e}/>`

// 얼굴: 작고 갸름하게 / 보디스: 짧게(허리 높임) / 치마: 길게
const FCX = 190, FCY = 116, FRX = 44, FRY = 52
const SHY = 184   // 어깨
const WY = 250    // 허리(높게 → 보디스 짧음)
const HEMY = H - 26

const p = []
p.push(`<defs><radialGradient id="bg" cx="50%" cy="36%" r="72%"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg2}"/></radialGradient></defs>`)
p.push(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`)
for (const [x, y, r] of [[54, 84, 6], [322, 116, 7], [40, 300, 5], [338, 330, 6], [58, 470, 5], [330, 500, 5]]) {
  p.push(pth(`M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z`, '#ffcfe9'))
}

// 뒷머리 — 가슴께까지만(상체 비지 않게), 부드러운 웨이브
p.push(pth(`M ${FCX - FRX} ${FCY - 2} C ${FCX - FRX - 26} ${FCY + 60} ${FCX - 66} ${FCY + 120} ${FCX - 56} ${FCY + 168}
  C ${FCX - 52} ${FCY + 192} ${FCX - 34} ${FCY + 190} ${FCX - 30} ${FCY + 166}
  C ${FCX - 26} ${FCY + 186} ${FCX + 26} ${FCY + 186} ${FCX + 30} ${FCY + 166}
  C ${FCX + 34} ${FCY + 190} ${FCX + 52} ${FCY + 192} ${FCX + 56} ${FCY + 168}
  C ${FCX + 66} ${FCY + 120} ${FCX + FRX + 26} ${FCY + 60} ${FCX + FRX} ${FCY - 2} Z`, C.hair))
p.push(stroke(`M ${FCX - FRX - 6} ${FCY + 52} C ${FCX - 58} ${FCY + 110} ${FCX - 50} ${FCY + 150} ${FCX - 44} ${FCY + 168}`, C.hairHi, 4, 'opacity="0.5"'))
p.push(stroke(`M ${FCX + FRX + 6} ${FCY + 52} C ${FCX + 58} ${FCY + 110} ${FCX + 50} ${FCY + 150} ${FCX + 44} ${FCY + 168}`, C.hairHi, 4, 'opacity="0.5"'))

// ---- 드레스(긴 가운) ----
p.push(pth(`M ${FCX - 30} ${WY} L ${FCX + 30} ${WY} L ${FCX + 150} ${HEMY} Q ${FCX} ${HEMY + 22} ${FCX - 150} ${HEMY} Z`, C.under))
// 신발 살짝
p.push(ell(FCX - 16, HEMY + 6, 12, 7, C.dressSh))
p.push(ell(FCX + 16, HEMY + 6, 12, 7, C.dressSh))
p.push(ell(FCX - 16, HEMY + 4, 10, 5, C.trim))
p.push(ell(FCX + 16, HEMY + 4, 10, 5, C.trim))
// 메인 치마
p.push(pth(`M ${FCX - 28} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX} ${HEMY + 14} ${FCX - 122} ${HEMY - 2} Z`, C.dress))
p.push(pth(`M ${FCX + 6} ${WY} L ${FCX + 28} ${WY} L ${FCX + 122} ${HEMY - 2} Q ${FCX + 72} ${HEMY + 2} ${FCX + 42} ${HEMY - 2} Z`, C.dressSh, 'opacity="0.5"'))
p.push(stroke(`M ${FCX - 14} ${WY + 8} Q ${FCX - 54} ${HEMY - 90} ${FCX - 74} ${HEMY - 6}`, C.dressHi, 6, 'opacity="0.7"'))
p.push(stroke(`M ${FCX + 22} ${WY + 16} Q ${FCX + 16} ${HEMY - 80} ${FCX + 6} ${HEMY - 4}`, C.dressSh, 4, 'opacity="0.4"'))
p.push(pth(`M ${FCX - 122} ${HEMY - 2} Q ${FCX} ${HEMY + 14} ${FCX + 122} ${HEMY - 2} L ${FCX + 117} ${HEMY + 8} Q ${FCX} ${HEMY + 24} ${FCX - 117} ${HEMY + 8} Z`, C.trim))

// 팔(짧고 슬림, 높은 허리까지)
p.push(ln(FCX - 36, SHY + 6, FCX - 44, WY - 8, 12, C.skin))
p.push(ln(FCX + 36, SHY + 6, FCX + 44, WY - 8, 12, C.skin))
p.push(c(FCX - 45, WY - 4, 8, C.skin))
p.push(c(FCX + 45, WY - 4, 8, C.skin))

// 보디스(짧음) + 스위트하트
p.push(pth(`M ${FCX - 36} ${SHY} Q ${FCX} ${SHY + 6} ${FCX + 36} ${SHY} L ${FCX + 28} ${WY} Q ${FCX} ${WY + 10} ${FCX - 28} ${WY} Z`, C.dressSh))
p.push(pth(`M ${FCX - 30} ${SHY + 2} Q ${FCX - 14} ${SHY + 20} ${FCX} ${SHY + 16} Q ${FCX + 14} ${SHY + 20} ${FCX + 30} ${SHY + 2} L ${FCX + 24} ${WY - 4} Q ${FCX} ${WY + 4} ${FCX - 24} ${WY - 4} Z`, C.dress))
// 퍼프 소매
p.push(ell(FCX - 40, SHY + 6, 18, 14, C.dress))
p.push(ell(FCX + 40, SHY + 6, 18, 14, C.dress))
p.push(ell(FCX - 40, SHY + 2, 8, 4, C.dressHi, 'opacity="0.7"'))
p.push(ell(FCX + 40, SHY + 2, 8, 4, C.dressHi, 'opacity="0.7"'))
// 허리 리본
p.push(ell(FCX, WY - 1, 13, 7, C.dressHi))
p.push(pth(`M ${FCX - 13} ${WY - 1} l -18 -10 l 0 20 Z`, C.trim))
p.push(pth(`M ${FCX + 13} ${WY - 1} l 18 -10 l 0 20 Z`, C.trim))

// 목(짧게)
p.push(`<rect x="${FCX - 9}" y="${FCY + FRY - 14}" width="18" height="24" rx="8" fill="${C.skin}"/>`)
p.push(ell(FCX, FCY + FRY + 4, 12, 5, C.skinSh, 'opacity="0.45"'))
p.push(stroke(`M ${FCX - 18} ${SHY - 4} Q ${FCX} ${SHY + 8} ${FCX + 18} ${SHY - 4}`, C.gold, 2.2))
p.push(c(FCX, SHY + 5, 3.5, C.gemPink))

// ---- 얼굴(갸름, 부드러운 턱) ----
p.push(pth(`M ${FCX} ${FCY - FRY}
  C ${FCX - FRX * 1.04} ${FCY - FRY * 0.86} ${FCX - FRX} ${FCY + FRY * 0.28} ${FCX - FRX * 0.66} ${FCY + FRY * 0.74}
  Q ${FCX} ${FCY + FRY * 1.04} ${FCX + FRX * 0.66} ${FCY + FRY * 0.74}
  C ${FCX + FRX} ${FCY + FRY * 0.28} ${FCX + FRX * 1.04} ${FCY - FRY * 0.86} ${FCX} ${FCY - FRY} Z`, C.skin))
p.push(ell(FCX - FRX * 0.34, FCY - FRY * 0.34, FRX * 0.3, FRY * 0.18, C.white, 'opacity="0.3"'))

// 앞머리(가르마) + 옆 프레임(턱선 따라)
p.push(pth(`M ${FCX - FRX - 2} ${FCY + 4} C ${FCX - FRX - 4} ${FCY - 48} ${FCX - 24} ${FCY - FRY - 10} ${FCX} ${FCY - FRY - 8}
  C ${FCX + 24} ${FCY - FRY - 10} ${FCX + FRX + 4} ${FCY - 48} ${FCX + FRX + 2} ${FCY + 4}
  C ${FCX + FRX - 4} ${FCY - 32} ${FCX + 30} ${FCY - FRY + 4} ${FCX + 4} ${FCY - FRY + 16}
  C ${FCX} ${FCY - FRY + 7} ${FCX} ${FCY - FRY + 7} ${FCX - 4} ${FCY - FRY + 16}
  C ${FCX - 30} ${FCY - FRY + 4} ${FCX - FRX + 4} ${FCY - 32} ${FCX - FRX - 2} ${FCY + 4} Z`, C.hair))
p.push(stroke(`M ${FCX - 3} ${FCY - FRY + 16} C ${FCX - 20} ${FCY - FRY + 24} ${FCX - 34} ${FCY - FRY + 16} ${FCX - FRX + 6} ${FCY - 24}`, C.hairHi, 4, 'opacity="0.6"'))
p.push(pth(`M ${FCX - FRX + 2} ${FCY + 2} C ${FCX - FRX - 12} ${FCY + 40} ${FCX - FRX - 4} ${FCY + 74} ${FCX - FRX + 10} ${FCY + 86} C ${FCX - FRX + 4} ${FCY + 56} ${FCX - FRX + 4} ${FCY + 28} ${FCX - FRX + 12} ${FCY + 6} Z`, C.hair))
p.push(pth(`M ${FCX + FRX - 2} ${FCY + 2} C ${FCX + FRX + 12} ${FCY + 40} ${FCX + FRX + 4} ${FCY + 74} ${FCX + FRX - 10} ${FCY + 86} C ${FCX + FRX - 4} ${FCY + 56} ${FCX + FRX - 4} ${FCY + 28} ${FCX + FRX - 12} ${FCY + 6} Z`, C.hair))

// 눈(적당히, 속눈썹)
for (const sgn of [-1, 1]) {
  const ex = FCX + sgn * FRX * 0.44, ey = FCY + FRY * 0.18
  p.push(ell(ex, ey, FRX * 0.18, FRY * 0.2, C.white))
  p.push(c(ex, ey + FRY * 0.03, FRX * 0.15, C.eye))
  p.push(c(ex - FRX * 0.05, ey - FRY * 0.05, FRX * 0.06, C.white))
  p.push(c(ex + FRX * 0.06, ey + FRY * 0.07, FRX * 0.03, C.white, 'opacity="0.85"'))
  p.push(stroke(`M ${ex - FRX * 0.2} ${ey - FRY * 0.16} Q ${ex} ${ey - FRY * 0.26} ${ex + FRX * 0.2} ${ey - FRY * 0.16}`, C.eye, 3))
  p.push(ln(ex + sgn * FRX * 0.22, ey - FRY * 0.12, ex + sgn * FRX * 0.34, ey - FRY * 0.2, 2.4, C.eye))
}
p.push(stroke(`M ${FCX - FRX * 0.56} ${FCY - FRY * 0.14} Q ${FCX - FRX * 0.4} ${FCY - FRY * 0.24} ${FCX - FRX * 0.24} ${FCY - FRY * 0.14}`, C.hairSh, 2.6))
p.push(stroke(`M ${FCX + FRX * 0.24} ${FCY - FRY * 0.14} Q ${FCX + FRX * 0.4} ${FCY - FRY * 0.24} ${FCX + FRX * 0.56} ${FCY - FRY * 0.14}`, C.hairSh, 2.6))
p.push(c(FCX - FRX * 0.5, FCY + FRY * 0.46, FRX * 0.13, C.cheek, 'opacity="0.6"'))
p.push(c(FCX + FRX * 0.5, FCY + FRY * 0.46, FRX * 0.13, C.cheek, 'opacity="0.6"'))
p.push(c(FCX, FCY + FRY * 0.36, 2, C.skinSh))
p.push(pth(`M ${FCX - 7} ${FCY + FRY * 0.56} Q ${FCX} ${FCY + FRY * 0.7} ${FCX + 7} ${FCY + FRY * 0.56} Q ${FCX} ${FCY + FRY * 0.61} ${FCX - 7} ${FCY + FRY * 0.56} Z`, C.lips))

// 티아라
const ty = FCY - FRY + 2
p.push(pth(`M ${FCX - 36} ${ty + 10} L ${FCX - 20} ${ty - 6} L ${FCX - 11} ${ty + 4} L ${FCX} ${ty - 16} L ${FCX + 11} ${ty + 4} L ${FCX + 20} ${ty - 6} L ${FCX + 36} ${ty + 10} Z`, C.gold))
p.push(pth(`M ${FCX - 36} ${ty + 10} L ${FCX + 36} ${ty + 10} L ${FCX + 31} ${ty + 16} L ${FCX - 31} ${ty + 16} Z`, C.goldSh))
p.push(c(FCX, ty - 10, 4.5, C.gemPink))
p.push(c(FCX - 20, ty - 6, 3, C.gem))
p.push(c(FCX + 20, ty - 6, 3, C.gem))

const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p.join('')}</svg>`
mkdirSync('.preview', { recursive: true })
writeFileSync('.preview/princess-sample.svg', svg)
writeFileSync('.preview/princess-sample.png', new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng())
console.log('princess sample v3 → .preview/princess-sample.png')
