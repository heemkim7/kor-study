export function Sparkles() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
      <span style={{ animation: 'pop .6s ease' }}>✨</span>
      <style>{`@keyframes pop{0%{transform:scale(.4);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:0}}`}</style>
    </div>
  )
}
