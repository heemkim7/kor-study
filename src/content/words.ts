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
  // 탈것
  { id: 'train',    text: '기차',   theme: 'vehicles',   image: { type: 'fluent', name: 'train' } },
  { id: 'airplane', text: '비행기', theme: 'vehicles',   image: { type: 'fluent', name: 'airplane' } },
  // 색깔
  { id: 'red',    text: '빨강',   theme: 'colorshape', image: { type: 'fluent', name: 'red' } },
  { id: 'blue',   text: '파랑',   theme: 'colorshape', image: { type: 'fluent', name: 'blue' } },
  { id: 'yellow', text: '노랑',   theme: 'colorshape', image: { type: 'fluent', name: 'yellow' } },
  // 가족
  { id: 'mom',    text: '엄마',   theme: 'family',     image: { type: 'fluent', name: 'mom' } },
  { id: 'dad',    text: '아빠',   theme: 'family',     image: { type: 'fluent', name: 'dad' } },
  { id: 'baby',   text: '아기',   theme: 'family',     image: { type: 'fluent', name: 'baby' } },
]
