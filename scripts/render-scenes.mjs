// 장면 SVG를 PNG로 래스터화해 시각 검증용으로 .preview/scenes/ 에 저장.
// (개발 검증 전용 — 커밋되지 않음. 미리보기 스크린샷 툴 대체)
//   node scripts/render-scenes.mjs
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'

const SRC = 'public/img/scene'
const OUT = '.preview/scenes'
mkdirSync(OUT, { recursive: true })

for (const f of readdirSync(SRC).filter((n) => n.endsWith('.svg'))) {
  const svg = readFileSync(`${SRC}/${f}`, 'utf8')
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 480 }, background: '#ffffff' })
  writeFileSync(`${OUT}/${f.replace('.svg', '.png')}`, resvg.render().asPng())
}
console.log('rendered scenes →', OUT)
