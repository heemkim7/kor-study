# 한글 놀이 웹앱 — Milestone 1 구현 계획 (기반 + 핵심 학습 루프)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 태블릿용 한글 놀이 PWA의 수직 슬라이스 — "오늘의 모험"(이야기 → 오늘의 단어 → 놀이 2종 → 칭찬·스티커)을 끝까지 플레이할 수 있는, 설치 가능한 오프라인 웹앱을 만든다.

**Architecture:** 서버 없는 React 정적 SPA. 순수 로직(한글 분해·콘텐츠 검증·보상 계산·음성 선택)은 부수효과 없는 모듈로 분리해 TDD로 검증하고, React 컴포넌트는 그 위에 얇게 얹는다. 진행상황은 localStorage. 음성은 브라우저 Web Speech API. 단어 그림은 번들 PNG.

**Tech Stack:** Vite + React + TypeScript, Vitest + @testing-library/react (jsdom), vite-plugin-pwa, CSS 변수 디자인 토큰, Pretendard/Gowun Dodum 폰트(번들).

> 관련 스펙: `docs/superpowers/specs/2026-06-13-hangeul-play-design.md`

---

## 파일 구조 (M1에서 생성)

```
package.json, vite.config.ts, tsconfig.json, index.html
public/
  manifest.webmanifest
  icons/icon-192.png, icon-512.png
  img/fluent/<word>.png          # 단어 그림(샘플 12개)
  img/scene/<scene>.png          # 이야기 장면(샘플 3개)
src/
  main.tsx                       # 진입점
  app/
    App.tsx                      # 루트, 컨텍스트 프로바이더 + 화면 라우팅
    Navigation.tsx               # 화면 상태 컨텍스트 (home/adventure)
    Home.tsx                     # 홈 화면
    Adventure.tsx                # "오늘의 모험" 오케스트레이터 (이야기→단어→놀이→보상)
  hangul/
    decompose.ts                 # 한글 자모·음절 분해 (순수)
    decompose.test.ts
  content/
    types.ts                     # Word, Lesson, GameId, Theme 등 타입
    words.ts                     # 시작 단어 12개
    lessons.ts                   # 시작 레슨 1개
    loader.ts                    # 조회·검증 (순수)
    loader.test.ts
  image/
    resolveImage.ts              # WordImage → src 경로 (순수)
    resolveImage.test.ts
  tts/
    pickVoice.ts                 # 한국어 음성 선택 (순수)
    pickVoice.test.ts
    useTts.ts                    # 음성 재생 훅
  progress/
    progress.ts                  # 진행상황 순수 리듀서 함수
    progress.test.ts
    storage.ts                   # localStorage 로드/저장
    useProgress.tsx              # 컨텍스트 + 훅
  games/
    choices.ts                   # 보기 생성 (순수)
    choices.test.ts
    ListenFind.tsx               # 듣고 그림 찾기
    PickWord.tsx                 # 그림 보고 단어 고르기
  story/
    StoryPlayer.tsx              # 이야기 장면+자막+강조+TTS
    highlight.ts                 # 자막 내 타겟 단어 분할 (순수)
    highlight.test.ts
    TodayWords.tsx               # 오늘의 단어 화면
  reward/
    RewardScreen.tsx             # 칭찬·스티커 획득 화면
  ui/
    WordImage.tsx                # 단어 그림 표시
    SpeakerButton.tsx            # 다시 듣기 버튼
    Sparkles.tsx                 # 정답 반짝임 효과
  styles/
    tokens.css                   # 디자인 토큰(색·폰트·반경)
    global.css
```

설계 원칙: 순수 로직(`hangul`, `content/loader`, `image`, `tts/pickVoice`, `progress`, `games/choices`, `story/highlight`)은 React와 무관하게 단독 테스트. 컴포넌트는 이 모듈을 호출만.

---

## Task 0: 프로젝트 뼈대

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/app/App.tsx`

- [ ] **Step 1: Vite 프로젝트 생성 및 의존성 설치**

Run:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D vite-plugin-pwa
npm install pretendard @fontsource/gowun-dodum
```
Expected: `node_modules` 생성, `package.json`에 의존성 등록. (현재 폴더가 비어있지 않다는 경고가 나오면 진행 후 생성된 기본 `src` 샘플은 이후 단계에서 교체.)

