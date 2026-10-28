/** 버튼 안에 넣는 입체 아이콘(제미나이 생성, public/img/icons) */
export type IconName = 'home' | 'speaker' | 'play' | 'star' | 'heart' | 'check' | 'lock' | 'replay' | 'note' | 'wand' | 'crown' | 'rainbow' | 'gift'

export function Icon({ n, size = 28 }: { n: IconName; size?: number }) {
  return <img src={`/img/icons/${n}.webp`} alt="" aria-hidden draggable={false}
    style={{ height: size, width: 'auto', maxWidth: size * 1.3, objectFit: 'contain', filter: 'drop-shadow(0 2px 2px rgba(60,40,20,.25))' }} />
}
