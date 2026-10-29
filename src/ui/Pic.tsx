/** 놀이용 작은 그림(제미나이 일러스트). crown은 아이콘 폴더에 있다. */
export function Pic({ name, size = 48 }: { name: string; size?: number }) {
  const src = name === 'crown' ? '/img/icons/crown.webp' : `/img/word/${name}.webp`
  return (
    <img src={src} alt="" aria-hidden draggable={false} width={size} height={size}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 3px 2px rgba(60,40,20,.2))' }} />
  )
}
