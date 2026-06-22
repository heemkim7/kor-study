import { useEffect, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { glyphSound } from '../content/letters'

const INK = '#ff8a3d' // 크레용 색
const GUIDE = '#dbe3ec' // 따라 쓸 윤곽(옅게)
const COVER_THRESHOLD = 0.45 // 윤곽의 45%만 덮어도 완성(4세 관대 채점)

function drawGlyph(ctx: CanvasRenderingContext2D, w: number, h: number, g: string, color: string) {
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.floor(h * 0.66)}px "Gowun Dodum", "Pretendard", sans-serif`
  ctx.fillText(g, w / 2, h / 2)
}

/** 따라쓰기 — 글자 윤곽을 손가락으로 따라 칠한다. 윤곽을 충분히 덮으면 완성(관대한 채점). */
export function Trace({ glyphs, onCorrect, onDone, say = (g) => ({ text: glyphSound(g) }) }: {
  glyphs: string[]; onCorrect: () => void; onDone: () => void
  say?: (g: string) => { text: string; lang?: string }
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const glyph = glyphs[round]

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const inkRef = useRef<HTMLCanvasElement | null>(null)
  const inkCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const maskRef = useRef<Uint8ClampedArray | null>(null)
  const glyphRef = useRef(glyph)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const solvedRef = useRef(false)
  const awardedRef = useRef(false) // 한 라운드에서 별은 1번만(다시 그려도 중복 지급 방지)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function fit() {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const rect = cv.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    cv.width = w
    cv.height = h
    ctxRef.current = cv.getContext('2d')
    const ink = inkRef.current ?? (inkRef.current = document.createElement('canvas'))
    ink.width = w
    ink.height = h
    inkCtxRef.current = ink.getContext('2d')
    // 윤곽 마스크(글자 안쪽 픽셀) 계산
    const mc = document.createElement('canvas')
    mc.width = w
    mc.height = h
    const mctx = mc.getContext('2d')
    if (mctx) {
      drawGlyph(mctx, w, h, glyphRef.current, '#000')
      maskRef.current = mctx.getImageData(0, 0, w, h).data
    }
    // 보이는 캔버스: 흰 바탕 + 옅은 윤곽, 잉크 초기화
    const ctx = ctxRef.current
    if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); drawGlyph(ctx, w, h, glyphRef.current, GUIDE) }
    inkCtxRef.current?.clearRect(0, 0, w, h)
  }

  // 라운드 바뀌면 solved 초기화(렌더 중 — 다른 게임과 동일 패턴)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false) }

  // 라운드(글자) 바뀌면 윤곽 새로 그리고 ref 동기화 + 글자 소리(캔버스 작업은 이펙트에서)
  useEffect(() => {
    clearTimeout(timerRef.current) // 이전 완성 타이머가 남아 있으면 정리(라운드 전환 위생)
    glyphRef.current = glyph
    solvedRef.current = false
    awardedRef.current = false
    fit()
    if (round === 0) speak('손가락으로 글자를 따라 써 보세요')
    else { const s = say(glyph); speak(s.text, { lang: s.lang }) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  // 리사이즈/회전 시 다시 맞춤(그림은 지워짐 — 따라쓰기라 허용)
  useEffect(() => {
    const onResize = () => fit()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      clearTimeout(timerRef.current)
    }
  }, [])

  function pos(e: React.PointerEvent) {
    const cv = canvasRef.current
    if (!cv) return { x: 0, y: 0 }
    const rect = cv.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (cv.width / rect.width), y: (e.clientY - rect.top) * (cv.height / rect.height) }
  }
  function strokeTo(p: { x: number; y: number }) {
    const cv = canvasRef.current, ctx = ctxRef.current, ictx = inkCtxRef.current
    if (!cv || !ctx || !ictx) return
    const lw = cv.width * 0.07
    for (const c of [ctx, ictx]) {
      c.strokeStyle = c === ctx ? INK : '#000'
      c.lineWidth = lw
      c.lineCap = 'round'
      c.lineJoin = 'round'
      c.beginPath()
      c.moveTo(last.current.x, last.current.y)
      c.lineTo(p.x, p.y)
      c.stroke()
    }
    last.current = p
  }
  function onDown(e: React.PointerEvent) {
    if (solvedRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
    strokeTo({ x: last.current.x + 0.1, y: last.current.y }) // 점 찍기
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current || solvedRef.current) return
    strokeTo(pos(e))
  }
  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    checkCoverage()
  }

  function checkCoverage() {
    const mask = maskRef.current, ictx = inkCtxRef.current, cv = canvasRef.current
    if (!mask || !ictx || !cv) return
    const ink = ictx.getImageData(0, 0, cv.width, cv.height).data
    let inside = 0, covered = 0
    for (let p = 3; p < mask.length; p += 4) {
      if (mask[p] > 40) { inside++; if (ink[p] > 40) covered++ }
    }
    if (inside > 0 && covered / inside >= COVER_THRESHOLD) finish()
  }

  function finish() {
    if (solvedRef.current) return
    solvedRef.current = true
    setSolved(true)
    { const s = say(glyphRef.current); speak(s.text, { lang: s.lang }) }
    if (!awardedRef.current) { awardedRef.current = true; onCorrect() } // 중복 보상 방지
    timerRef.current = setTimeout(() => {
      if (round === glyphs.length - 1) onDone()
      else setRound(round + 1)
    }, 1100)
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 16, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>글자를 따라 써요</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-warm)', fontSize: 30, fontWeight: 800, color: 'var(--c-pink)' }}>{glyph}</span>
        <SpeakerButton size={52} onClick={() => { const s = say(glyph); speak(s.text, { lang: s.lang }) }} />
      </div>
      <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ width: '100%', maxWidth: 340, flex: 1, minHeight: 0, aspectRatio: '1 / 1', borderRadius: 'var(--radius-lg)',
          background: '#fff', boxShadow: 'var(--shadow-card)', touchAction: 'none', display: 'block' }} />
      {/* '다시(지우기)'와 '다 했어요'를 양끝으로 떼어 완료하려다 지우는 오터치 방지 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, width: '100%', maxWidth: 340 }}>
        <button onClick={() => { clearTimeout(timerRef.current); solvedRef.current = false; setSolved(false); fit() }}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800,
          color: 'var(--c-ink-soft)', background: 'transparent', border: '2px solid #e3cba8', borderRadius: 'var(--radius-md)',
          padding: '12px 18px', minHeight: 48 }}>🧽 다시</button>
        <button onClick={finish} style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 24px', minHeight: 48, boxShadow: '0 4px 0 #d98a3a' }}>✓ 다 했어요</button>
      </div>
    </div>
  )
}