- [ ] **Step 2: vitest 설정을 `vite.config.ts`에 추가**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // public/manifest.webmanifest 사용
      workbox: { globPatterns: ['**/*.{js,css,html,png,webmanifest,woff2}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 3: 테스트 setup 파일 생성**

Create `src/test-setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: package.json 스크립트 추가**

`package.json`의 `"scripts"`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest",
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview"
```

- [ ] **Step 5: 디자인 토큰 작성**

Create `src/styles/tokens.css`:
```css
:root {
  --c-bg-1: #fff7ec;
  --c-bg-2: #ffeede;
  --c-card: #ffffff;
  --c-accent: #f0a04b;
  --c-accent-strong: #e8852b;
  --c-correct: #22a06b;
  --c-pink: #ef6aa6;
  --c-ink: #5b4632;
  --c-ink-soft: #a98a6a;
  --radius-lg: 22px;
  --radius-md: 16px;
  --shadow-card: 0 8px 22px rgba(180,120,60,.14);
  --font-base: 'Pretendard', system-ui, sans-serif;
  --font-warm: 'Gowun Dodum', 'Pretendard', sans-serif;
}
```

Create `src/styles/global.css`:
```css
@import 'pretendard/dist/web/static/pretendard.css';
@import '@fontsource/gowun-dodum/400.css';
@import './tokens.css';

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body {
  font-family: var(--font-base);
  background: linear-gradient(170deg, var(--c-bg-1), var(--c-bg-2));
  color: var(--c-ink);
  -webkit-font-smoothing: antialiased;
  user-select: none;
  touch-action: manipulation;
}
button { font-family: inherit; cursor: pointer; }
```

- [ ] **Step 6: 진입점과 빈 App 작성**

Create `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
```

Create `src/app/App.tsx` (임시):
```tsx
export function App() {
  return <div style={{ padding: 24 }}>한글 놀이 — 준비 중</div>
}
```

`index.html`의 `<body>`가 `<div id="root"></div>`와 `<script type="module" src="/src/main.tsx">`를 포함하는지 확인.

- [ ] **Step 7: 빌드/실행 확인**

Run: `npm run dev`
Expected: 로컬 서버가 뜨고 "한글 놀이 — 준비 중" 표시.

- [ ] **Step 8: 커밋**

```bash
git init
git add -A
git commit -m "chore: scaffold vite react ts pwa project with design tokens"
```

---

## Task 1: 한글 분해 모듈 (순수, TDD)

**Files:**
- Create: `src/hangul/decompose.ts`
- Test: `src/hangul/decompose.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/hangul/decompose.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isHangulSyllable, decomposeSyllable, toSyllables, toJamo, getChoseong } from './decompose'

describe('isHangulSyllable', () => {
  it('완성형 한글이면 true, 그 외 false', () => {
    expect(isHangulSyllable('사')).toBe(true)
    expect(isHangulSyllable('A')).toBe(false)
    expect(isHangulSyllable('ㄱ')).toBe(false)
  })
})

describe('decomposeSyllable', () => {
  it('초성/중성/종성으로 분해', () => {
    expect(decomposeSyllable('사')).toEqual({ cho: 'ㅅ', jung: 'ㅏ', jong: '' })
    expect(decomposeSyllable('곰')).toEqual({ cho: 'ㄱ', jung: 'ㅗ', jong: 'ㅁ' })
  })
  it('한글이 아니면 null', () => {
    expect(decomposeSyllable('x')).toBeNull()
  })
})

describe('toSyllables', () => {
  it('음절 배열로 분리', () => {
    expect(toSyllables('사과')).toEqual(['사', '과'])
  })
})

describe('toJamo', () => {
  it('복합 모음을 기본 자모로 분리', () => {
    expect(toJamo('사과', { splitCompound: true })).toEqual(['ㅅ', 'ㅏ', 'ㄱ', 'ㅗ', 'ㅏ'])
  })
  it('기본은 복합 자모 유지', () => {
    expect(toJamo('과')).toEqual(['ㄱ', 'ㅘ'])
  })
})

describe('getChoseong', () => {
  it('각 음절의 초성', () => {
    expect(getChoseong('사과')).toEqual(['ㅅ', 'ㄱ'])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- decompose`
Expected: FAIL ("Cannot find module './decompose'")

- [ ] **Step 3: 구현 작성**

Create `src/hangul/decompose.ts`:
```ts
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const BASE = 0xac00
const LAST = 0xd7a3

const COMPOUND: Record<string, string[]> = {
  'ㅘ': ['ㅗ','ㅏ'], 'ㅙ': ['ㅗ','ㅐ'], 'ㅚ': ['ㅗ','ㅣ'], 'ㅝ': ['ㅜ','ㅓ'],
  'ㅞ': ['ㅜ','ㅔ'], 'ㅟ': ['ㅜ','ㅣ'], 'ㅢ': ['ㅡ','ㅣ'],
  'ㄲ': ['ㄱ','ㄱ'], 'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'],
  'ㄺ': ['ㄹ','ㄱ'], 'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'],
  'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'], 'ㅄ': ['ㅂ','ㅅ'],
}

export function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return code >= BASE && code <= LAST
}

export function decomposeSyllable(ch: string): { cho: string; jung: string; jong: string } | null {
  if (!isHangulSyllable(ch)) return null
  const code = ch.charCodeAt(0) - BASE
  return {
    cho: CHO[Math.floor(code / 588)],
    jung: JUNG[Math.floor((code % 588) / 28)],
    jong: JONG[code % 28],
  }
}

export function toSyllables(text: string): string[] {
  return Array.from(text)
}

function splitBasic(j: string): string[] {
  return COMPOUND[j] ?? [j]
}

export function toJamo(text: string, opts: { splitCompound?: boolean } = {}): string[] {
  const out: string[] = []
  for (const ch of toSyllables(text)) {
    const d = decomposeSyllable(ch)
    if (!d) { out.push(ch); continue }
    const parts = [d.cho, d.jung, ...(d.jong ? [d.jong] : [])]
    for (const p of parts) out.push(...(opts.splitCompound ? splitBasic(p) : [p]))
  }
  return out
}

export function getChoseong(text: string): string[] {
  return toSyllables(text).map((ch) => decomposeSyllable(ch)?.cho ?? ch)
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- decompose`
Expected: PASS (모든 케이스)

- [ ] **Step 5: 커밋**

```bash
git add src/hangul/
git commit -m "feat: hangul syllable/jamo decomposition utils"
```

---

## Task 2: 콘텐츠 타입 + 시작 데이터 + 로더 (TDD)

**Files:**
- Create: `src/content/types.ts`, `src/content/words.ts`, `src/content/lessons.ts`, `src/content/loader.ts`
- Test: `src/content/loader.test.ts`

- [ ] **Step 1: 타입 정의**

Create `src/content/types.ts`:
```ts
export type Theme = 'animals' | 'food' | 'vehicles' | 'family' | 'nature' | 'colorshape' | 'body' | 'home'

export type GameId = 'listen-find' | 'pick-word' | 'build-word' | 'letter-hunt' | 'memory' | 'story'

export interface WordImage {
  type: 'fluent' | 'photo'
  name?: string   // type==='fluent'
  url?: string    // type==='photo'
}

export interface Word {
  id: string
  text: string        // 통글자 (예: "사과")
  theme: Theme
  image: WordImage
}

export interface StoryScene {
  sceneImage: string  // public/img/scene/<...>.png 의 <...>
  text: string        // 자막 문장
  targets: string[]   // 이 장면에서 강조할 word id
}

export interface Lesson {
  id: string
  title: string
  theme: Theme
  story: StoryScene[]
  targetWords: string[]  // word id
  games: GameId[]
}
```

- [ ] **Step 2: 시작 단어 데이터**

Create `src/content/words.ts`:
```ts
import type { Word } from './types'

export const WORDS: Word[] = [
  { id: 'apple',  text: '사과',   theme: 'food',     image: { type: 'fluent', name: 'apple' } },
  { id: 'banana', text: '바나나', theme: 'food',     image: { type: 'fluent', name: 'banana' } },
  { id: 'grape',  text: '포도',   theme: 'food',     image: { type: 'fluent', name: 'grape' } },
  { id: 'dog',    text: '강아지', theme: 'animals',  image: { type: 'fluent', name: 'dog' } },
  { id: 'cat',    text: '고양이', theme: 'animals',  image: { type: 'fluent', name: 'cat' } },
  { id: 'rabbit', text: '토끼',   theme: 'animals',  image: { type: 'fluent', name: 'rabbit' } },
  { id: 'car',    text: '자동차', theme: 'vehicles', image: { type: 'fluent', name: 'car' } },
  { id: 'bus',    text: '버스',   theme: 'vehicles', image: { type: 'fluent', name: 'bus' } },
  { id: 'star',   text: '별',     theme: 'nature',   image: { type: 'fluent', name: 'star' } },
  { id: 'moon',   text: '달',     theme: 'nature',   image: { type: 'fluent', name: 'moon' } },
  { id: 'flower', text: '꽃',     theme: 'nature',   image: { type: 'fluent', name: 'flower' } },
  { id: 'ball',   text: '공',     theme: 'home',     image: { type: 'fluent', name: 'ball' } },
]
```

- [ ] **Step 3: 시작 레슨 데이터**

Create `src/content/lessons.ts`:
```ts
import type { Lesson } from './types'

export const LESSONS: Lesson[] = [
  {
    id: 'fruit-1',
    title: '과일나라 이야기',
    theme: 'food',
    story: [
      { sceneImage: 'orchard', text: '곰돌이가 빨간 사과를 땄어요.', targets: ['apple'] },
      { sceneImage: 'monkey',  text: '원숭이는 노란 바나나를 좋아해요.', targets: ['banana'] },
      { sceneImage: 'squirrel', text: '다람쥐가 보라색 포도를 모았어요.', targets: ['grape'] },
    ],
    targetWords: ['apple', 'banana', 'grape'],
    games: ['listen-find', 'pick-word'],
  },
]
```

- [ ] **Step 4: 실패하는 로더 테스트 작성**

Create `src/content/loader.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getWord, getWordsByIds, getLesson, validateContent } from './loader'

describe('getWord', () => {
  it('id로 단어 조회', () => {
    expect(getWord('apple')?.text).toBe('사과')
    expect(getWord('nope')).toBeUndefined()
  })
})

describe('getWordsByIds', () => {
  it('순서대로 단어 반환', () => {
    expect(getWordsByIds(['grape', 'apple']).map((w) => w.text)).toEqual(['포도', '사과'])
  })
})

describe('getLesson', () => {
  it('id로 레슨 조회', () => {
    expect(getLesson('fruit-1')?.targetWords).toEqual(['apple', 'banana', 'grape'])
  })
})

describe('validateContent', () => {
  it('현재 콘텐츠는 오류 없음', () => {
    expect(validateContent()).toEqual([])
  })
})
```

- [ ] **Step 5: 실패 확인**

Run: `npm run test -- loader`
Expected: FAIL ("Cannot find module './loader'")

- [ ] **Step 6: 로더 구현**

Create `src/content/loader.ts`:
```ts
import type { Word, Lesson } from './types'
import { WORDS } from './words'
import { LESSONS } from './lessons'

const wordById = new Map(WORDS.map((w) => [w.id, w]))
const lessonById = new Map(LESSONS.map((l) => [l.id, l]))

export function getWord(id: string): Word | undefined {
  return wordById.get(id)
}

export function getWordsByIds(ids: string[]): Word[] {
  return ids.map((id) => wordById.get(id)).filter((w): w is Word => w !== undefined)
}

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id)
}

export function allLessons(): Lesson[] {
  return LESSONS
}

/** 콘텐츠 정합성 검사: 문제 메시지 배열 반환(빈 배열이면 정상) */
export function validateContent(): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const w of WORDS) {
    if (ids.has(w.id)) errors.push(`중복 word id: ${w.id}`)
    ids.add(w.id)
    if (w.image.type === 'fluent' && !w.image.name) errors.push(`${w.id}: fluent name 없음`)
    if (w.image.type === 'photo' && !w.image.url) errors.push(`${w.id}: photo url 없음`)
  }
  for (const l of LESSONS) {
    for (const id of l.targetWords) {
      if (!wordById.has(id)) errors.push(`레슨 ${l.id}: 없는 targetWord ${id}`)
    }
    for (const s of l.story) {
      for (const id of s.targets) {
        if (!wordById.has(id)) errors.push(`레슨 ${l.id} 장면: 없는 target ${id}`)
      }
    }
  }
  return errors
}
```

- [ ] **Step 7: 통과 확인**

Run: `npm run test -- loader`
Expected: PASS

- [ ] **Step 8: 커밋**

```bash
git add src/content/
git commit -m "feat: content types, starter words/lessons, loader with validation"
```

---

## Task 3: 이미지 리졸버 (TDD)

**Files:**
- Create: `src/image/resolveImage.ts`
- Test: `src/image/resolveImage.test.ts`

- [ ] **Step 1: 실패하는 테스트**

Create `src/image/resolveImage.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveImageSrc } from './resolveImage'

describe('resolveImageSrc', () => {
  it('fluent는 번들 경로로', () => {
    expect(resolveImageSrc({ type: 'fluent', name: 'apple' })).toBe('/img/fluent/apple.png')
  })
  it('photo는 url 그대로', () => {
    expect(resolveImageSrc({ type: 'photo', url: 'https://x/y.jpg' })).toBe('https://x/y.jpg')
  })
  it('정보 부족이면 throw', () => {
    expect(() => resolveImageSrc({ type: 'fluent' })).toThrow()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- resolveImage`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `src/image/resolveImage.ts`:
```ts
import type { WordImage } from '../content/types'

export function resolveImageSrc(image: WordImage): string {
  if (image.type === 'photo' && image.url) return image.url
  if (image.type === 'fluent' && image.name) return `/img/fluent/${image.name}.png`
  throw new Error('resolveImageSrc: 이미지 정보 부족')
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- resolveImage`
Expected: PASS

- [ ] **Step 5: 샘플 그림 파일 추가**

`public/img/fluent/`에 다음 12개 PNG를 넣는다(투명/정사각 권장):
`apple, banana, grape, dog, cat, rabbit, car, bus, star, moon, flower, ball` → 각 `<name>.png`.
출처: Microsoft Fluent Emoji(3D) 저장소의 해당 이모지 PNG를 받아 위 이름으로 저장. (없는 파일은 임시로 단색 정사각 PNG라도 채워 화면 깨짐 방지.)
`public/img/scene/`에 `orchard.png, monkey.png, squirrel.png` 3개(가로형 장면 그림) 추가.

- [ ] **Step 6: 커밋**

```bash
git add src/image/ public/img/
git commit -m "feat: image resolver + starter word/scene images"
```

---

## Task 4: TTS — 한국어 음성 선택(TDD) + 재생 훅

**Files:**
- Create: `src/tts/pickVoice.ts`, `src/tts/useTts.ts`
- Test: `src/tts/pickVoice.test.ts`

- [ ] **Step 1: 실패하는 테스트**

Create `src/tts/pickVoice.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { pickKoreanVoice } from './pickVoice'

type V = { name: string; lang: string }
const v = (name: string, lang: string): V => ({ name, lang }) as unknown as SpeechSynthesisVoice

describe('pickKoreanVoice', () => {
  it('ko 음성이 없으면 null', () => {
    expect(pickKoreanVoice([v('Alex', 'en-US')] as SpeechSynthesisVoice[])).toBeNull()
  })
  it('선호 음성을 우선 선택', () => {
    const voices = [v('Google 한국의', 'ko-KR'), v('Yuna', 'ko-KR')] as SpeechSynthesisVoice[]
    expect(pickKoreanVoice(voices)?.name).toBe('Yuna')
  })
  it('선호가 없으면 첫 ko 음성', () => {
    const voices = [v('SomeKorean', 'ko-KR')] as SpeechSynthesisVoice[]
    expect(pickKoreanVoice(voices)?.name).toBe('SomeKorean')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- pickVoice`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `src/tts/pickVoice.ts`:
```ts
const PREFERRED = ['Yuna', 'Google 한국', 'Microsoft Heami', 'Microsoft SunHi', 'Kyuri', 'Nara']

export function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ko = voices.filter((vc) => vc.lang?.toLowerCase().startsWith('ko'))
  if (ko.length === 0) return null
  for (const name of PREFERRED) {
    const found = ko.find((vc) => vc.name.includes(name))
    if (found) return found
  }
  return ko[0]
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- pickVoice`
Expected: PASS

- [ ] **Step 5: 재생 훅 작성**

Create `src/tts/useTts.ts`:
```ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { pickKoreanVoice } from './pickVoice'

export interface SpeakOptions { rate?: number; onEnd?: () => void }

export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      voiceRef.current = pickKoreanVoice(synth.getVoices())
      setReady(true)
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    const synth = window.speechSynthesis
    if (!synth) { opts.onEnd?.(); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = opts.rate ?? 0.85
    if (voiceRef.current) u.voice = voiceRef.current
    if (opts.onEnd) u.onend = () => opts.onEnd!()
    synth.speak(u)
  }, [])

  const cancel = useCallback(() => window.speechSynthesis?.cancel(), [])

  return { speak, cancel, ready }
}
```

- [ ] **Step 6: 커밋**

```bash
git add src/tts/
git commit -m "feat: korean tts voice selection + speak hook"
```

---

## Task 5: 진행상황 — 순수 리듀서(TDD) + 저장 + 컨텍스트

**Files:**
- Create: `src/progress/progress.ts`, `src/progress/storage.ts`, `src/progress/useProgress.tsx`
- Test: `src/progress/progress.test.ts`

- [ ] **Step 1: 실패하는 테스트**

Create `src/progress/progress.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { initialProgress, addStars, learnWords, completeLesson } from './progress'

describe('addStars', () => {
  it('별을 더함(원본 불변)', () => {
    const p = addStars(initialProgress, 3)
    expect(p.stars).toBe(3)
    expect(initialProgress.stars).toBe(0)
  })
})

describe('learnWords', () => {
  it('배운 단어를 중복 없이 합침', () => {
    const p = learnWords(learnWords(initialProgress, ['apple']), ['apple', 'banana'])
    expect(p.learnedWords).toEqual(['apple', 'banana'])
  })
})

describe('completeLesson', () => {
  it('처음 완료하면 스티커 +1, 레슨 기록', () => {
    const p = completeLesson(initialProgress, 'fruit-1')
    expect(p.stickers).toBe(1)
    expect(p.completedLessons).toEqual(['fruit-1'])
  })
  it('이미 완료한 레슨은 스티커 안 줌', () => {
    const once = completeLesson(initialProgress, 'fruit-1')
    const twice = completeLesson(once, 'fruit-1')
    expect(twice.stickers).toBe(1)
    expect(twice.completedLessons).toEqual(['fruit-1'])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- progress`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `src/progress/progress.ts`:
```ts
export interface Progress {
  stars: number
  stickers: number
  learnedWords: string[]
  completedLessons: string[]
  princessName: string | null
}

export const initialProgress: Progress = {
  stars: 0,
  stickers: 0,
  learnedWords: [],
  completedLessons: [],
  princessName: null,
}

export function addStars(p: Progress, n: number): Progress {
  return { ...p, stars: p.stars + n }
}

export function learnWords(p: Progress, ids: string[]): Progress {
  return { ...p, learnedWords: Array.from(new Set([...p.learnedWords, ...ids])) }
}

export function completeLesson(p: Progress, lessonId: string): Progress {
  if (p.completedLessons.includes(lessonId)) return p
  return {
    ...p,
    completedLessons: [...p.completedLessons, lessonId],
    stickers: p.stickers + 1,
  }
}

export function setPrincessName(p: Progress, name: string): Progress {
  return { ...p, princessName: name }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- progress`
Expected: PASS

- [ ] **Step 5: 저장 모듈**

Create `src/progress/storage.ts`:
```ts
import { initialProgress, type Progress } from './progress'

const KEY = 'hangeul-play:progress:v1'

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialProgress
    return { ...initialProgress, ...JSON.parse(raw) }
  } catch {
    return initialProgress
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* 저장 실패는 조용히 무시 (사용성 우선) */
  }
}
```

- [ ] **Step 6: 컨텍스트/훅**

Create `src/progress/useProgress.tsx`:
```tsx
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { addStars, completeLesson, learnWords, setPrincessName, type Progress } from './progress'
import { loadProgress, saveProgress } from './storage'

type Action =
  | { type: 'addStars'; n: number }
  | { type: 'learnWords'; ids: string[] }
  | { type: 'completeLesson'; lessonId: string }
  | { type: 'setPrincessName'; name: string }

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'addStars': return addStars(state, action.n)
    case 'learnWords': return learnWords(state, action.ids)
    case 'completeLesson': return completeLesson(state, action.lessonId)
    case 'setPrincessName': return setPrincessName(state, action.name)
  }
}

interface Ctx { progress: Progress; dispatch: React.Dispatch<Action> }
const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, undefined, loadProgress)
  useEffect(() => { saveProgress(progress) }, [progress])
  const value = useMemo(() => ({ progress, dispatch }), [progress])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
```

- [ ] **Step 7: 커밋**

```bash
git add src/progress/
git commit -m "feat: progress reducer, localStorage persistence, context"
```

---

## Task 6: 네비게이션 + 앱 셸 + 홈

**Files:**
- Create: `src/app/Navigation.tsx`, `src/app/Home.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: 네비게이션 컨텍스트**

Create `src/app/Navigation.tsx`:
```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Screen = { name: 'home' } | { name: 'adventure'; lessonId: string }

interface Nav { screen: Screen; go: (s: Screen) => void }
const NavContext = createContext<Nav | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const value = useMemo(() => ({ screen, go: setScreen }), [screen])
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavigation(): Nav {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
```

- [ ] **Step 2: 홈 화면**

Create `src/app/Home.tsx`:
```tsx
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { allLessons } from '../content/loader'

export function Home() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const lesson = allLessons()[0]

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        ⭐ {progress.stars} · 🏅 {progress.stickers}
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 34 }}>우리 딸 한글 놀이</h1>
      <button
        onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 28, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-lg)',
          padding: '22px 40px', boxShadow: '0 6px 0 #d98a3a' }}>
        🎒 오늘의 모험 시작
      </button>
      <div style={{ color: 'var(--c-ink-soft)' }}>{lesson.title}</div>
    </div>
  )
}
```

- [ ] **Step 3: App에 프로바이더/라우팅 연결**

Replace `src/app/App.tsx`:
```tsx
import { ProgressProvider } from '../progress/useProgress'
import { NavigationProvider, useNavigation } from './Navigation'
import { Home } from './Home'
import { Adventure } from './Adventure'

