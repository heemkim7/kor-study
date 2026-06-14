// 색깔 단어 이미지를 '정확한 색의 단색 원'으로 생성(비용 0). Fluent 색구체가 색을
// 충실히 표현 못 해(하양=연보라 등) 색 학습이 안 되는 문제 해결.
//   node scripts/gen-color-words.mjs
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'node:fs'

const COLORS = {
  red: '#e23b3b', blue: '#3b82e2', yellow: '#ffd23e', green: '#43b04a',
  purple: '#9b5fc0', white: '#ffffff', black: '#2e2e2e', brown: '#8a5a3c',
}
const S = 200, cx = 100, cy = 100, r = 82
for (const [name, col] of Object.entries(COLORS)) {
  const svg = `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" stroke="rgba(0,0,0,0.16)" stroke-width="4"/>` +
    `<ellipse cx="${cx - 24}" cy="${cy - 28}" rx="30" ry="20" fill="#ffffff" opacity="0.28"/>` +
    `</svg>`
  writeFileSync(`public/img/fluent/${name}.png`, new Resvg(svg, { fitTo: { mode: 'width', value: 240 } }).render().asPng())
}
console.log('색깔 단어 이미지 생성:', Object.keys(COLORS).join(', '))
