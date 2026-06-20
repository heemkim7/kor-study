import { useState } from 'react'

// 6~9 곱셈 문제(모듈 함수 — 렌더 중 직접 난수 호출 회피)
function genGateProblem(): { a: number; b: number } {
  return { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }
}

/** 보호자 확인(곱셈 게이트) — 4세가 못 풀게 막고, 통과 시 onPass를 부른다.
 *  리포트 진입과 시간제한 잠금 해제에서 함께 쓴다. */
export function ParentGate({ title, onPass, onCancel }: { title?: string; onPass: () => void; onCancel: () => void }) {
  const [problem, setProblem] = useState(genGateProblem)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  function press(d: string) {
    setWrong(false)
    setInput((s) => (s.length < 3 ? s + d : s))
  }
  function submit() {
    if (Number(input) === problem.a * problem.b) onPass()
    else { setWrong(true); setInput(''); setProblem(genGateProblem()) } // 오답 시 새 문제 → 무차별 대입 차단
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>{title ?? '보호자 확인'}</h2>
      <p style={{ color: 'var(--c-ink-soft)', fontSize: 14, marginTop: -8 }}>아래 곱셈을 풀어 주세요</p>
      <div className={wrong ? 'kp-shake' : undefined}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 36, fontWeight: 800, color: 'var(--c-ink)' }}>
        {problem.a} × {problem.b} = {input || '?'}
      </div>
      {wrong && <div style={{ color: 'var(--c-pink)', fontWeight: 800, fontSize: 14 }}>다시 입력해 주세요</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 8 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)}
            style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none', fontSize: 24, fontWeight: 800,
              background: 'var(--c-card)', boxShadow: '0 4px 0 #f1ddc6' }}>{d}</button>
        ))}
        <button onClick={() => setInput('')} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 16, fontWeight: 800, background: '#f3e7d6' }}>지움</button>
        <button onClick={() => press('0')} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 24, fontWeight: 800, background: 'var(--c-card)', boxShadow: '0 4px 0 #f1ddc6' }}>0</button>
        <button onClick={submit} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 18, fontWeight: 800, color: '#fff', background: 'var(--c-accent)' }}>확인</button>
      </div>
      <button onClick={onCancel} style={{ marginTop: 6, background: 'none', border: 'none',
        color: 'var(--c-ink-soft)', fontSize: 14, textDecoration: 'underline' }}>돌아가기</button>
    </div>
  )
}
