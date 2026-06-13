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
