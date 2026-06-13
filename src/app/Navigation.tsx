import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Screen = { name: 'home' } | { name: 'adventure'; lessonId: string }

interface Nav { screen: Screen; go: (s: Screen) => void }
const NavContext = createContext<Nav | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const value = useMemo(() => ({ screen, go: setScreen }), [screen])
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavigation(): Nav {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
