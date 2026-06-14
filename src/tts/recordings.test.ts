import { describe, it, expect } from 'vitest'
import { resolveRecording } from './recordings'

describe('resolveRecording', () => {
  it('매핑 없는 텍스트는 null (TTS 폴백)', () => {
    expect(resolveRecording('이런 문장은 앱에 절대 없어요 zzz-12345')).toBeNull()
  })
})
