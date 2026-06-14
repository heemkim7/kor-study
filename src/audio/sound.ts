// 비용 0 사운드 — 오디오 파일 없이 Web Audio API로 효과음·배경음악을 합성한다.
// jsdom(테스트)·미지원 환경에서는 모든 함수가 조용히 무시된다(예외 없음).
// 배경음악은 C 펜타토닉이라 어떤 순서로 울려도 불협이 없어 오래 들어도 편안하다.

const BGM_KEY = 'hangeul-play:bgm:v1'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let master: GainNode | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  return ctx
}

/** 사용자 제스처 직후 호출해 정지(suspended)된 컨텍스트를 깨운다(자동재생 정책 대응). */
export function resumeAudio(): void {
  const c = audio()
  if (c && c.state === 'suspended') void c.resume()
}

// 음이름 → 주파수(A4=440 기준, C4≈261.63). octave는 옥타브 가감.
const NOTE: Record<string, number> = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88 }
function f(name: string, octave = 0): number {
  return NOTE[name] * Math.pow(2, octave)
}

// 한 음 — 부드러운 파형 + 짧은 엔벨로프로 '띵' 소리
function tone(freq: number, start: number, dur: number, gain = 0.18, type: OscillatorType = 'triangle'): void {
  const c = audio()
  if (!c || !master) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  o.connect(g)
  g.connect(master)
  const t0 = c.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.start(t0)
  o.stop(t0 + dur + 0.03)
}

/** 정답! — 도·미·솔 상행으로 밝고 짧게. */
export function playCorrect(): void {
  resumeAudio()
  tone(f('C', 1), 0, 0.18)
  tone(f('E', 1), 0.1, 0.18)
  tone(f('G', 1), 0.2, 0.26)
}

/** 보상 화면 — 팡파르(상행 후 화음). */
export function playReward(): void {
  resumeAudio()
  ;['C', 'E', 'G'].forEach((n, i) => tone(f(n, 1), i * 0.12, 0.28, 0.16))
  tone(f('C', 2), 0.36, 0.4, 0.16)
  ;[f('C', 2), f('E', 2), f('G', 2)].forEach((fr) => tone(fr, 0.52, 0.6, 0.11))
}

/** 스티커 획득 — 반짝이는 고음 두 방울. */
export function playSticker(): void {
  resumeAudio()
  tone(f('G', 2), 0, 0.14, 0.13, 'sine')
  tone(f('C', 2), 0.09, 0.22, 0.13, 'sine')
}

// ---- 배경음악(부드러운 펜타토닉 루프) ----
let bgmTimer: ReturnType<typeof setInterval> | null = null
let bgmGain: GainNode | null = null
let step = 0

const PENTA = [f('C', 0), f('D', 0), f('E', 0), f('G', 0), f('A', 0), f('C', 1), f('A', -1), f('G', -1)]
const MELODY = [0, 2, 4, 3, 5, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 3]

function bgmNote(): void {
  const c = audio()
  if (!c || !bgmGain) return
  const fr = PENTA[MELODY[step % MELODY.length]]
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'triangle'
  o.frequency.value = fr
  o.connect(g)
  g.connect(bgmGain)
  const t0 = c.currentTime
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(0.5, t0 + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5)
  o.start(t0)
  o.stop(t0 + 0.55)
  // 4박마다 낮은 베이스로 포근함 보강
  if (step % 4 === 0) {
    const bo = c.createOscillator()
    const bg = c.createGain()
    bo.type = 'sine'
    bo.frequency.value = f('C', -1)
    bo.connect(bg)
    bg.connect(bgmGain)
    bg.gain.setValueAtTime(0.0001, t0)
    bg.gain.linearRampToValueAtTime(0.4, t0 + 0.05)
    bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9)
    bo.start(t0)
    bo.stop(t0 + 0.95)
  }
  step++
}

export function isBgmEnabled(): boolean {
  try {
    return localStorage.getItem(BGM_KEY) !== 'off'
  } catch {
    return true
  }
}

export function startBgm(): void {
  if (!isBgmEnabled()) return
  const c = audio()
  if (!c || !master) return
  resumeAudio()
  if (!bgmGain) {
    bgmGain = c.createGain()
    bgmGain.gain.value = 0.06 // 아주 낮게 — 음성/효과음을 가리지 않도록
    bgmGain.connect(master)
  }
  if (bgmTimer) return
  bgmNote()
  bgmTimer = setInterval(bgmNote, 460)
}

export function stopBgm(): void {
  if (bgmTimer) {
    clearInterval(bgmTimer)
    bgmTimer = null
  }
}

export function setBgmEnabled(on: boolean): void {
  try {
    localStorage.setItem(BGM_KEY, on ? 'on' : 'off')
  } catch {
    /* 저장 실패는 무시 */
  }
  if (on) startBgm()
  else stopBgm()
}

/** 음소거 토글 — 적용 후 새 상태(켜짐 여부)를 반환. */
export function toggleBgm(): boolean {
  const next = !isBgmEnabled()
  setBgmEnabled(next)
  return next
}
