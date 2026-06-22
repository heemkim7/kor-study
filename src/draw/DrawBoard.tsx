import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useTts } from '../tts/useTts'

// 색칠 템플릿 — 캔버스에 옅은 윤곽선을 그려 두고 그 위에 색칠한다.
type TemplateId = 'free' | 'apple' | 'star' | 'butterfly' | 'house' | 'flower'
const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'free', label: '✏️' },
  { id: 'apple', label: '🍎' },
  { id: 'star', label: '⭐' },
  { id: 'butterfly', label: '🦋' },
  { id: 'house', label: '🏠' },
  { id: 'flower', label: '🌷' },
]

const COLORS: { hex: string; name: string }[] = [
  { hex: '#e3342f', name: '빨강' }, { hex: '#ff8a3d', name: '주황' }, { hex: '#ffd23f', name: '노랑' },
  { hex: '#3ec46d', name: '초록' }, { hex: '#3aa0ff', name: '파랑' }, { hex: '#9b6bff', name: '보라' },
  { hex: '#ff7ac0', name: '분홍' }, { hex: '#8b5a2b', name: '갈색' }, { hex: '#3a3a44', name: '검정' },
]
const SIZES: { key: 's' | 'm' | 'l'; r: number; dot: number }[] = [
  { key: 's', r: 0.012, dot: 12 }, { key: 'm', r: 0.025, dot: 18 }, { key: 'l', r: 0.045, dot: 26 },
]
const OUTLINE = '#cdbfa8'

function drawTemplate(ctx: CanvasRenderingContext2D, w: number, h: number, id: TemplateId): void {
  ctx.save()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.012)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32
  if (id === 'apple') {
    ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.1, R * 0.95, R * 1.05, 0, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy - R * 0.95); ctx.lineTo(cx + R * 0.12, cy - R * 1.4); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(cx + R * 0.42, cy - R * 1.3, R * 0.3, R * 0.15, -0.6, 0, Math.PI * 2); ctx.stroke()
  } else if (id === 'star') {
    const pts = [[0, -1], [0.225, -0.31], [0.95, -0.31], [0.36, 0.12], [0.59, 0.81], [0, 0.38], [-0.59, 0.81], [-0.36, 0.12], [-0.95, -0.31], [-0.225, -0.31]]
    ctx.beginPath()
    pts.forEach(([x, y], i) => { const px = cx + x * R * 1.15, py = cy + y * R * 1.15; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py) })
    ctx.closePath(); ctx.stroke()
  } else if (id === 'butterfly') {
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.08, R * 0.6, 0, 0, Math.PI * 2); ctx.stroke() // 몸통
    for (const sgn of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(cx + sgn * R * 0.5, cy - R * 0.35, R * 0.45, R * 0.35, 0, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx + sgn * R * 0.45, cy + R * 0.4, R * 0.38, R * 0.3, 0, 0, Math.PI * 2); ctx.stroke()
    }
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx, cy - R * 0.55); ctx.lineTo(cx + sgn * R * 0.25, cy - R * 0.95); ctx.stroke() }
  } else if (id === 'house') {
    ctx.strokeRect(cx - R * 0.8, cy - R * 0.2, R * 1.6, R * 1.1)
    ctx.beginPath(); ctx.moveTo(cx - R * 0.95, cy - R * 0.2); ctx.lineTo(cx, cy - R * 1.0); ctx.lineTo(cx + R * 0.95, cy - R * 0.2); ctx.closePath(); ctx.stroke()
    ctx.strokeRect(cx - R * 0.25, cy + R * 0.35, R * 0.5, R * 0.55) // 문
    ctx.strokeRect(cx + R * 0.3, cy + R * 0.0, R * 0.35, R * 0.35) // 창문
  } else if (id === 'flower') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * R * 0.55, cy - R * 0.2 + Math.sin(a) * R * 0.55, R * 0.32, R * 0.32, 0, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.2, R * 0.28, R * 0.28, 0, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy + R * 0.1); ctx.lineTo(cx, cy + R * 1.35); ctx.stroke() // 줄기
  }
  ctx.restore()
}

