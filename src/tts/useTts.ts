import { useCallback, useEffect, useRef, useState } from 'react'
import { pickKoreanVoice } from './pickVoice'
import { resolveRecording } from './recordings'

export interface SpeakOptions { rate?: number; onEnd?: () => void }

export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
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

  const ttsSpeak = useCallback((text: string, opts: SpeakOptions = {}) => {
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

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    // 직전 재생 정리
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }

    // 녹음이 있으면 부모 목소리로, 없으면 TTS
    const rec = resolveRecording(text)
    if (rec) {
      const audio = new Audio(rec)
      audioRef.current = audio
      audio.onended = () => opts.onEnd?.()
      audio.onerror = () => ttsSpeak(text, opts) // 파일 문제 시 TTS 폴백
      audio.play().catch(() => ttsSpeak(text, opts))
      return
    }
    ttsSpeak(text, opts)
  }, [ttsSpeak])

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }, [])

  // 언마운트 시 재생 정리(화면 전환 때 이전 화면 음성이 새는 것 방지)
  useEffect(() => cancel, [cancel])

  return { speak, cancel, ready }
}
