import { useCallback, useEffect, useRef, useState } from 'react'
import { pickKoreanVoice } from './pickVoice'

export interface SpeakOptions { rate?: number; onEnd?: () => void }

export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      voiceRef.current = pickKoreanVoice(synth.getVoices())
      setReady(true)
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    const synth = window.speechSynthesis
    if (!synth) { opts.onEnd?.(); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = opts.rate ?? 0.85
    if (voiceRef.current) u.voice = voiceRef.current
    if (opts.onEnd) u.onend = () => opts.onEnd!()
    synth.speak(u)
  }, [])

  const cancel = useCallback(() => window.speechSynthesis?.cancel(), [])

  return { speak, cancel, ready }
}
