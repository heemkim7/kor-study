// 이야기 장면 일러스트 생성기 (그림책 톤, 벡터/SVG).
//   - API 비용 0, 오프라인, 태블릿에서 선명, 파일 작음.
//   - 곰돌이/원숭이/다람쥐/토끼를 '재사용 부품'으로 정의해 6장면에 일관되게 등장.
//   - 팔레트는 앱 테마(코지 크림+따뜻한 톤, src/styles/tokens.css)와 통일.
//   - 출력: public/img/scene/<id>.svg  (StoryPlayer가 <img>로 사용)
// 다시 만들려면:  node scripts/gen-scene-art.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const W = 480, H = 360

const C = {
  skyTop: '#bfe6ff', skyBot: '#eaf7ff',
  sunsetTop: '#ffe0a6', sunsetMid: '#ffb38f', sunsetBot: '#f6c1d6',
  sun: '#ffd24d', sunGlow: '#ffe89a', sunset: '#ff9e5a',
  cloud: '#ffffff',
  hillBack: '#cdeeb0', hillMid: '#b2e28d',
  grass: '#9ad36f', grassDark: '#84c457', grassBlade: '#7ab84e',
  path: '#f2dca3', pathEdge: '#e6cb88',
  trunk: '#b07a4e', trunkDark: '#9a6840',
  leaf: '#7cc35e', leafDark: '#5fae46', leafLight: '#a3d885',
  apple: '#e8483f', appleDark: '#cf3a33', appleLeaf: '#5fae46',
  banana: '#ffd23e', bananaEdge: '#e6a92f', bananaTip: '#8a6a2e',
  grape: '#9b5fc0', grapeDark: '#7e46a6', grapeLeaf: '#6cb84e',
  bear: '#b9824f', bearLight: '#ecd2ac', bearDark: '#7a5436',
  monkey: '#8d6443', monkeyFace: '#f0d6ae', monkeyDark: '#6e4d34',
  squirrel: '#df9249', squirrelLight: '#f2c690', squirrelDark: '#b8702f',
  rabbit: '#fff6ec', rabbitShade: '#efe1d0', rabbitEar: '#f6b9c6',
  eye: '#4a3526', cheek: '#f29bb0',
  shadow: 'rgba(90,60,30,0.13)',
  white: '#ffffff',
}

