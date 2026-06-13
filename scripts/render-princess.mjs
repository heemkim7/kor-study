// 공주 피규어를 outfit 조합별로 한 장의 대조 시트(PNG)로 래스터화해 시각 검증.
// (개발 검증 전용 — 커밋되지 않음.)  Node 24가 figure.ts의 타입을 자동 제거.
//   node scripts/render-princess.mjs  → .preview/princess-sheet.png, princess-default.png
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { buildPrincessSvg } from '../src/princess/figure.ts'

mkdirSync('.preview', { recursive: true })

// 대조 시트용 셀 목록(ASCII 라벨 — resvg 한글 폰트 의존 회피)
const cells = [
  { label: 'DEFAULT', o: {} },
  { label: 'dress-blue', o: { dress: 'dress-blue' } },
  { label: 'dress-purple', o: { dress: 'dress-purple' } },
  { label: 'dress-mint', o: { dress: 'dress-mint' } },
  { label: 'dress-peach', o: { dress: 'dress-peach' } },
  { label: 'dress-red', o: { dress: 'dress-red' } },
  { label: 'hair-brown', o: { hair: 'hair-brown' } },
  { label: 'hair-pink', o: { hair: 'hair-pink' } },
  { label: 'hair-black', o: { hair: 'hair-black' } },
  { label: 'hair-blue', o: { hair: 'hair-blue' } },
  { label: 'crown-flower', o: { crown: 'crown-flower' } },
  { label: 'crown-star', o: { crown: 'crown-star' } },
  { label: 'crown-heart', o: { crown: 'crown-heart' } },
  { label: 'acc-necklace', o: { accessory: 'acc-necklace' } },
  { label: 'acc-wand', o: { accessory: 'acc-wand' } },
  { label: 'acc-wings', o: { accessory: 'acc-wings' } },
  { label: 'COMBO-A', o: { dress: 'dress-blue', hair: 'hair-brown', crown: 'crown-star', accessory: 'acc-wand' } },
  { label: 'COMBO-B', o: { dress: 'dress-purple', hair: 'hair-pink', crown: 'crown-heart', accessory: 'acc-wings' } },
  { label: 'COMBO-C', o: { dress: 'dress-mint', hair: 'hair-black', crown: 'crown-flower', accessory: 'acc-necklace' } },
  { label: 'COMBO-D', o: { dress: 'dress-red', hair: 'hair-blue', crown: 'crown-gold', accessory: 'acc-wings' } },
]

const COLS = 5, CW = 170, CH = 290, PAD = 8, LABEL_H = 18
const scale = (CW - PAD * 2) / 380
const rows = Math.ceil(cells.length / COLS)
const SW = COLS * CW, SH = rows * CH

const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
const parts = [`<rect width="${SW}" height="${SH}" fill="#fbeef5"/>`]
cells.forEach((cell, i) => {
  const cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * CH
  const svg = buildPrincessSvg(cell.o, { idPrefix: `c${i}`, background: true, animate: false })
  parts.push(`<g transform="translate(${cx + PAD} ${cy + PAD}) scale(${scale})">${inner(svg)}</g>`)
  parts.push(`<text x="${cx + CW / 2}" y="${cy + CH - LABEL_H / 2}" font-family="monospace" font-size="13" fill="#5b4632" text-anchor="middle">${cell.label}</text>`)
})
const sheet = `<svg viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`
writeFileSync('.preview/princess-sheet.png', new Resvg(sheet, { fitTo: { mode: 'width', value: SW } }).render().asPng())

// 기본 공주 단독(크게)
const def = buildPrincessSvg({}, { idPrefix: 'def', background: true, animate: false })
writeFileSync('.preview/princess-default.png', new Resvg(def, { fitTo: { mode: 'width', value: 380 } }).render().asPng())

// 디테일 시트 — 정교한 아이템(왕관/액세서리) 크게
const detail = [
  { label: 'crown-flower', o: { crown: 'crown-flower' } },
  { label: 'crown-star', o: { crown: 'crown-star' } },
  { label: 'crown-heart', o: { crown: 'crown-heart' } },
  { label: 'acc-necklace', o: { accessory: 'acc-necklace' } },
  { label: 'acc-wand', o: { accessory: 'acc-wand' } },
  { label: 'acc-wings', o: { accessory: 'acc-wings' } },
]
const DCOLS = 3, DCW = 300, DCH = 500, DSCALE = (DCW - 16) / 380
const DROWS = Math.ceil(detail.length / DCOLS)
const dparts = [`<rect width="${DCOLS * DCW}" height="${DROWS * DCH}" fill="#fbeef5"/>`]
detail.forEach((cell, i) => {
  const cx = (i % DCOLS) * DCW, cy = Math.floor(i / DCOLS) * DCH
  const svg = buildPrincessSvg(cell.o, { idPrefix: `d${i}`, background: true, animate: false })
  dparts.push(`<g transform="translate(${cx + 8} ${cy + 8}) scale(${DSCALE})">${inner(svg)}</g>`)
  dparts.push(`<text x="${cx + DCW / 2}" y="${cy + DCH - 12}" font-family="monospace" font-size="18" fill="#5b4632" text-anchor="middle">${cell.label}</text>`)
})
const dsheet = `<svg viewBox="0 0 ${DCOLS * DCW} ${DROWS * DCH}" xmlns="http://www.w3.org/2000/svg">${dparts.join('')}</svg>`
writeFileSync('.preview/princess-detail.png', new Resvg(dsheet, { fitTo: { mode: 'width', value: DCOLS * DCW } }).render().asPng())

console.log(`rendered ${cells.length} outfits → .preview/princess-sheet.png + princess-default.png + princess-detail.png`)
