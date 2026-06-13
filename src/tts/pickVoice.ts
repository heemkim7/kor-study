// 자연스러운(neural/online) 음성을 가장 먼저, 그다음 알려진 좋은 음성, 마지막으로 첫 한국어 음성.
// Edge 브라우저는 'Microsoft ... Online (Natural)' 한국어 신경망 음성을 노출하므로 그게 훨씬 자연스럽습니다.
const NATURAL = /natural|neural|online|온라인|자연/i
const PREFERRED = ['Yuna', 'SunHi', 'InJoon', 'Google 한국', 'Heami', 'Kyuri', 'Nara']

export function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ko = voices.filter((vc) => vc.lang?.toLowerCase().startsWith('ko'))
  if (ko.length === 0) return null
  const natural = ko.find((vc) => NATURAL.test(vc.name))
  if (natural) return natural
  for (const name of PREFERRED) {
    const found = ko.find((vc) => vc.name.includes(name))
    if (found) return found
  }
  return ko[0]
}
