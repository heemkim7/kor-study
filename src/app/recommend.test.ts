import { describe, it, expect } from 'vitest'
import { buildTracks, recommendNext } from './recommend'

describe('오늘의 놀이 추천', () => {
  it('처음에는 글자 트랙의 첫 수업', () => {
    expect(recommendNext([])?.node.id).toBe('v-aoi')
  })
  it('가장 덜 진행된 트랙으로 번갈아 안내한다(글자→숫자→영어→단어)', () => {
    const done: string[] = ['v-aoi']
    expect(recommendNext(done)?.track.id).toBe('number')
    done.push('n-123')
    expect(recommendNext(done)?.track.id).toBe('abc')
    done.push('abc-1')
    expect(recommendNext(done)?.track.id).toBe('words')
  })
  it('수업은 잠기지 않고 추천은 앞에서부터 첫 미완료', () => {
    const t = buildTracks(['v-aoi', 's-g']).find((x) => x.id === 'letters')!
    expect(t.nodes.find((n) => n.current)?.id).toBe('v-euu')
    expect(t.nodes.every((n) => n.screen.name === 'letter')).toBe(true)
  })
  it('전부 끝나면 null', () => {
    const all = buildTracks([]).flatMap((t) => t.nodes.map((n) => n.id))
    expect(recommendNext(all)).toBeNull()
  })
})
