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
