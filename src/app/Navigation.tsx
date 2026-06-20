import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Screen =
  | { name: 'home' }
  | { name: 'subject'; subject: 'hangul' | 'number' | 'english' }
  | { name: 'adventure'; lessonId: string }
  | { name: 'letter'; lessonId: string }
  | { name: 'number'; lessonId: string }
  | { name: 'abc'; lessonId: string }
  | { name: 'dressup' }
  | { name: 'royal' }
  | { name: 'stickers' }
  | { name: 'draw' }
  | { name: 'egg' }
  | { name: 'garden' }
  | { name: 'family' }
  | { name: 'wordbook' }
  | { name: 'badges' }
  | { name: 'review' }
  | { name: 'parent' }

interface Nav { screen: Screen; go: (s: Screen) => void }
const NavContext = createContext<Nav | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const value = useMemo(() => ({ screen, go: setScreen }), [screen])
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

// 훅과 Provider를 같은 파일에 두기 위한 의도적 예외(런타임 무관, fast-refresh DX 룰).
// eslint-disable-next-line react-refresh/only-export-components
export function useNavigation(): Nav {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