export function DrawBoard() {
  const { go } = useNavigation()
  const { speak } = useTts()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const templateRef = useRef<TemplateId>('free') // 리사이즈 콜백에서 현재 템플릿을 읽기 위함

  const [color, setColor] = useState(COLORS[0].hex)
  const [erasing, setErasing] = useState(false)
  const [sizeKey, setSizeKey] = useState<'s' | 'm' | 'l'>('m')
  const [template, setTemplate] = useState<TemplateId>('free')

  // 한 번 되돌리기: 지우기·템플릿 전환 직전 그림을 스냅샷해, 실수로 날려도 ↩️로 복구.
  const undoRef = useRef<ImageData | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(undoTimer.current), [])

  function snapshot() {
    const cv = canvasRef.current, ctx = ctxRef.current
    if (!cv || !ctx) return
    try { undoRef.current = ctx.getImageData(0, 0, cv.width, cv.height) } catch { undoRef.current = null }
    setCanUndo(true)
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setCanUndo(false), 8000)
  }
  function undo() {
    const ctx = ctxRef.current
    if (!ctx || !undoRef.current) return
    ctx.putImageData(undoRef.current, 0, 0)
    setCanUndo(false)
  }

  // 포인터 핸들러는 매 렌더마다 새로 바인딩되어 color/erasing/sizeKey 최신값을 클로저로 캡처한다.

  function reset(id: TemplateId) {
    const cv = canvasRef.current, ctx = ctxRef.current
    if (!cv || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cv.width, cv.height)
    if (id !== 'free') drawTemplate(ctx, cv.width, cv.height, id)
  }

  // 캔버스 백킹 크기를 화면(+DPR)에 맞춘다. ResizeObserver로 회전/리사이즈에도 좌표가 어긋나지 않게 동기화.
  // (크기가 바뀌면 캔버스가 초기화되므로 현재 템플릿 윤곽선을 다시 그린다.)
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    ctxRef.current = cv.getContext('2d')
    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = cv.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
        reset(templateRef.current)
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(cv)
    return () => ro.disconnect()
  }, [])

  // 첫 진입 안내(1회)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('자유롭게 그려 보세요') }, [])

  // 템플릿이 바뀌면 ref 동기화 + 새 윤곽선으로 초기화
  useEffect(() => { templateRef.current = template; reset(template) }, [template])

  function pos(e: React.PointerEvent) {
    const cv = canvasRef.current
    if (!cv) return { x: 0, y: 0 }
    const rect = cv.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (cv.width / rect.width), y: (e.clientY - rect.top) * (cv.height / rect.height) }
  }
  function widthPx() {
    const cv = canvasRef.current
    if (!cv) return 1
    const base = SIZES.find((s) => s.key === sizeKey)!.r * cv.width
    return erasing ? base * 2.2 : base
  }

  function onDown(e: React.PointerEvent) {
    const ctx = ctxRef.current
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const p = pos(e)
    last.current = p
    ctx.fillStyle = erasing ? '#ffffff' : color
    ctx.beginPath(); ctx.arc(p.x, p.y, widthPx() / 2, 0, Math.PI * 2); ctx.fill()
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const p = pos(e)
    ctx.strokeStyle = erasing ? '#ffffff' : color
    ctx.lineWidth = widthPx()
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    last.current = p
  }
  function onUp() { drawing.current = false }

  const swatch = (bg: string, active: boolean, onClick: () => void, label?: string) => (
    <button onClick={onClick} aria-label={label ?? '색'} style={{
      width: 44, height: 44, borderRadius: 999, border: active ? '4px solid var(--c-ink)' : '3px solid #fff',
      background: bg, boxShadow: active ? '0 0 0 2px var(--c-accent), var(--shadow-card)' : 'var(--shadow-card)',
      transform: active ? 'scale(1.1)' : 'none', transition: 'transform .12s', cursor: 'pointer', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{label && bg === '#fff' ? '🧽' : ''}</button>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      padding: 'max(10px, env(safe-area-inset-top)) 10px 10px', gap: 8, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => go({ name: 'home' })} aria-label="집으로"
          style={{ width: 48, height: 48, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
            fontSize: 23, boxShadow: 'var(--shadow-card)', cursor: 'pointer', flex: '0 0 auto' }}>🏠</button>
        {/* 템플릿(여러 버전) — 6개가 한 줄에 다 보이도록 칸·간격 축소 */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1,
          WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => { if (template !== t.id) snapshot(); setTemplate(t.id) }} style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)', border: 'none', flex: '0 0 auto',
              background: template === t.id ? 'var(--c-accent)' : 'var(--c-card)',
              fontSize: 22, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => { snapshot(); reset(template) }} aria-label="다 지우기" style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)', border: 'none', flex: '0 0 auto',
          background: 'var(--c-card)', fontSize: 23, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🗑️</button>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex' }}>
        <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          style={{ width: '100%', flex: 1, minHeight: 0, borderRadius: 'var(--radius-lg)',
            background: '#fff', boxShadow: 'var(--shadow-card)', touchAction: 'none', display: 'block' }} />
        {/* 지우기·템플릿 전환을 실수로 했을 때 한 번 되돌리기 */}
        {canUndo && (
          <button onClick={undo} aria-label="되돌리기" style={{
            position: 'absolute', left: 12, bottom: 12, border: 'none', borderRadius: 999,
            padding: '10px 18px', minHeight: 44, background: 'var(--c-card)', cursor: 'pointer',
            fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink)',
            boxShadow: '0 4px 0 #e3cba8' }}>↩️ 되돌리기</button>
        )}
      </div>

      {/* 색·붓크기·지우개 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {COLORS.map((c) => swatch(c.hex, !erasing && color === c.hex, () => { setColor(c.hex); setErasing(false) }, c.name))}
        {swatch('#fff', erasing, () => setErasing(true), '지우개')}
        <div style={{ width: 1, height: 28, background: '#e3cba8', margin: '0 2px' }} />
        {SIZES.map((s) => (
          <button key={s.key} onClick={() => setSizeKey(s.key)} aria-label={`붓 ${s.key}`} style={{
            width: 44, height: 44, borderRadius: 999, border: sizeKey === s.key ? '3px solid var(--c-ink)' : '3px solid #fff',
            background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: s.dot, height: s.dot, borderRadius: 999, background: '#3a3a44', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  )
}