function Router() {
  const { screen } = useNavigation()
  if (screen.name === 'adventure') return <Adventure lessonId={screen.lessonId} />
  return <Home />
}

export function App() {
  return (
    <ProgressProvider>
      <NavigationProvider>
        <Router />
      </NavigationProvider>
    </ProgressProvider>
  )
}
```
> 주의: `Adventure`는 Task 11에서 생성. 그 전까지 빌드가 깨지면 임시로 `const Adventure = () => null` 처리 후 Task 11에서 교체.

- [ ] **Step 4: 실행 확인**

Run: `npm run dev`
Expected: 홈 화면에 "오늘의 모험 시작" 버튼과 별/스티커 카운터 표시.

- [ ] **Step 5: 커밋**

```bash
git add src/app/
git commit -m "feat: navigation context, home screen, app shell"
```

---

## Task 7: 자막 강조 분할(TDD) + 이야기 플레이어

**Files:**
- Create: `src/story/highlight.ts`, `src/story/StoryPlayer.tsx`, `src/ui/SpeakerButton.tsx`
- Test: `src/story/highlight.test.ts`

- [ ] **Step 1: 실패하는 테스트 (자막을 타겟 단어 기준으로 분할)**

Create `src/story/highlight.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { splitByTargets } from './highlight'

