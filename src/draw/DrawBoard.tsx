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

const COLORS = ['#e3342f', '#ff8a3d', '#ffd23f', '#3ec46d', '#3aa0ff', '#9b6bff', '#ff7ac0', '#8b5a2b', '#3a3a44']
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

  const [color, setColor] = useState(COLORS[0])
  const [erasing, setErasing] = useState(false)
  const [sizeKey, setSizeKey] = useState<'s' | 'm' | 'l'>('m')
  const [template, setTemplate] = useState<TemplateId>('free')

  // 포인터 핸들러는 매 렌더마다 새로 바인딩되어 color/erasing/sizeKey 최신값을 클로저로 캡처한다.

  function reset(id: TemplateId) {
    const cv = canvasRef.current, ctx = ctxRef.current
    if (!cv || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cv.width, cv.height)
    if (id !== 'free') drawTemplate(ctx, cv.width, cv.height, id)
  }

  // 마운트 시 캔버스 백킹 크기를 화면에 맞추고 바탕+윤곽선을 그린다.
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const rect = cv.getBoundingClientRect()
    cv.width = Math.max(1, Math.round(rect.width * dpr))
    cv.height = Math.max(1, Math.round(rect.height * dpr))
    ctxRef.current = cv.getContext('2d')
    reset('free')
    speak('자유롭게 그려 보세요')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 템플릿이 바뀌면 새 윤곽선으로 초기화
  useEffect(() => { reset(template) }, [template])

  function pos(e: React.PointerEvent) {
    const cv = canvasRef.current!
    const rect = cv.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (cv.width / rect.width), y: (e.clientY - rect.top) * (cv.height / rect.height) }
  }
  function widthPx() {
    const cv = canvasRef.current!
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
    <button onClick={onClick} aria-label={label} style={{
      width: 34, height: 34, borderRadius: 999, border: active ? '3px solid var(--c-ink)' : '3px solid #fff',
      background: bg, boxShadow: 'var(--shadow-card)', cursor: 'pointer', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{label && bg === '#fff' ? '🧽' : ''}</button>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      padding: 'max(10px, env(safe-area-inset-top)) 10px 10px', gap: 8, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => go({ name: 'home' })} aria-label="집으로"
          style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
            fontSize: 18, boxShadow: 'var(--shadow-card)', cursor: 'pointer', flex: '0 0 auto' }}>🏠</button>
        {/* 템플릿(여러 버전) */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => setTemplate(t.id)} style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)', border: 'none', flex: '0 0 auto',
              background: template === t.id ? 'var(--c-accent)' : 'var(--c-card)',
              fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => reset(template)} aria-label="다 지우기" style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)', border: 'none', flex: '0 0 auto',
          background: 'var(--c-card)', fontSize: 18, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🗑️</button>
      </div>

      <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ width: '100%', flex: 1, minHeight: 0, borderRadius: 'var(--radius-lg)',
          background: '#fff', boxShadow: 'var(--shadow-card)', touchAction: 'none', display: 'block' }} />

      {/* 색·붓크기·지우개 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {COLORS.map((c) => swatch(c, !erasing && color === c, () => { setColor(c); setErasing(false) }))}
        {swatch('#fff', erasing, () => setErasing(true), '지우개')}
        <div style={{ width: 1, height: 28, background: '#e3cba8', margin: '0 2px' }} />
        {SIZES.map((s) => (
          <button key={s.key} onClick={() => setSizeKey(s.key)} aria-label={`붓 ${s.key}`} style={{
            width: 36, height: 36, borderRadius: 999, border: sizeKey === s.key ? '3px solid var(--c-ink)' : '3px solid #fff',
            background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: s.dot, height: s.dot, borderRadius: 999, background: '#3a3a44', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  )
}
