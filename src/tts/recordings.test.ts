import { describe, it, expect } from 'vitest'
import { resolveRecording } from './recordings'

describe('resolveRecording', () => {
  it('녹음이 없는 텍스트는 null (기본: 전부 TTS)', () => {
    expect(resolveRecording('사과')).toBeNull()
    expect(resolveRecording('아무 문장')).toBeNull()
  })
})
