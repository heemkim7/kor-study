import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { addStars, completeLesson, learnWords, setPrincessName, type Progress } from './progress'
import { loadProgress, saveProgress } from './storage'

type Action =
  | { type: 'addStars'; n: number }
  | { type: 'learnWords'; ids: string[] }
  | { type: 'completeLesson'; lessonId: string }
  | { type: 'setPrincessName'; name: string }

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'addStars': return addStars(state, action.n)
    case 'learnWords': return learnWords(state, action.ids)
    case 'completeLesson': return completeLesson(state, action.lessonId)
    case 'setPrincessName': return setPrincessName(state, action.name)
  }
}

interface Ctx { progress: Progress; dispatch: React.Dispatch<Action> }
const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, undefined, loadProgress)
  useEffect(() => { saveProgress(progress) }, [progress])
  const value = useMemo(() => ({ progress, dispatch }), [progress])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
