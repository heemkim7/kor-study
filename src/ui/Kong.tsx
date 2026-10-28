/** 콩콩이 표정·동작(제미나이 생성 일러스트, public/img/kong) */
export type KongPose = 'cheer' | 'clap' | 'jump' | 'star' | 'oops' | 'think' | 'wave' | 'point' | 'read' | 'sleep' | 'listen'

export function Kong({ pose, size = 120, bob = false }: { pose: KongPose; size?: number; bob?: boolean }) {
  return (
    <img className={bob ? 'kp-bob' : undefined} src={`/img/kong/${pose}.webp`} alt="" aria-hidden draggable={false}
      style={{ height: size, width: 'auto', maxWidth: size * 1.4, objectFit: 'contain',
        filter: 'drop-shadow(0 5px 4px rgba(60,40,20,.25))' }} />
  )
}

/** 정답/오답 때 화면 모서리에서 콩콩이가 튀어나와 반응(1.5초). n이 바뀔 때마다 다시 재생 */
export function KongReaction({ reaction }: { reaction: { pose: KongPose; n: number } | null }) {
  if (!reaction) return null
  return (
    <div key={reaction.n} aria-hidden className="kp-kong-react"
      style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 20, pointerEvents: 'none' }}>
      <Kong pose={reaction.pose} size={92} />
    </div>
  )
}
