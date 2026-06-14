import type { Lesson, GameId, Theme } from './types'

// 스토리(그림책)가 있는 메인 레슨들
const STORY_LESSONS: Lesson[] = [
  {
    id: 'fruit-1',
    title: '과일나라 이야기',
    theme: 'food',
    level: 1,
    unit: '1주 · 과일나라',
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
  {
    id: 'animals-1',
    title: '동물 친구들',
    theme: 'animals',
    level: 2,
    unit: '2주 · 동물 친구',
    story: [
      { sceneImage: 'an-forest', text: '곰돌이가 숲속 길을 따라 살랑살랑 산책을 나갔어요.', targets: [] },
      { sceneImage: 'an-dog',    text: '"멍멍!" 강아지가 꼬리를 살랑살랑 흔들며 달려왔어요.', targets: ['dog'] },
      { sceneImage: 'an-cat',    text: '"야옹~" 고양이가 살금살금 다가와 인사했어요.', targets: ['cat'] },
      { sceneImage: 'an-rabbit', text: '토끼도 깡충깡충 뛰어왔어요.', targets: ['rabbit'] },
      { sceneImage: 'an-play',   text: '곰돌이랑 강아지랑 고양이랑 토끼! 다 같이 공을 차며 신나게 놀았어요.', targets: ['dog', 'cat', 'rabbit'] },
      { sceneImage: 'an-bye',    text: '"오늘 정말 재밌었어. 안녕, 또 만나!" 친구들이 손을 흔들었어요.', targets: [] },
    ],
    targetWords: ['dog', 'cat', 'rabbit'],
    games: ['listen-find', 'pick-word', 'letter-hunt'],
  },
  {
    id: 'nature-1',
    title: '반짝반짝 밤하늘',
    theme: 'nature',
    level: 3,
    unit: '3주 · 반짝 밤하늘',
    story: [
      { sceneImage: 'nat-dusk',   text: '해가 지고 깜깜한 밤이 되었어요.', targets: [] },
      { sceneImage: 'nat-star',   text: '하늘에 반짝반짝 별이 떠올랐어요.', targets: ['star'] },
      { sceneImage: 'nat-moon',   text: '둥근 달도 환하게 떠올랐어요.', targets: ['moon'] },
      { sceneImage: 'nat-flower', text: '달빛 아래 예쁜 꽃이 살며시 피었어요.', targets: ['flower'] },
      { sceneImage: 'nat-all',    text: '곰돌이는 별과 달과 꽃을 보며 방긋 웃었어요.', targets: ['star', 'moon', 'flower'] },
      { sceneImage: 'nat-sleep',  text: '"잘 자, 별님 달님!" 곰돌이는 새근새근 꿈나라로 갔어요.', targets: [] },
    ],
    targetWords: ['star', 'moon', 'flower'],
    games: ['listen-find', 'letter-hunt', 'memory'],
  },
  {
    id: 'vehicles-1',
    title: '붕붕 탈것 나라',
    theme: 'vehicles',
    level: 4,
    unit: '4주 · 붕붕 탈것',
    story: [
      { sceneImage: 'veh-road',  text: '곰돌이가 길가에서 무엇이 올까 기다려요.', targets: [] },
      { sceneImage: 'veh-car',   text: '빵빵! 빨간 자동차가 쌩 지나가요.', targets: ['car'] },
      { sceneImage: 'veh-bus',   text: '노란 버스가 친구들을 태우고 왔어요.', targets: ['bus'] },
      { sceneImage: 'veh-train', text: '칙칙폭폭! 기차가 신나게 달려요.', targets: ['train'] },
      { sceneImage: 'veh-ride',  text: '자동차도 버스도 기차도, 모두 모였어요!', targets: ['car', 'bus', 'train'] },
      { sceneImage: 'veh-bye',   text: '"안녕! 또 타러 오자." 곰돌이가 손을 흔들었어요.', targets: [] },
    ],
    targetWords: ['car', 'bus', 'train'],
    games: ['listen-find', 'pick-word', 'build-word'],
  },
  {
    id: 'colors-1',
    title: '알록달록 색깔놀이',
    theme: 'colorshape',
    level: 5,
    unit: '5주 · 색깔 놀이',
    story: [
      { sceneImage: 'col-intro',  text: '곰돌이가 알록달록 색깔 풍선을 들고 왔어요.', targets: [] },
      { sceneImage: 'col-red',    text: '동그란 빨강 풍선이에요. 빨강, 빨강!', targets: ['red'] },
      { sceneImage: 'col-blue',   text: '시원한 파랑 풍선이에요. 파랑, 파랑!', targets: ['blue'] },
      { sceneImage: 'col-yellow', text: '반짝이는 노랑 풍선이에요. 노랑, 노랑!', targets: ['yellow'] },
      { sceneImage: 'col-all',    text: '빨강, 파랑, 노랑! 색깔이 모두 모였어요.', targets: ['red', 'blue', 'yellow'] },
      { sceneImage: 'col-bye',    text: '"알록달록 정말 예뻤어!" 곰돌이가 방긋 웃었어요.', targets: [] },
    ],
    targetWords: ['red', 'blue', 'yellow'],
    games: ['listen-find', 'memory', 'letter-hunt'],
  },
  {
    id: 'family-1',
    title: '사랑하는 우리 가족',
    theme: 'family',
    level: 6,
    unit: '6주 · 우리 가족',
    story: [
      { sceneImage: 'fam-home',  text: '여기는 곰돌이네 집이에요. 가족이 함께 살아요.', targets: [] },
      { sceneImage: 'fam-mom',   text: '"우리 아가!" 엄마가 다정하게 안아 줬어요.', targets: ['mom'] },
      { sceneImage: 'fam-dad',   text: '"이리 오렴!" 아빠가 번쩍 안아 올렸어요.', targets: ['dad'] },
      { sceneImage: 'fam-baby',  text: '아장아장, 아기 곰이 걸음마를 해요.', targets: ['baby'] },
      { sceneImage: 'fam-all',   text: '엄마, 아빠, 아기! 온 가족이 함께라 행복해요.', targets: ['mom', 'dad', 'baby'] },
      { sceneImage: 'fam-bye',   text: '"잘 자요, 사랑해." 온 가족이 포근히 잠들었어요.', targets: [] },
    ],
    targetWords: ['mom', 'dad', 'baby'],
    games: ['listen-find', 'pick-word', 'build-word'],
  },
]

// 연습 레슨(스토리 없이 단어 → 놀이). 장기 커리큘럼을 채운다.
function practice(level: number, unit: string, theme: Theme, id: string, title: string, words: string[], games: GameId[]): Lesson {
  return { id, title, theme, level, unit, story: [], targetWords: words, games }
}

const G1: GameId[] = ['listen-find', 'pick-word', 'memory']
const G2: GameId[] = ['listen-find', 'build-word', 'letter-hunt']
const G3: GameId[] = ['listen-find', 'letter-hunt', 'memory']
const G4: GameId[] = ['listen-find', 'pick-word', 'build-word']

const PRACTICE_LESSONS: Lesson[] = [
  // 7주 · 동물원
  practice(7, '7주 · 동물원', 'animals', 'zoo-1', '사자와 호랑이', ['lion', 'tiger', 'bear'], G1),
  practice(8, '7주 · 동물원', 'animals', 'zoo-2', '코끼리와 원숭이', ['elephant', 'monkey', 'pig'], G2),
  practice(9, '7주 · 동물원', 'animals', 'zoo-3', '펭귄과 친구들', ['penguin', 'bird', 'fish'], G1),
  practice(10, '7주 · 동물원', 'animals', 'zoo-4', '개구리도 폴짝', ['frog', 'rabbit', 'dog'], G2),
  // 8주 · 맛있는 과일
  practice(11, '8주 · 맛있는 과일', 'food', 'food-1', '딸기와 수박', ['strawberry', 'watermelon', 'tangerine'], G1),
  practice(12, '8주 · 맛있는 과일', 'food', 'food-2', '레몬과 복숭아', ['lemon', 'peach', 'apple'], G2),
  // 9주 · 냠냠 먹어요
  practice(13, '9주 · 냠냠 먹어요', 'food', 'food-3', '밥과 빵', ['rice', 'bread', 'milk'], G1),
  practice(14, '9주 · 냠냠 먹어요', 'food', 'food-4', '달콤한 간식', ['candy', 'cake', 'icecream'], G3),
  practice(15, '9주 · 냠냠 먹어요', 'food', 'food-5', '계란과 과자', ['egg', 'cookie', 'bread'], G1),
  // 10주 · 내 몸
  practice(16, '10주 · 내 몸', 'body', 'body-1', '손과 발', ['hand', 'foot', 'eye'], G4),
  practice(17, '10주 · 내 몸', 'body', 'body-2', '코와 귀와 입', ['nose', 'ear', 'mouth'], G3),
  // 11주 · 옷과 물건
  practice(18, '11주 · 옷과 물건', 'home', 'home-1', '모자와 신발', ['hat', 'shoes', 'socks'], G1),
  practice(19, '11주 · 옷과 물건', 'home', 'home-2', '장갑과 책', ['gloves', 'book', 'clock'], G2),
  practice(20, '11주 · 옷과 물건', 'home', 'home-3', '집과 가구', ['house', 'chair', 'bed'], G1),
  // 12주 · 하늘과 자연
  practice(21, '12주 · 하늘과 자연', 'nature', 'sky-1', '해와 구름', ['sun', 'cloud', 'rain'], G4),
  practice(22, '12주 · 하늘과 자연', 'nature', 'sky-2', '나무와 산', ['tree', 'mountain', 'rainbow'], G3),
  // 13주 · 더 빠른 탈것
  practice(23, '13주 · 더 빠른 탈것', 'vehicles', 'veh-2', '배와 자전거', ['boat', 'bike', 'truck'], G1),
  practice(24, '13주 · 더 빠른 탈것', 'vehicles', 'veh-3', '로켓과 비행기', ['rocket', 'airplane', 'train'], G2),
  // 14주 · 알록달록 색
  practice(25, '14주 · 알록달록 색', 'colorshape', 'col-2', '초록과 보라', ['green', 'purple', 'brown'], G1),
  practice(26, '14주 · 알록달록 색', 'colorshape', 'col-3', '하양과 검정', ['white', 'black', 'red'], G3),
]

export const LESSONS: Lesson[] = [...STORY_LESSONS, ...PRACTICE_LESSONS]
