import { useNavigation } from './Navigation'

// 개인정보처리방침 + 이용약관 '초안'. 출시 전 문의처·결제 조항을 채우고 전문가 검토를 받을 것.
const SECTIONS: { title: string; body: string[] }[] = [
  { title: '1. 수집하는 정보', body: [
    '이 앱은 회원가입이 없고, 이름·연락처·위치·사진·광고 식별자를 수집하지 않습니다.',
    '학습 기록(별, 완료한 레슨, 배운 단어)과 보호자가 입력한 아이 이름·가족 단어는 이 기기의 저장 공간에만 보관되며 서버로 전송되지 않습니다.',
  ] },
  { title: '2. 아이의 정보', body: [
    '만 14세 미만 아동이 사용하는 앱이므로 광고, 행동 추적, 외부 링크, 채팅 기능을 넣지 않습니다.',
    '설정·리포트·결제와 같은 보호자 기능은 곱셈 확인을 거친 뒤에만 열립니다.',
  ] },
  { title: '3. 제3자 제공', body: [
    '수집하는 정보가 없으므로 제3자에게 제공하지 않습니다. 결제를 도입하면 결제대행사가 결제 처리에 필요한 정보만 처리하며, 그 내용은 이 문서에 추가됩니다.',
  ] },
  { title: '4. 데이터 삭제', body: [
    '보호자 화면의 ‘처음부터 다시’로 이 기기의 모든 학습 기록을 지울 수 있고, 앱 삭제 시 함께 사라집니다.',
  ] },
  { title: '5. 구독 및 환불 (결제 도입 시 확정)', body: [
    '무료 체험 범위, 구독 요금, 갱신·해지 방법, 환불 기준은 결제 연동 시 이 항목에 명시합니다.',
  ] },
  { title: '6. 문의', body: ['문의처: (출시 전 기입)'] },
]

export function Legal() {
  const { go } = useNavigation()
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'parent' })} aria-label="뒤로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20,
          boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>←</button>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 24, marginTop: 4 }}>개인정보처리방침 · 이용약관</h1>
      <p style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: -6 }}>초안 — 출시 전 확정</p>
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map((s) => (
          <section key={s.title} style={{ padding: '14px 16px', borderRadius: 'var(--radius-lg)',
            background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 16, marginBottom: 6 }}>{s.title}</h2>
            {s.body.map((t) => <p key={t} style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--c-ink-soft)', marginTop: 4 }}>{t}</p>)}
          </section>
        ))}
      </div>
    </div>
  )
}
