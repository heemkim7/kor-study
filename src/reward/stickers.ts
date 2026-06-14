// 스티커 모으기 보상 — 레슨을 끝낼 때마다 한 장씩 모은다.
// 이모지를 쓰므로 이미지 자산이 필요 없다(비용 0). 레슨 수(26)와 맞춰 26종.

export interface Sticker {
  id: string
  emoji: string
  name: string
}

export const STICKERS: Sticker[] = [
  { id: 'st-lion', emoji: '🦁', name: '사자' },
  { id: 'st-rabbit', emoji: '🐰', name: '토끼' },
  { id: 'st-strawberry', emoji: '🍓', name: '딸기' },
  { id: 'st-star', emoji: '⭐', name: '별' },
  { id: 'st-rainbow', emoji: '🌈', name: '무지개' },
  { id: 'st-car', emoji: '🚗', name: '자동차' },
  { id: 'st-cat', emoji: '🐱', name: '고양이' },
  { id: 'st-butterfly', emoji: '🦋', name: '나비' },
  { id: 'st-flower', emoji: '🌸', name: '꽃' },
  { id: 'st-cake', emoji: '🍰', name: '케이크' },
  { id: 'st-balloon', emoji: '🎈', name: '풍선' },
  { id: 'st-crown', emoji: '👑', name: '왕관' },
  { id: 'st-heart', emoji: '💖', name: '하트' },
  { id: 'st-sun', emoji: '🌞', name: '해' },
  { id: 'st-moon', emoji: '🌙', name: '달' },
  { id: 'st-fish', emoji: '🐠', name: '물고기' },
  { id: 'st-dog', emoji: '🐶', name: '강아지' },
  { id: 'st-bear', emoji: '🐻', name: '곰' },
  { id: 'st-icecream', emoji: '🍦', name: '아이스크림' },
  { id: 'st-gift', emoji: '🎁', name: '선물' },
  { id: 'st-unicorn', emoji: '🦄', name: '유니콘' },
  { id: 'st-rocket', emoji: '🚀', name: '로켓' },
  { id: 'st-chick', emoji: '🐤', name: '병아리' },
  { id: 'st-apple', emoji: '🍎', name: '사과' },
  { id: 'st-train', emoji: '🚂', name: '기차' },
  { id: 'st-cloud', emoji: '⛅', name: '구름' },
]

export function getSticker(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id)
}