// ---- 기본 도형 헬퍼 ----
const c   = (cx, cy, r, fill, ex = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ex}/>`
const ell = (cx, cy, rx, ry, fill, ex = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${ex}/>`
const rct = (x, y, w, h, fill, rx = 0, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${ex}/>`
const pth = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`
const limb = (x1, y1, x2, y2, w, stroke) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`
const shadow = (cx, cy, rx) => ell(cx, cy, rx, rx * 0.3, C.shadow)
const round2 = (n) => Math.round(n * 100) / 100

// ---- 얼굴 부품 ----
function eyes(cx, cy, gap, r) {
  return c(cx - gap, cy, r, C.eye) + c(cx + gap, cy, r, C.eye)
    + c(cx - gap + r * 0.3, cy - r * 0.32, r * 0.34, C.white)
    + c(cx + gap + r * 0.3, cy - r * 0.32, r * 0.34, C.white)
}
function cheeks(cx, cy, gap, r) {
  return c(cx - gap, cy, r, C.cheek, 'opacity="0.7"') + c(cx + gap, cy, r, C.cheek, 'opacity="0.7"')
}
function smile(cx, cy, w, stroke = C.eye) {
  return `<path d="M ${round2(cx - w)} ${cy} Q ${cx} ${round2(cy + w)} ${round2(cx + w)} ${cy}" stroke="${stroke}" stroke-width="${Math.max(2, w * 0.3)}" fill="none" stroke-linecap="round"/>`
}
// 부드러운 3D 느낌의 하이라이트 (머리 좌상단)
function gloss(cx, cy, s) {
  return ell(cx - s * 0.34, cy - s * 0.4, s * 0.32, s * 0.22, 'rgba(255,255,255,0.4)')
}

// ---- 캐릭터: 곰돌이 ----
// (cx, cy)=머리 중심, s=머리 반지름. armWave/armUp 으로 손 들기.
function bear(cx, cy, s, { armWave = false, hold = null } = {}) {
  const by = cy + s * 1.55
  const p = []
  p.push(shadow(cx, by + s * 1.05, s * 1.35))
  // 다리
  p.push(ell(cx - s * 0.45, by + s * 0.95, s * 0.34, s * 0.28, C.bearDark))
  p.push(ell(cx + s * 0.45, by + s * 0.95, s * 0.34, s * 0.28, C.bearDark))
  // 몸
  p.push(ell(cx, by, s * 0.92, s * 1.02, C.bear))
  p.push(ell(cx, by + s * 0.16, s * 0.58, s * 0.7, C.bearLight))
  // 팔
  p.push(limb(cx - s * 0.78, by - s * 0.15, cx - s * 0.98, by + s * 0.5, s * 0.46, C.bear))
  if (armWave) p.push(limb(cx + s * 0.7, by - s * 0.2, cx + s * 1.2, cy + s * 0.05, s * 0.46, C.bear))
  else p.push(limb(cx + s * 0.78, by - s * 0.15, cx + s * 0.98, by + s * 0.5, s * 0.46, C.bear))
  if (hold) p.push(hold)
  // 귀
  for (const dx of [-0.72, 0.72]) {
    p.push(c(cx + s * dx, cy - s * 0.8, s * 0.4, C.bear))
    p.push(c(cx + s * dx, cy - s * 0.8, s * 0.2, C.bearLight))
  }
  // 머리
  p.push(c(cx, cy, s, C.bear))
  p.push(gloss(cx, cy, s))
  p.push(ell(cx, cy + s * 0.3, s * 0.6, s * 0.46, C.bearLight))
  p.push(eyes(cx, cy - s * 0.04, s * 0.34, s * 0.12))
  p.push(ell(cx, cy + s * 0.12, s * 0.13, s * 0.1, C.bearDark))
  p.push(smile(cx, cy + s * 0.34, s * 0.2))
  p.push(cheeks(cx, cy + s * 0.2, s * 0.58, s * 0.15))
  return p.join('')
}

// ---- 캐릭터: 원숭이 ----
function monkey(cx, cy, s, { armDown = false, hold = null } = {}) {
  const by = cy + s * 1.5
  const p = []
  p.push(shadow(cx, by + s * 1.0, s * 1.2))
  p.push(ell(cx, by, s * 0.82, s * 0.96, C.monkey))
  p.push(ell(cx, by + s * 0.12, s * 0.5, s * 0.62, C.monkeyFace))
  // 팔
  p.push(limb(cx - s * 0.72, by - s * 0.1, cx - s * 0.95, by + s * 0.45, s * 0.4, C.monkey))
  if (armDown) p.push(limb(cx + s * 0.6, by - s * 0.2, cx + s * 0.95, cy + s * 1.25, s * 0.4, C.monkey))
  else p.push(limb(cx + s * 0.72, by - s * 0.1, cx + s * 0.95, by + s * 0.45, s * 0.4, C.monkey))
  // 다리
  p.push(ell(cx - s * 0.4, by + s * 0.9, s * 0.28, s * 0.22, C.monkeyDark))
  p.push(ell(cx + s * 0.4, by + s * 0.9, s * 0.28, s * 0.22, C.monkeyDark))
  if (hold) p.push(hold)
  // 귀
  for (const dx of [-0.92, 0.92]) {
    p.push(c(cx + s * dx, cy + s * 0.05, s * 0.32, C.monkey))
    p.push(c(cx + s * dx, cy + s * 0.05, s * 0.17, C.monkeyFace))
  }
  // 머리 + 하트형 얼굴
  p.push(c(cx, cy, s, C.monkey))
  p.push(gloss(cx, cy, s))
  p.push(pth(`M ${cx} ${round2(cy - s * 0.55)} C ${round2(cx - s * 0.95)} ${round2(cy - s * 0.5)} ${round2(cx - s * 0.7)} ${round2(cy + s * 0.85)} ${cx} ${round2(cy + s * 0.78)} C ${round2(cx + s * 0.7)} ${round2(cy + s * 0.85)} ${round2(cx + s * 0.95)} ${round2(cy - s * 0.5)} ${cx} ${round2(cy - s * 0.55)} Z`, C.monkeyFace))
  p.push(eyes(cx, cy - s * 0.02, s * 0.3, s * 0.11))
  p.push(ell(cx, cy + s * 0.26, s * 0.16, s * 0.1, C.monkeyDark, 'opacity="0.5"'))
  p.push(c(cx - s * 0.08, cy + s * 0.22, s * 0.05, C.monkeyDark))
  p.push(c(cx + s * 0.08, cy + s * 0.22, s * 0.05, C.monkeyDark))
  p.push(smile(cx, cy + s * 0.36, s * 0.2))
  p.push(cheeks(cx, cy + s * 0.16, s * 0.52, s * 0.13))
  return p.join('')
}

// ---- 캐릭터: 다람쥐 ----
function squirrel(cx, cy, s, { hold = null } = {}) {
  const by = cy + s * 1.35
  const p = []
  p.push(shadow(cx + s * 0.2, by + s * 0.95, s * 1.15))
  // 풍성한 꼬리
  p.push(pth(`M ${round2(cx + s * 0.5)} ${round2(by + s * 0.4)} C ${round2(cx + s * 2.0)} ${round2(by + s * 0.6)} ${round2(cx + s * 2.0)} ${round2(cy - s * 0.9)} ${round2(cx + s * 0.9)} ${round2(cy - s * 0.6)} C ${round2(cx + s * 1.5)} ${round2(cy - s * 0.2)} ${round2(cx + s * 1.4)} ${round2(by + s * 0.1)} ${round2(cx + s * 0.5)} ${round2(by + s * 0.4)} Z`, C.squirrel))
  p.push(pth(`M ${round2(cx + s * 0.7)} ${round2(by + s * 0.2)} C ${round2(cx + s * 1.5)} ${round2(by + s * 0.2)} ${round2(cx + s * 1.55)} ${round2(cy - s * 0.5)} ${round2(cx + s * 1.0)} ${round2(cy - s * 0.4)} C ${round2(cx + s * 1.2)} ${round2(cy + s * 0.2)} ${round2(cx + s * 1.1)} ${round2(by)} ${round2(cx + s * 0.7)} ${round2(by + s * 0.2)} Z`, C.squirrelLight))
  // 몸
  p.push(ell(cx, by, s * 0.68, s * 0.85, C.squirrel))
  p.push(ell(cx, by + s * 0.1, s * 0.42, s * 0.56, C.squirrelLight))
  // 다리 / 팔
  p.push(ell(cx - s * 0.3, by + s * 0.78, s * 0.24, s * 0.18, C.squirrelDark))
  p.push(ell(cx + s * 0.3, by + s * 0.78, s * 0.24, s * 0.18, C.squirrelDark))
  if (hold) {
    p.push(limb(cx - s * 0.4, by - s * 0.1, cx - s * 0.05, by - s * 0.6, s * 0.34, C.squirrel))
    p.push(limb(cx + s * 0.4, by - s * 0.1, cx + s * 0.05, by - s * 0.6, s * 0.34, C.squirrel))
    p.push(hold)
  } else {
    p.push(limb(cx - s * 0.5, by - s * 0.1, cx - s * 0.62, by + s * 0.35, s * 0.34, C.squirrel))
    p.push(limb(cx + s * 0.5, by - s * 0.1, cx + s * 0.62, by + s * 0.35, s * 0.34, C.squirrel))
  }
  // 귀
  for (const dx of [-0.55, 0.55]) {
    p.push(pth(`M ${round2(cx + s * dx - s * 0.22)} ${round2(cy - s * 0.7)} Q ${round2(cx + s * dx)} ${round2(cy - s * 1.3)} ${round2(cx + s * dx + s * 0.22)} ${round2(cy - s * 0.7)} Z`, C.squirrel))
    p.push(pth(`M ${round2(cx + s * dx - s * 0.12)} ${round2(cy - s * 0.74)} Q ${round2(cx + s * dx)} ${round2(cy - s * 1.1)} ${round2(cx + s * dx + s * 0.12)} ${round2(cy - s * 0.74)} Z`, C.squirrelLight))
  }
  // 머리
  p.push(c(cx, cy, s, C.squirrel))
  p.push(gloss(cx, cy, s))
  p.push(ell(cx, cy + s * 0.32, s * 0.46, s * 0.36, C.squirrelLight))
  p.push(eyes(cx, cy - s * 0.04, s * 0.3, s * 0.11))
  p.push(ell(cx, cy + s * 0.16, s * 0.1, s * 0.08, C.squirrelDark))
  p.push(smile(cx, cy + s * 0.34, s * 0.16))
  p.push(cheeks(cx, cy + s * 0.18, s * 0.52, s * 0.13))
  return p.join('')
}

// ---- 캐릭터: 토끼 ----
function rabbit(cx, cy, s, { armWave = false } = {}) {
  const by = cy + s * 1.5
  const p = []
  p.push(shadow(cx, by + s * 1.0, s * 1.15))
  // 귀
  for (const dx of [-0.34, 0.34]) {
    p.push(ell(cx + s * dx, cy - s * 1.15, s * 0.26, s * 0.7, C.rabbit, `transform="rotate(${dx > 0 ? 12 : -12} ${cx + s * dx} ${cy - s * 0.9})"`))
    p.push(ell(cx + s * dx, cy - s * 1.15, s * 0.13, s * 0.5, C.rabbitEar, `transform="rotate(${dx > 0 ? 12 : -12} ${cx + s * dx} ${cy - s * 0.9})"`))
  }
  // 몸
  p.push(ell(cx, by, s * 0.82, s * 0.96, C.rabbit))
  p.push(ell(cx, by + s * 0.12, s * 0.5, s * 0.6, C.rabbitShade))
  // 다리
  p.push(ell(cx - s * 0.4, by + s * 0.9, s * 0.3, s * 0.22, C.rabbitShade))
  p.push(ell(cx + s * 0.4, by + s * 0.9, s * 0.3, s * 0.22, C.rabbitShade))
  // 팔
  p.push(limb(cx - s * 0.72, by - s * 0.1, cx - s * 0.92, by + s * 0.45, s * 0.42, C.rabbit))
  if (armWave) p.push(limb(cx + s * 0.68, by - s * 0.2, cx + s * 1.15, cy + s * 0.05, s * 0.42, C.rabbit))
  else p.push(limb(cx + s * 0.72, by - s * 0.1, cx + s * 0.92, by + s * 0.45, s * 0.42, C.rabbit))
  // 머리
  p.push(c(cx, cy, s, C.rabbit))
  p.push(gloss(cx, cy, s))
  p.push(eyes(cx, cy - s * 0.02, s * 0.32, s * 0.11))
  p.push(pth(`M ${round2(cx - s * 0.1)} ${round2(cy + s * 0.16)} L ${round2(cx + s * 0.1)} ${round2(cy + s * 0.16)} L ${cx} ${round2(cy + s * 0.3)} Z`, C.rabbitEar))
  p.push(smile(cx, cy + s * 0.36, s * 0.16))
  p.push(cheeks(cx, cy + s * 0.2, s * 0.54, s * 0.13))
  return p.join('')
}

// ---- 과일 소품 ----
function apple(cx, cy, s) {
  return shadow(cx, cy + s * 1.0, s * 0.9)
    + ell(cx, cy, s * 0.92, s * 0.9, C.apple)
    + ell(cx - s * 0.3, cy - s * 0.3, s * 0.26, s * 0.2, '#ff8a7a', 'opacity="0.7"')
    + rct(cx - s * 0.06, cy - s * 1.05, s * 0.12, s * 0.4, '#7a5436', s * 0.06)
    + ell(cx + s * 0.28, cy - s * 0.85, s * 0.28, s * 0.16, C.appleLeaf, `transform="rotate(28 ${cx} ${cy})"`)
}
function banana(cx, cy, s) {
  return pth(`M ${round2(cx - s)} ${round2(cy - s * 0.5)} Q ${round2(cx - s * 0.2)} ${round2(cy + s * 1.15)} ${round2(cx + s * 1.05)} ${round2(cy + s * 0.1)} Q ${round2(cx + s * 0.55)} ${round2(cy + s * 0.5)} ${round2(cx - s * 0.1)} ${round2(cy + s * 0.45)} Q ${round2(cx - s * 0.65)} ${round2(cy + s * 0.3)} ${round2(cx - s)} ${round2(cy - s * 0.5)} Z`, C.banana)
    + pth(`M ${round2(cx - s)} ${round2(cy - s * 0.5)} Q ${round2(cx - s * 0.2)} ${round2(cy + s * 1.15)} ${round2(cx + s * 1.05)} ${round2(cy + s * 0.1)}`, 'none', `stroke="${C.bananaEdge}" stroke-width="${s * 0.16}" stroke-linecap="round"`)
    + c(cx - s, cy - s * 0.5, s * 0.12, C.bananaTip)
}
function grapes(cx, cy, s) {
  const out = [shadow(cx, cy + s * 1.5, s * 1.1)]
  const rows = [[-1, 0], [1, 0], [0, 0], [-0.5, 0.85], [0.5, 0.85], [0, 1.7], [-1.5, 0.85], [1.5, 0.85]]
  out.push(pth(`M ${cx} ${round2(cy - s * 0.6)} q ${round2(s * 0.6)} ${round2(-s * 0.5)} ${round2(s * 0.3)} ${round2(-s * 1.1)}`, 'none', `stroke="#6b4a2e" stroke-width="${s * 0.16}" stroke-linecap="round"`))
  out.push(ell(cx + s * 0.7, cy - s * 1.4, s * 0.5, s * 0.3, C.grapeLeaf, `transform="rotate(20 ${cx} ${cy})"`))
  for (const [dx, dy] of rows) {
    out.push(c(cx + dx * s * 0.78, cy + dy * s * 0.78, s * 0.5, C.grapeDark))
    out.push(c(cx + dx * s * 0.78, cy + dy * s * 0.78, s * 0.46, C.grape))
    out.push(c(cx + dx * s * 0.78 - s * 0.16, cy + dy * s * 0.78 - s * 0.16, s * 0.12, C.white, 'opacity="0.5"'))
  }
  return out.join('')
}

// ---- 배경 부품 ----
function sun(cx, cy, r, color = C.sun, glow = C.sunGlow) {
  let rays = ''
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const x1 = cx + Math.cos(a) * r * 1.35, y1 = cy + Math.sin(a) * r * 1.35
    const x2 = cx + Math.cos(a) * r * 1.7, y2 = cy + Math.sin(a) * r * 1.7
    rays += `<line x1="${round2(x1)}" y1="${round2(y1)}" x2="${round2(x2)}" y2="${round2(y2)}" stroke="${glow}" stroke-width="5" stroke-linecap="round"/>`
  }
  return c(cx, cy, r * 1.6, glow, 'opacity="0.45"') + rays + c(cx, cy, r, color)
}
function cloud(cx, cy, s) {
  return ell(cx, cy + s * 0.4, s * 1.5, s * 0.55, C.cloud)
    + c(cx - s * 0.7, cy + s * 0.1, s * 0.6, C.cloud)
    + c(cx, cy - s * 0.3, s * 0.78, C.cloud)
    + c(cx + s * 0.75, cy + s * 0.05, s * 0.62, C.cloud)
}
function tree(x, y, s, withFruit = null) {
  const p = [shadow(x, y + s * 0.05, s * 0.9)]
  p.push(rct(x - s * 0.16, y - s * 1.5, s * 0.32, s * 1.6, C.trunk, s * 0.1))
  p.push(c(x, y - s * 1.9, s * 0.95, C.leafDark))
  p.push(c(x - s * 0.7, y - s * 1.5, s * 0.7, C.leaf))
  p.push(c(x + s * 0.7, y - s * 1.5, s * 0.72, C.leaf))
  p.push(c(x, y - s * 2.0, s * 0.8, C.leaf))
  p.push(ell(x - s * 0.3, y - s * 2.2, s * 0.4, s * 0.28, C.leafLight, 'opacity="0.7"'))
  if (withFruit === 'apple') {
    const spots = [[-0.5, -1.4], [0.5, -1.5], [0, -2.1], [-0.7, -1.9], [0.7, -1.9], [0.2, -1.3]]
    for (const [dx, dy] of spots) {
      p.push(c(x + dx * s, y + dy * s, s * 0.2, C.apple))
      p.push(c(x + dx * s - s * 0.06, y + dy * s - s * 0.06, s * 0.06, C.white, 'opacity="0.6"'))
    }
  }
  if (withFruit === 'banana') {
    const spots = [[-0.4, -1.5], [0.45, -1.6], [-0.65, -2.0], [0.2, -2.15]]
    for (const [dx, dy] of spots) p.push(banana(x + dx * s, y + dy * s, s * 0.34))
  }
  return p.join('')
}
function flower(x, y, s, color = '#ff8fb3') {
  let pet = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    pet += c(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.62, color)
  }
  return `<g>${pet}${c(x, y, s * 0.55, '#ffe14d')}</g>`
}
function butterfly(x, y, s, color = '#ff9ecb') {
  return ell(x - s * 0.6, y - s * 0.3, s * 0.55, s * 0.7, color)
    + ell(x + s * 0.6, y - s * 0.3, s * 0.55, s * 0.7, color)
    + ell(x - s * 0.55, y + s * 0.55, s * 0.42, s * 0.5, color, 'opacity="0.85"')
    + ell(x + s * 0.55, y + s * 0.55, s * 0.42, s * 0.5, color, 'opacity="0.85"')
    + rct(x - s * 0.08, y - s * 0.6, s * 0.16, s * 1.3, '#5b4632', s * 0.08)
}
function blanket(cx, cy, rx, ry) {
  const p = [ell(cx, cy, rx, ry, '#f7e6c2')]
  p.push(ell(cx, cy, rx, ry, 'none', `stroke="#e85f6a" stroke-width="3" opacity="0.5"`))
  for (let i = -2; i <= 2; i++) {
    p.push(`<line x1="${round2(cx + i * rx * 0.32)}" y1="${round2(cy - ry * 0.92)}" x2="${round2(cx + i * rx * 0.32)}" y2="${round2(cy + ry * 0.92)}" stroke="#e98a92" stroke-width="3" opacity="0.55" clip-path="url(#bl)"/>`)
    p.push(`<line x1="${round2(cx - rx * 0.92)}" y1="${round2(cy + i * ry * 0.34)}" x2="${round2(cx + rx * 0.92)}" y2="${round2(cy + i * ry * 0.34)}" stroke="#e98a92" stroke-width="3" opacity="0.55" clip-path="url(#bl)"/>`)
  }
  const clip = `<clipPath id="bl"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>`
  return clip + p.join('')
}

// ---- 공통 배경 (하늘+언덕+풀밭) ----
function dayBackdrop({ sunX = 70, sunY = 64 } = {}) {
  const gy = 232
  return [
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="1" stop-color="${C.skyBot}"/></linearGradient>`
    + `<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.grass}"/><stop offset="1" stop-color="${C.grassDark}"/></linearGradient></defs>`,
    rct(0, 0, W, H, 'url(#sky)'),
    sun(sunX, sunY, 30),
    cloud(330, 70, 26), cloud(190, 46, 18),
    ell(110, gy + 60, 230, 130, C.hillBack),
    ell(400, gy + 70, 240, 140, C.hillMid),
    pth(`M0 ${gy} Q240 ${gy - 26} 480 ${gy} L480 ${H} L0 ${H} Z`, 'url(#grass)'),
  ].join('')
}
function grassDetail(spots) {
  return spots.map(([x, y]) => `<path d="M ${x} ${y} q -3 -10 0 -16 q 3 6 0 16 M ${x + 5} ${y} q -2 -8 1 -13 q 2 5 -1 13" stroke="${C.grassBlade}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')
}

// ===========================================================================
// 6장면 구성
// ===========================================================================
const scenes = {}

// 1) picnic — 곰돌이와 친구들이 과일나라로 소풍
scenes.picnic = [
  dayBackdrop({ sunX: 408, sunY: 60 }),
  // 멀리 과일나라(사과나무 언덕)
  tree(70, 196, 24, 'apple'),
  tree(430, 200, 22, 'apple'),
  // 길
  pth(`M210 360 Q250 300 235 250 Q225 215 250 196 L280 196 Q258 220 268 252 Q282 305 300 360 Z`, C.path),
  pth(`M210 360 Q250 300 235 250 Q225 215 250 196`, 'none', `stroke="${C.pathEdge}" stroke-width="3"`),
  // 바구니 (곰이 든)
  // 주인공들
  bear(232, 226, 30, { hold: (rct(286, 250, 34, 26, '#c98a4a', 6) + rct(286, 250, 34, 26, 'none', 6, `stroke="#a86f34" stroke-width="2.5"`) + pth('M288 252 Q303 238 318 252', 'none', 'stroke="#a86f34" stroke-width="3"') + apple(296, 248, 6) + apple(310, 250, 6)) }),
  rabbit(330, 250, 22, {}),
  flower(60, 330, 8), flower(120, 345, 7, '#ffd24d'), flower(420, 338, 8, '#b58bff'), flower(460, 320, 7),
  butterfly(150, 150, 11, '#ffb0d4'),
  grassDetail([[30, 300], [400, 320], [180, 340], [350, 350]]),
]

// 2) orchard — 사과나무, 곰돌이가 빨간 사과를 땄어요
scenes.orchard = [
  dayBackdrop({ sunX: 60, sunY: 58 }),
  tree(120, 250, 42, 'apple'),
  tree(380, 256, 46, 'apple'),
  // 떨어진 사과 바구니
  rct(300, 300, 70, 44, '#c98a4a', 10),
  rct(300, 300, 70, 44, 'none', 10, `stroke="#a86f34" stroke-width="3"`),
  apple(318, 300, 11), apple(340, 296, 11), apple(355, 304, 10),
  // 곰돌이 (사과 들고 만세)
  bear(205, 232, 32, { armWave: true, hold: apple(258, 198, 15) }),
  flower(70, 336, 8, '#ff8fb3'), flower(440, 330, 8, '#ffd24d'),
  butterfly(420, 140, 12, '#c4a0ff'),
  grassDetail([[40, 320], [250, 340], [460, 320]]),
]

// 3) monkey — 나무 위 원숭이가 노란 바나나를 건넸어요
scenes.monkey = [
  dayBackdrop({ sunX: 410, sunY: 56 }),
  tree(150, 300, 58, 'banana'),
  // 가지 위 원숭이 (바나나 내밂)
  monkey(150, 150, 26, { armDown: true, hold: banana(196, 232, 20) }),
  // 곰돌이 올려다보며
  bear(330, 244, 30, { armWave: true }),
  flower(380, 338, 8, '#ff8fb3'), flower(60, 340, 7, '#b58bff'),
  butterfly(300, 120, 11, '#ffb0d4'),
  grassDetail([[210, 330], [430, 320], [90, 320]]),
]

// 4) squirrel — 다람쥐가 보라색 포도를 가져왔어요
scenes.squirrel = [
  dayBackdrop({ sunX: 64, sunY: 60 }),
  tree(400, 250, 40),
  // 버섯 악센트
  ell(112, 300, 26, 18, '#e8615f'), c(98, 296, 5, '#fff'), c(122, 290, 4, '#fff'), rct(104, 300, 16, 26, '#fff2dc', 6),
  // 다람쥐 (포도 한 송이 안고 폴짝)
  squirrel(220, 214, 30, { hold: grapes(222, 250, 13) }),
  // 곰돌이
  bear(360, 250, 26, {}),
  flower(60, 344, 8, '#ffd24d'), flower(300, 344, 7, '#ff8fb3'),
  butterfly(150, 130, 11, '#c4a0ff'),
  grassDetail([[40, 326], [280, 340], [440, 320]]),
]

// 5) share — 셋이 돗자리에서 사이좋게 나눠 먹어요 (냠냠)
scenes.share = [
  dayBackdrop({ sunX: 240, sunY: 52 }),
  blanket(240, 300, 170, 56),
  // 가운데 과일들
  apple(200, 292, 14), banana(245, 296, 18), grapes(295, 280, 11),
  // 셋이 둘러앉기
  bear(110, 214, 28, {}),
  monkey(240, 200, 24, {}),
  squirrel(372, 214, 26, {}),
  flower(40, 200, 8, '#ff8fb3'), flower(450, 196, 8, '#ffd24d'),
  butterfly(400, 110, 12, '#ffb0d4'),
]

// 6) bye — 노을 속에서 손 흔들며 인사 (내일 또 놀자)
scenes.bye = [
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sunsetTop}"/><stop offset="0.55" stop-color="${C.sunsetMid}"/><stop offset="1" stop-color="${C.sunsetBot}"/></linearGradient>`
  + `<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf9f6a"/><stop offset="1" stop-color="#b9854f"/></linearGradient></defs>`,
  rct(0, 0, W, H, 'url(#sky)'),
  sun(240, 150, 46, C.sunset, '#ffd9a0'),
  cloud(360, 80, 24, ), cloud(110, 64, 18),
  ell(110, 300, 230, 130, '#d7a96f'),
  ell(400, 310, 240, 140, '#caa063'),
  pth(`M0 244 Q240 220 480 244 L480 360 L0 360 Z`, 'url(#grass)'),
  // 별 몇 개
  ...[[60, 50], [420, 46], [300, 40]].map(([x, y]) => pth(`M ${x} ${y - 6} L ${x + 1.8} ${y - 1.8} L ${x + 6} ${y} L ${x + 1.8} ${y + 1.8} L ${x} ${y + 6} L ${x - 1.8} ${y + 1.8} L ${x - 6} ${y} L ${x - 1.8} ${y - 1.8} Z`, '#fff3c4')),
  // 친구들 손 흔들기
  bear(110, 232, 27, { armWave: true }),
  monkey(232, 224, 23, {}),
  squirrel(348, 236, 25, {}),
  rabbit(430, 236, 20, { armWave: true }),
  butterfly(180, 120, 10, '#ffc4a0'),
]

function svg(body) {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
}

mkdirSync('public/img/scene', { recursive: true })
for (const [name, parts] of Object.entries(scenes)) {
  writeFileSync(`public/img/scene/${name}.svg`, svg(parts.join('')))
}
console.log(`scene illustrations generated: ${Object.keys(scenes).join(', ')}`)
