import type { Lesson } from './types'

export const LESSONS: Lesson[] = [
  {
    id: 'fruit-1',
    title: '과일나라 이야기',
    theme: 'food',
    story: [
      { sceneImage: 'picnic',   text: '어느 맑은 날, 곰돌이는 친구들과 과일나라로 소풍을 갔어요.', targets: [] },
      { sceneImage: 'orchard',  text: '"우아, 빨간 사과가 주렁주렁!" 곰돌이가 사과를 콕 땄어요.', targets: ['apple'] },
      { sceneImage: 'monkey',   text: '나무 위 원숭이가 방긋 웃으며 노란 바나나를 건넸어요.', targets: ['banana'] },
      { sceneImage: 'squirrel', text: '다람쥐도 폴짝폴짝 보라색 포도를 한 송이 가져왔어요.', targets: ['grape'] },
      { sceneImage: 'share',    text: '셋은 사과랑 바나나랑 포도를 사이좋게 나눠 먹었어요. 냠냠!', targets: ['apple', 'banana', 'grape'] },
      { sceneImage: 'bye',      text: '"오늘 정말 즐거웠어. 내일 또 놀자!" 친구들은 손을 흔들었어요.', targets: [] },
    ],
    targetWords: ['apple', 'banana', 'grape'],
    games: ['listen-find', 'build-word', 'memory'],
  },
]
