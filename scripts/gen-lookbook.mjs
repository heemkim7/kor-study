// 공주 꾸미기 룩북 — 보여주기용. 인라인 위젯 HTML + 대조 PNG 생성.
//   node scripts/gen-lookbook.mjs
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { buildPrincessSvg } from '../src/princess/figure.ts'

mkdirSync('.preview', { recursive: true })

const looks = [
  { o: {}, label: '기본 공주' },
  { o: { dress: 'dress-blue', crown: 'crown-star', accessory: 'acc-wand' }, label: '하늘 드레스 · 별 왕관 · 요술봉' },
  { o: { dress: 'dress-purple', hair: 'hair-pink', crown: 'crown-heart', accessory: 'acc-wings' }, label: '보라 드레스 · 분홍 머리 · 하트 왕관 · 날개' },
  { o: { dress: 'dress-mint', hair: 'hair-brown', crown: 'crown-flower', accessory: 'acc-necklace' }, label: '민트 드레스 · 꽃 화관 · 목걸이' },
  { o: { dress: 'dress-red', hair: 'hair-black' }, label: '빨강 드레스 · 검정 머리' },
  { o: { dress: 'dress-peach', hair: 'hair-blue', crown: 'crown-star' }, label: '복숭아 · 하늘 머리 · 별 왕관' },
]

// 1) 인라인 위젯 HTML (브라우저 렌더 → 한글·애니메이션 정상)
const cards = looks.map((l, i) => {
  const svg = buildPrincessSvg(l.o, { idPrefix: `lb${i}`, background: true, animate: true })
  return `<div class="card"><div class="fig">${svg}</div><div class="cap">${l.label}</div></div>`
}).join('')
const widget = `<div class="lookbook">
<h2>공주 꾸미기 미리보기 👗</h2>
<p class="sub">별 ⭐을 모아 옷·머리·왕관·아이템을 모아요 — 19종 · 480가지 조합</p>
<div class="grid">${cards}</div>
<style>
.lookbook{font-family:system-ui,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;text-align:center;color:#5b4632}
.lookbook h2{font-size:22px;margin:0 0 4px}
.lookbook .sub{color:#a98a6a;font-size:14px;margin:0 0 16px}
.lookbook .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.lookbook .card{background:#fff;border-radius:18px;box-shadow:0 8px 22px rgba(180,120,60,.14);padding:10px 8px 12px}
.lookbook .fig{width:100%;max-width:150px;margin:0 auto}
.lookbook .fig svg{width:100%;height:auto;display:block}
.lookbook .cap{font-size:13px;font-weight:700;color:#ef6aa6;margin-top:6px;line-height:1.25}
</style></div>`
writeFileSync('.preview/lookbook-widget.html', widget)

// 2) 대조 PNG (resvg — 라벨 없이 깔끔 타일). 각 피규어는 자체 분홍 배경 카드.
const COLS = 3, CW = 200, CH = 320, PAD = 10
const scale = (CW - PAD * 2) / 380
const rows = Math.ceil(looks.length / COLS)
const SW = COLS * CW, SH = rows * CH
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
const parts = [`<rect width="${SW}" height="${SH}" fill="#fdeef6"/>`]
looks.forEach((l, i) => {
  const cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * CH
  const svg = buildPrincessSvg(l.o, { idPrefix: `p${i}`, background: true, animate: false })
  parts.push(`<g transform="translate(${cx + PAD} ${cy + PAD}) scale(${scale})">${inner(svg)}</g>`)
})
const sheet = `<svg viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`
writeFileSync('.preview/princess-lookbook.png', new Resvg(sheet, { fitTo: { mode: 'width', value: SW } }).render().asPng())

console.log('lookbook → .preview/lookbook-widget.html + princess-lookbook.png')