describe('splitByTargets', () => {
  it('타겟 단어를 강조 토큰으로 분리', () => {
    const parts = splitByTargets('곰돌이가 빨간 사과를 땄어요.', ['사과'])
    expect(parts).toEqual([
      { text: '곰돌이가 빨간 ', target: false },
      { text: '사과', target: true },
      { text: '를 땄어요.', target: false },
    ])
  })
  it('타겟이 없으면 통째로 비강조', () => {
    expect(splitByTargets('안녕', ['사과'])).toEqual([{ text: '안녕', target: false }])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- highlight`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `src/story/highlight.ts`:
```ts
export interface TextPart { text: string; target: boolean }

/** 문장을 타겟 단어 텍스트 기준으로 [비강조|강조|...] 토큰으로 분할 */
export function splitByTargets(sentence: string, targetTexts: string[]): TextPart[] {
  const targets = targetTexts.filter(Boolean)
  if (targets.length === 0) return [{ text: sentence, target: false }]
  const parts: TextPart[] = []
  let i = 0
  while (i < sentence.length) {
    const hit = targets.find((t) => sentence.startsWith(t, i))
    if (hit) {
      parts.push({ text: hit, target: true })
      i += hit.length
    } else {
      const last = parts[parts.length - 1]
      if (last && !last.target) last.text += sentence[i]
      else parts.push({ text: sentence[i], target: false })
      i += 1
    }
  }
  return parts
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- highlight`
Expected: PASS

- [ ] **Step 5: 다시 듣기 버튼**

Create `src/ui/SpeakerButton.tsx`:
```tsx
export function SpeakerButton({ onClick, size = 44 }: { onClick: () => void; size?: number }) {
  return (
    <button onClick={onClick} aria-label="다시 듣기"
      style={{ width: size, height: size, borderRadius: '50%', border: 'none',
        background: '#ffe2c2', color: 'var(--c-accent-strong)', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 6: 이야기 플레이어**

Create `src/story/StoryPlayer.tsx`:
```tsx
import { useEffect, useMemo, useState } from 'react'
import type { Lesson } from '../content/types'
import { getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { splitByTargets } from './highlight'
import { SpeakerButton } from '../ui/SpeakerButton'

export function StoryPlayer({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { speak } = useTts()
  const [i, setI] = useState(0)
  const scene = lesson.story[i]
  const isLast = i === lesson.story.length - 1

  const targetTexts = useMemo(
    () => getWordsByIds(scene.targets).map((w) => w.text),
    [scene.targets],
  )
  const parts = useMemo(() => splitByTargets(scene.text, targetTexts), [scene.text, targetTexts])

  useEffect(() => { speak(scene.text) }, [i]) // 장면이 바뀔 때 자동 낭독

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={`/img/scene/${scene.sceneImage}.png`} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 12, right: 14 }}>
          <SpeakerButton onClick={() => speak(scene.text)} />
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,.92)', margin: 14, borderRadius: 'var(--radius-md)',
        padding: '18px 20px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 26, lineHeight: 1.5 }}>
          {parts.map((p, idx) =>
            p.target ? (
              <span key={idx} style={{ color: 'var(--c-pink)', fontSize: 32, fontWeight: 800, padding: '0 3px' }}>{p.text}</span>
            ) : (
              <span key={idx}>{p.text}</span>
            ),
          )}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 18 }}>
        <button onClick={() => (isLast ? onDone() : setI(i + 1))}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
          {isLast ? '다음으로 ▶' : '다음 장면 ▶'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: 커밋**

```bash
git add src/story/highlight.ts src/story/highlight.test.ts src/story/StoryPlayer.tsx src/ui/SpeakerButton.tsx
git commit -m "feat: story player with subtitle target highlighting + tts"
```

---

## Task 8: 오늘의 단어 화면 + 단어 그림 컴포넌트

**Files:**
- Create: `src/ui/WordImage.tsx`, `src/story/TodayWords.tsx`

- [ ] **Step 1: 단어 그림 컴포넌트**

Create `src/ui/WordImage.tsx`:
```tsx
import type { Word } from '../content/types'
import { resolveImageSrc } from '../image/resolveImage'

export function WordImage({ word, size = 120 }: { word: Word; size?: number }) {
  return (
    <img src={resolveImageSrc(word.image)} alt={word.text}
      width={size} height={size} style={{ objectFit: 'contain' }} />
  )
}
```

- [ ] **Step 2: 오늘의 단어 화면**

Create `src/story/TodayWords.tsx`:
```tsx
import type { Lesson } from '../content/types'
import { getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'

export function TodayWords({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { speak } = useTts()
  const words = getWordsByIds(lesson.targetWords)

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 18, padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 26 }}>오늘 배울 단어</h2>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {words.map((w) => (
          <button key={w.id} onClick={() => speak(w.text)}
            style={{ background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: 18, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8 }}>
            <WordImage word={w} />
            <span style={{ fontFamily: 'var(--font-warm)', fontSize: 28, fontWeight: 800,
              letterSpacing: 3, color: 'var(--c-ink)' }}>{w.text}</span>
          </button>
        ))}
      </div>
      <button onClick={onDone}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
        놀이하러 가기 ▶
      </button>
    </div>
  )
}
```

- [ ] **Step 3: 실행 확인 (수동, 후속 통합)**

이 화면은 Task 11의 Adventure에서 연결된다. 지금은 타입/임포트 오류만 없으면 됨.
Run: `npm run build`
Expected: 타입 오류 없이 빌드(Adventure 미연결 부분 제외).

- [ ] **Step 4: 커밋**

```bash
git add src/ui/WordImage.tsx src/story/TodayWords.tsx
git commit -m "feat: word image component + today's words screen"
```

---

## Task 9: 보기 생성(TDD) + 듣고 그림 찾기

**Files:**
- Create: `src/games/choices.ts`, `src/games/ListenFind.tsx`, `src/ui/Sparkles.tsx`
- Test: `src/games/choices.test.ts`

- [ ] **Step 1: 실패하는 테스트**

Create `src/games/choices.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildChoices } from './choices'

const noShuffle = <T,>(a: T[]) => a // 결정적 테스트

describe('buildChoices', () => {
  it('정답 + 오답으로 count개, 정답 포함', () => {
    const res = buildChoices('apple', ['banana', 'grape', 'dog'], 3, noShuffle)
    expect(res).toHaveLength(3)
    expect(res).toContain('apple')
  })
  it('오답 풀에서 정답은 제외', () => {
    const res = buildChoices('apple', ['apple', 'banana'], 2, noShuffle)
    expect(res.filter((x) => x === 'apple')).toHaveLength(1)
  })
  it('풀이 부족하면 가능한 만큼', () => {
    const res = buildChoices('apple', ['banana'], 4, noShuffle)
    expect(res).toEqual(['apple', 'banana'])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- choices`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `src/games/choices.ts`:
```ts
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 정답 1 + 오답(정답 제외 풀에서)로 count개 보기 생성 후 섞기 */
export function buildChoices(
  answer: string,
  pool: string[],
  count: number,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): string[] {
  const distractors = shuffleFn(pool.filter((x) => x !== answer)).slice(0, Math.max(0, count - 1))
  return shuffleFn([answer, ...distractors])
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- choices`
Expected: PASS

- [ ] **Step 5: 반짝임 효과 컴포넌트**

Create `src/ui/Sparkles.tsx`:
```tsx
export function Sparkles() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
      <span style={{ animation: 'pop .6s ease' }}>✨</span>
      <style>{`@keyframes pop{0%{transform:scale(.4);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:0}}`}</style>
    </div>
  )
}
```

- [ ] **Step 6: 듣고 그림 찾기 게임**

Create `src/games/ListenFind.tsx`:
```tsx
import { useEffect, useMemo, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildChoices } from './choices'

/** targetWords 각각을 한 라운드씩 출제. 정답 시 onCorrect, 전부 끝나면 onDone */
export function ListenFind({ targetWords, pool, onCorrect, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  const choiceIds = useMemo(
    () => buildChoices(answerId, pool, 3),
    [answerId, pool],
  )
  const choices = getWordsByIds(choiceIds)

  useEffect(() => { setSolved(false); speak(answer.text) }, [round])

  function pick(id: string) {
    if (solved) return
    if (id === answerId) {
      setSolved(true)
      onCorrect()
      setTimeout(() => {
        if (round === targetWords.length - 1) onDone()
        else setRound(round + 1)
      }, 900)
    } else {
      speak('다시 들어볼까?')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>잘 듣고 그림을 찾아요</h2>
      <SpeakerButton size={56} onClick={() => speak(answer.text)} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {choices.map((w) => (
          <button key={w.id} onClick={() => pick(w.id)}
            style={{ background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: 16, boxShadow: 'var(--shadow-card)' }}>
            <WordImage word={w} size={110} />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: 커밋**

```bash
git add src/games/choices.ts src/games/choices.test.ts src/games/ListenFind.tsx src/ui/Sparkles.tsx
git commit -m "feat: choice builder + listen-and-find game"
```

---

## Task 10: 그림 보고 단어 고르기

**Files:**
- Create: `src/games/PickWord.tsx`

- [ ] **Step 1: 게임 구현 (보기 생성은 Task 9의 buildChoices 재사용)**

Create `src/games/PickWord.tsx`:
```tsx
import { useEffect, useMemo, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { Sparkles } from '../ui/Sparkles'
import { buildChoices } from './choices'

/** 그림을 보여주고 글자 보기 중 맞는 단어를 고르기 */
export function PickWord({ targetWords, pool, onCorrect, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  const choiceIds = useMemo(() => buildChoices(answerId, pool, 3), [answerId, pool])
  const choices = getWordsByIds(choiceIds)

  useEffect(() => { setSolved(false) }, [round])

  function pick(id: string) {
    if (solved) return
    if (id === answerId) {
      setSolved(true)
      speak(answer.text)
      onCorrect()
      setTimeout(() => {
        if (round === targetWords.length - 1) onDone()
        else setRound(round + 1)
      }, 900)
    } else {
      speak('다시 골라볼까?')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>이 그림은 무엇일까요?</h2>
      <div style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 18,
        boxShadow: 'var(--shadow-card)' }}>
        <WordImage word={answer} size={150} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {choices.map((w) => (
          <button key={w.id} onClick={() => pick(w.id)}
            style={{ fontFamily: 'var(--font-warm)', fontSize: 26, fontWeight: 800, letterSpacing: 3,
              color: 'var(--c-ink)', background: 'var(--c-card)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: '0 5px 0 #f1ddc6' }}>
            {w.text}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 타입 오류 없음(Adventure 연결 전이면 App의 임시 처리 유지).

- [ ] **Step 3: 커밋**

```bash
git add src/games/PickWord.tsx
git commit -m "feat: pick-the-word game"
```

---

## Task 11: 보상 화면 + 모험 오케스트레이터(흐름 통합)

**Files:**
- Create: `src/reward/RewardScreen.tsx`, `src/app/Adventure.tsx`
- Modify: `src/app/App.tsx` (이미 import됨)

- [ ] **Step 1: 보상 화면**

Create `src/reward/RewardScreen.tsx`:
```tsx
import { useEffect } from 'react'
import { useTts } from '../tts/useTts'

export function RewardScreen({ onHome }: { onHome: () => void }) {
  const { speak } = useTts()
  useEffect(() => { speak('참 잘했어요! 스티커를 받았어요.') }, [])
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 96 }}>🎉</div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 30 }}>참 잘했어요!</h1>
      <div style={{ fontSize: 22, color: 'var(--c-accent-strong)', fontWeight: 800 }}>🏅 스티커 1장 획득!</div>
      <button onClick={onHome}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
        🏠 집으로
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 모험 오케스트레이터 (이야기→단어→놀이들→보상)**

Create `src/app/Adventure.tsx`:
```tsx
import { useMemo, useState } from 'react'
import { getLesson } from '../content/loader'
import { WORDS } from '../content/words'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { StoryPlayer } from '../story/StoryPlayer'
import { TodayWords } from '../story/TodayWords'
import { ListenFind } from '../games/ListenFind'
import { PickWord } from '../games/PickWord'
import { RewardScreen } from '../reward/RewardScreen'

type Phase = { kind: 'story' } | { kind: 'words' } | { kind: 'game'; index: number } | { kind: 'reward' }

export function Adventure({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!
  const { dispatch } = useProgress()
  const { go } = useNavigation()
  const [phase, setPhase] = useState<Phase>({ kind: 'story' })

  const pool = useMemo(() => WORDS.map((w) => w.id), [])
  const onCorrect = () => dispatch({ type: 'addStars', n: 1 })

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
      dispatch({ type: 'learnWords', ids: lesson.targetWords })
      dispatch({ type: 'completeLesson', lessonId: lesson.id })
      setPhase({ kind: 'reward' })
    }
  }

  if (phase.kind === 'story')
    return <StoryPlayer lesson={lesson} onDone={() => setPhase({ kind: 'words' })} />

  if (phase.kind === 'words')
    return <TodayWords lesson={lesson} onDone={() => setPhase({ kind: 'game', index: 0 })} />

  if (phase.kind === 'game') {
    const gameId = lesson.games[phase.index]
    const common = {
      targetWords: lesson.targetWords, pool, onCorrect,
      onDone: () => nextAfterGame(phase.index),
    }
    if (gameId === 'listen-find') return <ListenFind {...common} />
    if (gameId === 'pick-word') return <PickWord {...common} />
    // M1에서 미구현 게임은 안내 후 수동 진행 (fruit-1 정상 흐름에선 도달하지 않음 — 렌더 중 setState 방지)
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>이 놀이는 다음 버전에서 추가돼요.</p>
        <button onClick={() => nextAfterGame(phase.index)}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 26px', boxShadow: '0 5px 0 #d98a3a' }}>다음 ▶</button>
      </div>
    )
  }

  return <RewardScreen onHome={() => go({ name: 'home' })} />
}
```

- [ ] **Step 3: App의 임시 Adventure 제거 확인**

`src/app/App.tsx`가 `import { Adventure } from './Adventure'` 실제 파일을 쓰는지 확인(임시 `const Adventure` 있었다면 제거).

- [ ] **Step 4: 전체 흐름 수동 실행**

Run: `npm run dev`
Expected: 홈 → 모험 시작 → 이야기 3장면(자막에 사과/바나나/포도 강조, 음성) → 오늘의 단어 → 듣고찾기 → 단어고르기 → 🎉 스티커 1장 → 집으로. 홈에서 별/스티커 증가 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/reward/ src/app/Adventure.tsx src/app/App.tsx
git commit -m "feat: reward screen + adventure flow orchestration (story->words->games->reward)"
```

---

## Task 12: PWA — 매니페스트/아이콘/오프라인

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Modify: `index.html`

- [ ] **Step 1: 매니페스트 작성**

Create `public/manifest.webmanifest`:
```json
{
  "name": "우리 딸 한글 놀이",
  "short_name": "한글놀이",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#fff7ec",
  "theme_color": "#f0a04b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: 아이콘 추가**

`public/icons/`에 `icon-192.png`(192×192), `icon-512.png`(512×512) 추가. (앱 아이콘 — 임시로 단색+왕관 이모지 캔버스라도 가능. 추후 공주 아트로 교체.)

- [ ] **Step 3: index.html에 매니페스트/테마 연결**

`index.html`의 `<head>`에 추가:
```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#f0a04b" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

- [ ] **Step 4: 프로덕션 빌드 + 프리뷰로 오프라인 확인**

Run:
```bash
npm run build
npm run preview
```
Expected: 빌드 성공, 서비스워커 등록. 브라우저 DevTools > Application > Service Workers에 등록 확인. 오프라인 토글 후 새로고침해도 앱이 뜸.

- [ ] **Step 5: 커밋**

```bash
git add public/manifest.webmanifest public/icons/ index.html
git commit -m "feat: pwa manifest, icons, offline service worker"
```

---

## Task 13: 콘텐츠 검증 가드 + 전체 테스트 + 수동 점검 체크리스트

**Files:**
- Modify: `src/main.tsx`
- Create: `docs/superpowers/plans/m1-manual-qa.md`

- [ ] **Step 1: 개발 모드에서 콘텐츠 검증 경고**

`src/main.tsx`에 추가(렌더 직전):
```ts
import { validateContent } from './content/loader'
if (import.meta.env.DEV) {
  const errs = validateContent()
  if (errs.length) console.warn('[content] 검증 경고:', errs)
}
```

- [ ] **Step 2: 전체 테스트 실행**

Run: `npm run test`
Expected: 모든 테스트 PASS (decompose, loader, resolveImage, pickVoice, progress, choices, highlight).

- [ ] **Step 3: 프로덕션 빌드 확인**

Run: `npm run build`
Expected: 타입 오류 0, 빌드 성공.

- [ ] **Step 4: 수동 QA 체크리스트 작성**

Create `docs/superpowers/plans/m1-manual-qa.md`:
```markdown
# M1 수동 QA 체크리스트 (실제 태블릿)
- [ ] 홈에서 "오늘의 모험 시작" 동작
- [ ] 이야기: 각 장면 음성 자동 낭독, 자막에 타겟 단어 강조, 다시듣기 버튼
- [ ] 오늘의 단어: 단어 탭하면 음성
- [ ] 듣고찾기: 소리 듣고 정답 그림 탭 시 반짝임 + 다음
- [ ] 단어고르기: 그림 보고 글자 보기 탭
- [ ] 오답 시 부드러운 안내(차감/실패 없음)
- [ ] 보상: 🎉 + 스티커 1장, 홈 카운터 증가
- [ ] 새로고침 후에도 별/스티커 유지(localStorage)
- [ ] 홈화면에 추가(PWA) 후 앱처럼 실행
- [ ] 비행기모드(오프라인)에서 실행됨
- [ ] 한국어 TTS 음성이 자연스럽게 들림(기기별)
```

- [ ] **Step 5: 커밋**

```bash
git add src/main.tsx docs/superpowers/plans/m1-manual-qa.md
git commit -m "chore: dev content validation + M1 manual QA checklist"
```

---

## M1 완료 기준 (Definition of Done)
- 모든 단위 테스트 통과, 프로덕션 빌드 성공.
- 홈 → 이야기 → 오늘의 단어 → 듣고찾기 → 단어고르기 → 보상 전체 흐름 동작.
- 진행상황(별·스티커·배운 단어) localStorage 유지.
- PWA 설치 + 오프라인 동작.

---

## 다음 마일스톤 (별도 계획서로 작성 예정)
- **M2 — 나머지 놀이 + 진행 시각화**: 글자 블록 만들기(음절/자모, `hangul` 모듈 활용), 자음·모음 찾기(`toJamo` splitCompound), 카드 짝맞추기(메모리), 여정 맵, 스티커 북 화면. 레슨 2~3개 추가.
- **M3 — 꾸미기 + 콘텐츠 + 배포**: 진행 데이터에 `ownedItems`/`equipped`(슬롯 9종) 확장, 레이어 합성 렌더러(z-order), 상점/구매/착용, 공주 베이스+아이템 에셋 통합(샘플→확장), 80단어·테마별 레슨 확장, 부모존 게이트, 무료 호스팅 배포 + 설치 안내.

> 스펙 커버리지 메모: 본 M1은 스펙의 학습루프·이야기·놀이(2/6)·즉각보상+스티커·데이터모델·이미지/TTS 파이프라인·PWA를 구현. 나머지 놀이 4종·여정맵·스티커북·꾸미기/상점·콘텐츠 풀세트·배포는 M2/M3에서 다룬다(의도된 분할).
```
