import { ProgressProvider } from '../progress/useProgress'
import { NavigationProvider, useNavigation } from './Navigation'
import { Home } from './Home'
import { Adventure } from './Adventure'
import { DressUp } from './DressUp'

function Router() {
  const { screen } = useNavigation()
  if (screen.name === 'adventure') return <Adventure lessonId={screen.lessonId} />
  if (screen.name === 'dressup') return <DressUp />
  return <Home />
}

export function App() {
  return (
    <ProgressProvider>
      <NavigationProvider>
        <Router />
      </NavigationProvider>
    </ProgressProvider>
  )
}
