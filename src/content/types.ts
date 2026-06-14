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
  sceneImage: string  // public/img/scene/<...>.svg 의 <...>
  text: string        // 자막 문장
  targets: string[]   // 이 장면에서 강조할 word id
}

export interface Lesson {
  id: string
  title: string
  theme: Theme
  level: number          // 단계(1부터). 여정 순서 + 난이도 결정
  unit?: string          // 주차/단원 묶음(홈 그룹 표시). 예: '7주 · 동물원'
  story: StoryScene[]    // 빈 배열이면 스토리 없이 단어→놀이(연습 레슨)
  targetWords: string[]  // word id
  games: GameId[]
}
