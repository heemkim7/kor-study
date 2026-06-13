const PREFERRED = ['Yuna', 'Google 한국', 'Microsoft Heami', 'Microsoft SunHi', 'Kyuri', 'Nara']

export function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ko = voices.filter((vc) => vc.lang?.toLowerCase().startsWith('ko'))
  if (ko.length === 0) return null
  for (const name of PREFERRED) {
    const found = ko.find((vc) => vc.name.includes(name))
    if (found) return found
  }
  return ko[0]
}
