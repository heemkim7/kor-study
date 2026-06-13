// 단어 그림을 Microsoft Fluent Emoji(3D, MIT 라이선스)에서 받아 public/img/fluent 에 저장.
// 사용: node scripts/fetch-fluent-images.mjs   (프로젝트 루트에서 실행)
import { writeFileSync, mkdirSync } from 'node:fs'

// word id -> Fluent Emoji 에셋 폴더명 (CLDR 이름)
const MAP = {
  apple: 'Red apple',
  banana: 'Banana',
  grape: 'Grapes',
  dog: 'Dog face',
  cat: 'Cat face',
  rabbit: 'Rabbit face',
  car: 'Automobile',
  bus: 'Bus',
  star: 'Star',
  moon: 'Crescent moon',
  flower: 'Cherry blossom',
  ball: 'Soccer ball',
}

const PNG_MAGIC = [137, 80, 78, 71]
const file3d = (folder) => folder.toLowerCase().replace(/[ -]/g, '_') + '_3d.png'

function urls(folder) {
  const f = encodeURIComponent(folder)
  const name = file3d(folder)
  return [
    `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${f}/3D/${name}`,
    `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${f}/3D/${name}`,
  ]
}

async function tryDownload(folder) {
  for (const url of urls(folder)) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length > 1000 && PNG_MAGIC.every((b, i) => buf[i] === b)) return buf
    } catch {
      /* try next url */
    }
  }
  return null
}

mkdirSync('public/img/fluent', { recursive: true })
const fails = []
for (const [id, folder] of Object.entries(MAP)) {
  const buf = await tryDownload(folder)
  if (buf) {
    writeFileSync(`public/img/fluent/${id}.png`, buf)
    console.log(`ok   ${id}  <- ${folder} (${(buf.length / 1024).toFixed(0)} KB)`)
  } else {
    fails.push(`${id} (${folder})`)
    console.warn(`FAIL ${id}  <- ${folder}`)
  }
}
if (fails.length) {
  console.error('\n실패:', fails.join(', '))
  process.exit(1)
}
console.log('\n12개 단어 그림 모두 받음.')
