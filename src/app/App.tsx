import { ProgressProvider } from '../progress/useProgress'
import { NavigationProvider, useNavigation } from './Navigation'
import { Home } from './Home'
import { Adventure } from './Adventure'

function Router() {
  const { screen } = useNavigation()
  if (screen.name === 'adventure') return <Adventure lessonId={screen.lessonId} />
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
