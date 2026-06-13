import { describe, it, expect } from 'vitest'
import { pickKoreanVoice } from './pickVoice'

type V = { name: string; lang: string }
const v = (name: string, lang: string): V => ({ name, lang }) as unknown as SpeechSynthesisVoice

describe('pickKoreanVoice', () => {
  it('ko 음성이 없으면 null', () => {
    expect(pickKoreanVoice([v('Alex', 'en-US')] as SpeechSynthesisVoice[])).toBeNull()
  })
  it('선호 음성을 우선 선택', () => {
    const voices = [v('Google 한국의', 'ko-KR'), v('Yuna', 'ko-KR')] as SpeechSynthesisVoice[]
    expect(pickKoreanVoice(voices)?.name).toBe('Yuna')
  })
  it('선호가 없으면 첫 ko 음성', () => {
    const voices = [v('SomeKorean', 'ko-KR')] as SpeechSynthesisVoice[]
    expect(pickKoreanVoice(voices)?.name).toBe('SomeKorean')
  })
})
