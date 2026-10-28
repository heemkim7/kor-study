import { useRef } from 'react'
import type { KongPose } from './Kong'

export const CORRECT_POSES: KongPose[] = ['cheer', 'clap', 'jump', 'star']
export const WRONG_POSES: KongPose[] = ['oops', 'think']

/** 정답/오답 포즈를 순환하며 고르는 훅 */
export function useReactionPicker() {
  const i = useRef({ ok: 0, bad: 0, n: 0 })
  return (correct: boolean) => {
    const c = i.current
    const list = correct ? CORRECT_POSES : WRONG_POSES
    const pose = list[(correct ? c.ok++ : c.bad++) % list.length]
    return { pose, n: ++c.n }
  }
}
