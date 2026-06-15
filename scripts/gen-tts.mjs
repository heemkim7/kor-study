// 로컬 TTS(localhost:8001)로 앱의 모든 멘트를 mp3로 생성하고 recordings.generated.ts 갱신.
// 멱등: 이미 있는 mp3는 건너뜀(재실행하면 새 문장만 생성). ffmpeg로 48k 모노 압축.
//   node scripts/gen-tts.mjs              (전체)
//   TTS_LIMIT=2 node scripts/gen-tts.mjs  (스모크 테스트: 앞 2개만)
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { WORDS } from '../src/content/words.ts'
import { LESSONS } from '../src/content/lessons.ts'
import { CATALOG } from '../src/princess/catalog.ts'
import { STICKERS } from '../src/reward/stickers.ts'
import { LETTER_LESSONS, glyphSound } from '../src/content/letters.ts'
import { NUMBER_LESSONS, numberName } from '../src/content/numbers.ts'
import { toSyllables } from '../src/hangul/decompose.ts'

const TTS_URL = 'http://localhost:8001/generate/'
const OUT_DIR = 'public/audio/tts'
const GEN_FILE = 'src/tts/recordings.generated.ts'
mkdirSync(OUT_DIR, { recursive: true })

// djb2 해시 → base36 (텍스트별 안정 파일명)
function slug(text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0
  return h.toString(36)
}

// ---- 멘트 수집(중복 제거) ----
const set = new Set()
const add = (t) => { const s = (t || '').trim(); if (s) set.add(s) }

for (const w of WORDS) add(w.text)
for (const l of LESSONS) for (const sc of l.story) add(sc.text)
for (const it of CATALOG) add(it.name)
for (const s of STICKERS) add(s.name)
// 글자 트랙: 자모/음절 음가(모음은 '아', 음절은 '가'). 받침 음절(강·산·밤…)도 포함.
for (const l of LETTER_LESSONS) for (const g of l.glyphs) add(glyphSound(g))
// 수개념 트랙: 수사(하나~열)
for (const l of NUMBER_LESSONS) for (const n of l.numbers) add(numberName(n))
const syl = new Set()
for (const l of LESSONS) for (const id of l.targetWords) {
  const w = WORDS.find((x) => x.id === id)
  if (w) syl.add(toSyllables(w.text)[0])
}
for (const s of syl) { add(s); add(`${s} 글자를 찾아요`) }
for (const t of [
  '다시 들어볼까?', '다시 골라볼까?', '다시 찾아볼까?', '다시 해볼까?',
  '참 잘했어요! 스티커를 받았어요.', '참 잘했어요!',
  '공주님을 예쁘게 꾸며요', '별이 조금 더 필요해요', '짠! 새로운 공주님',
  '기본 공주님', '아이템을 모두 모았어요', '먼저 앞 단계를 끝내요',
  // 게임 진입 안내
  '잘 듣고 같은 그림을 찾아요', '그림을 보고 맞는 글자를 골라요', '글자 카드로 단어를 만들어요',
  '같은 글자를 모두 찾아요', '같은 짝을 맞춰보세요', '오늘 배울 단어예요',
  // 꾸미기 구매/뽑기 안내
  '이걸 살까요?', '샀어요!', '뽑기 할까요?', '두구두구',
  // 스티커북 · 그림판 안내
  '스티커 책이에요. 모은 스티커를 눌러 보세요', '자유롭게 그려 보세요',
  // 글자 게임 안내
  '글자를 들어 보세요', '잘 듣고 같은 글자를 찾아요', '자음과 모음을 골라 글자를 만들어요', '먼저 앞 글자를 배워요',
  '손가락으로 글자를 따라 써 보세요',
  // 수개념 게임 안내
  '숫자를 세어 보세요', '몇 개일까요? 세어 보세요', '다시 세어 볼까?', '어느 쪽이 더 많을까요?', '많아요!', '다시 볼까?', '먼저 앞 숫자를 배워요',
  // 허브
  '영어는 곧 만나요',
]) add(t)

const phrases = [...set]
const LIMIT = process.env.TTS_LIMIT ? parseInt(process.env.TTS_LIMIT, 10) : phrases.length
console.log(`총 ${phrases.length}개 멘트 (이번 실행 최대 ${LIMIT}개)`)

async function genOne(text) {
  const id = slug(text)
  const mp3 = `${OUT_DIR}/${id}.mp3`
  const webPath = `/audio/tts/${id}.mp3`
  if (existsSync(mp3)) return { path: webPath, skipped: true }
  const res = await fetch(TTS_URL, { method: 'POST', body: new URLSearchParams({ text }), signal: AbortSignal.timeout(180000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 100) throw new Error('빈 응답')
  const wav = `${OUT_DIR}/_tmp_${id}.wav`
  writeFileSync(wav, buf)
  execFileSync('ffmpeg', ['-y', '-i', wav, '-ac', '1', '-b:a', '48k', mp3], { stdio: 'ignore' })
  unlinkSync(wav)
  return { path: webPath, skipped: false }
}

const map = {}
let done = 0, made = 0
const failed = []
for (const text of phrases.slice(0, LIMIT)) {
  try {
    const r = await genOne(text)
    map[text] = r.path
    if (!r.skipped) made++
  } catch (e) {
    failed.push(text)
    console.warn('FAIL:', JSON.stringify(text), e.message)
  }
  if (++done % 10 === 0) console.log(`  ${done}/${LIMIT} (새로 생성 ${made}, 실패 ${failed.length})`)
}

// 기존 생성본과 병합(부분 실행 누적)
let prev = {}
if (existsSync(GEN_FILE)) {
  const m = readFileSync(GEN_FILE, 'utf8').match(/=\s*(\{[\s\S]*\})\s*$/m)
  if (m) { try { prev = JSON.parse(m[1]) } catch { /* 무시 */ } }
}
const merged = { ...prev, ...map }
const sorted = Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]))
writeFileSync(GEN_FILE, `// 자동 생성됨 — scripts/gen-tts.mjs. 직접 수정 금지. (텍스트 → mp3 경로)
export const GENERATED_RECORDINGS: Record<string, string> = ${JSON.stringify(sorted, null, 2)}
`)
console.log(`\n완료: 총 ${Object.keys(merged).length} 매핑 / 이번에 새로 ${made}개 / 실패 ${failed.length}`)
if (failed.length) console.log('실패:', failed.map((t) => JSON.stringify(t)).join(' '))
