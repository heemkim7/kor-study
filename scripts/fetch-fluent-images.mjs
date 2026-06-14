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
  // 탈것
  train: 'Locomotive',
  airplane: 'Airplane',
  // 색깔
  red: 'Red circle',
  blue: 'Blue circle',
  yellow: 'Yellow circle',
  // 가족
  mom: 'Woman',
  dad: 'Man',
  baby: 'Baby',
  // 동물 더
  bear: 'Bear',
  lion: 'Lion',
  tiger: 'Tiger face',
  elephant: 'Elephant',
  monkey: 'Monkey face',
  penguin: 'Penguin',
  bird: 'Bird',
  fish: 'Fish',
  pig: 'Pig face',
  frog: 'Frog',
  // 과일 더
  strawberry: 'Strawberry',
  watermelon: 'Watermelon',
  tangerine: 'Tangerine',
  lemon: 'Lemon',
  peach: 'Peach',
  // 음식
  rice: 'Cooked rice',
  bread: 'Bread',
  milk: 'Glass of milk',
  candy: 'Candy',
  cake: 'Shortcake',
  egg: 'Egg',
  icecream: 'Soft ice cream',
  cookie: 'Cookie',
  // 몸
  hand: 'Hand with fingers splayed',
  foot: 'Foot',
  eye: 'Eye',
  nose: 'Nose',
  ear: 'Ear',
  mouth: 'Mouth',
  // 옷
  hat: 'Billed cap',
  shoes: 'Running shoe',
  socks: 'Socks',
  gloves: 'Gloves',
  // 자연 더
  sun: 'Sun',
  cloud: 'Cloud',
  rain: 'Cloud with rain',
  tree: 'Deciduous tree',
  mountain: 'Mountain',
  rainbow: 'Rainbow',
  // 탈것 더
  boat: 'Sailboat',
  bike: 'Bicycle',
  rocket: 'Rocket',
  truck: 'Delivery truck',
  // 집·사물
  house: 'House',
  chair: 'Chair',
  bed: 'Bed',
  clock: 'Alarm clock',
  book: 'Open book',
  // 색깔 더
  green: 'Green circle',
  purple: 'Purple circle',
  white: 'White circle',
  black: 'Black circle',
  brown: 'Brown circle',
}

const PNG_MAGIC = [137, 80, 78, 71]
const file3d = (folder) => folder.toLowerCase().replace(/[ -]/g, '_') + '_3d.png'

function urls(folder) {
  const f = encodeURIComponent(folder)
  const name = file3d(folder)
  const base = folder.toLowerCase().replace(/[ -]/g, '_')
  const nameDefault = base + '_3d_default.png' // 스킨톤 이모지는 Default 하위폴더
  const paths = [`${f}/3D/${name}`, `${f}/Default/3D/${nameDefault}`]
  const cdns = [
    (p) => `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${p}`,
    (p) => `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${p}`,
  ]
  return paths.flatMap((p) => cdns.map((cdn) => cdn(p)))
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
console.log(`\n${Object.keys(MAP).length}개 단어 그림 모두 받음.`)
