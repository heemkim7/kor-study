import { useCallback, useEffect, useRef, useState } from 'react'
import { pickKoreanVoice } from './pickVoice'
import { resolveRecording } from './recordings'

export interface SpeakOptions { rate?: number; onEnd?: () => void; lang?: string }

export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const enVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      const voices = synth.getVoices()
      voiceRef.current = pickKoreanVoice(voices)
      enVoiceRef.current = voices.find((v) => /^en/i.test(v.lang)) ?? null // 영어(en) 음성
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
    const isEn = !!opts.lang && /^en/i.test(opts.lang)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = opts.lang ?? 'ko-KR'
    u.rate = opts.rate ?? (isEn ? 0.9 : 0.85)
    const v = isEn ? enVoiceRef.current : voiceRef.current
    if (v) u.voice = v
    if (opts.onEnd) u.onend = () => opts.onEnd!()
    synth.speak(u)
  }, [])

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    // 직전 재생 정리
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }

    // 녹음(부모 목소리)은 한국어만. 영어는 브라우저 영어 음성으로.
    const rec = opts.lang && /^en/i.test(opts.lang) ? null : resolveRecording(text)
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
