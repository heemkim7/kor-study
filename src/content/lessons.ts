import type { Lesson, GameId, Theme } from './types'

// 스토리(그림책)가 있는 메인 레슨들.
// 주인공은 아기 곰 '콩콩이' — 동화체로 의성어·의태어를 넣어 재미있게.
const STORY_LESSONS: Lesson[] = [
  {
    id: 'fruit-1',
    title: '과일나라 이야기',
    theme: 'food',
    level: 1,
    unit: '1주 · 과일나라',
    story: [
      { sceneImage: 'picnic',   text: '햇살이 반짝이던 날, 아기 곰 콩콩이는 친구들과 과일나라로 소풍을 떠났어요.', targets: [] },
      { sceneImage: 'orchard',  text: '"우아, 빨갛게 익은 사과가 주렁주렁!" 콩콩이가 까치발을 하고 사과를 콕 땄어요.', targets: ['apple'] },
      { sceneImage: 'monkey',   text: '나무 위 원숭이가 "끼끼!" 웃으며 길쭉한 바나나를 쑥 내밀었어요.', targets: ['banana'] },
      { sceneImage: 'squirrel', text: '다람쥐도 통통한 보라색 포도를 한 송이 데굴데굴 굴려 왔어요.', targets: ['grape'] },
      { sceneImage: 'share',    text: '"같이 먹으면 두 배로 맛있어!" 사과랑 바나나랑 포도를 사이좋게 나눠 먹었어요. 냠냠!', targets: ['apple', 'banana', 'grape'] },
      { sceneImage: 'bye',      text: '배가 불룩해진 친구들은 "내일 또 만나!" 하고 손을 흔들며 집으로 돌아갔답니다.', targets: [] },
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
      { sceneImage: 'an-forest', text: '아기 곰 콩콩이가 살랑살랑 부는 바람을 따라 숲속 길을 걸었어요.', targets: [] },
      { sceneImage: 'an-dog',    text: '"멍멍!" 꼬리를 흔들흔들, 강아지가 신나게 달려왔어요.', targets: ['dog'] },
      { sceneImage: 'an-cat',    text: '"야옹~" 발끝을 살금살금, 고양이가 살며시 다가왔어요.', targets: ['cat'] },
      { sceneImage: 'an-rabbit', text: '"깡총깡총!" 토끼가 폴짝폴짝 뛰어와 반갑게 인사했어요.', targets: ['rabbit'] },
      { sceneImage: 'an-play',   text: '강아지랑 고양이랑 토끼랑! 다 함께 공을 데굴데굴 굴리며 놀았어요.', targets: ['dog', 'cat', 'rabbit'] },
      { sceneImage: 'an-bye',    text: '해가 뉘엿뉘엿 질 때, "오늘 참 즐거웠어!" 친구들은 손을 흔들었어요.', targets: [] },
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
      { sceneImage: 'nat-dusk',   text: '해님이 산 너머로 쏙 숨고, 까만 밤이 살며시 찾아왔어요.', targets: [] },
      { sceneImage: 'nat-star',   text: '깜깜한 하늘에 반짝반짝 별이 하나둘 눈을 떴어요.', targets: ['star'] },
      { sceneImage: 'nat-moon',   text: '둥글고 환한 달도 두둥실 떠올라 온 세상을 비췄어요.', targets: ['moon'] },
      { sceneImage: 'nat-flower', text: '달빛을 받은 꽃 한 송이가 살포시 꽃잎을 열었어요.', targets: ['flower'] },
      { sceneImage: 'nat-all',    text: '별과 달과 꽃이 함께 빛나니, 콩콩이 마음도 반짝반짝 빛났어요.', targets: ['star', 'moon', 'flower'] },
      { sceneImage: 'nat-sleep',  text: '"잘 자, 별님 달님." 콩콩이는 새근새근 꿈나라로 떠났답니다.', targets: [] },
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
      { sceneImage: 'veh-road',  text: '콩콩이가 길가에 서서 "무엇이 올까?" 하고 두근두근 기다렸어요.', targets: [] },
      { sceneImage: 'veh-car',   text: '"빵빵!" 빨간 자동차가 쌩하고 바람처럼 지나갔어요.', targets: ['car'] },
      { sceneImage: 'veh-bus',   text: '"부릉부릉~" 노란 버스가 친구들을 가득 태우고 왔어요.', targets: ['bus'] },
      { sceneImage: 'veh-train', text: '"칙칙폭폭!" 기차가 산을 넘고 들을 지나 신나게 달렸어요.', targets: ['train'] },
      { sceneImage: 'veh-ride',  text: '자동차도 버스도 기차도, 모두 모여 줄지어 달렸어요!', targets: ['car', 'bus', 'train'] },
      { sceneImage: 'veh-bye',   text: '"다음에 또 타러 오자!" 콩콩이가 활짝 웃으며 손을 흔들었답니다.', targets: [] },
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
      { sceneImage: 'col-intro',  text: '콩콩이가 알록달록 풍선을 한 아름 안고 폴짝 나타났어요.', targets: [] },
      { sceneImage: 'col-red',    text: '"이건 사과처럼 빨강 풍선!" 동그란 빨강이 둥실 떠올랐어요.', targets: ['red'] },
      { sceneImage: 'col-blue',   text: '"이건 하늘처럼 파랑 풍선!" 시원한 파랑이 살랑살랑 흔들렸어요.', targets: ['blue'] },
      { sceneImage: 'col-yellow', text: '"이건 햇님처럼 노랑 풍선!" 반짝이는 노랑이 방긋 웃었어요.', targets: ['yellow'] },
      { sceneImage: 'col-all',    text: '빨강, 파랑, 노랑 풍선이 한데 모이니 무지개처럼 예뻤어요.', targets: ['red', 'blue', 'yellow'] },
      { sceneImage: 'col-bye',    text: '"알록달록 색깔은 정말 신기해!" 콩콩이가 깔깔 웃었어요.', targets: [] },
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
      { sceneImage: 'fam-home',  text: '포근한 콩콩이네 집, 오늘도 가족이 도란도란 모였어요.', targets: [] },
      { sceneImage: 'fam-mom',   text: '"우리 아가, 이리 오렴." 엄마가 두 팔 벌려 콩콩이를 꼭 안아 줬어요.', targets: ['mom'] },
      { sceneImage: 'fam-dad',   text: '"영차!" 아빠가 콩콩이를 번쩍 안아 하늘 높이 들어 올렸어요.', targets: ['dad'] },
      { sceneImage: 'fam-baby',  text: '아장아장, 막내 아기가 걸음마를 떼며 방긋 웃었어요.', targets: ['baby'] },
      { sceneImage: 'fam-all',   text: '엄마와 아빠와 아기까지, 온 가족이 함께라 마음이 따뜻했어요.', targets: ['mom', 'dad', 'baby'] },
      { sceneImage: 'fam-bye',   text: '"사랑해요, 잘 자요." 가족은 포근한 이불 속에서 스르르 잠들었답니다.', targets: [] },
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
