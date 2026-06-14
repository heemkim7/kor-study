import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { addStars, completeLesson, learnWords, setPrincessName, unlockItem, equipItem, markPlayed, type Progress } from './progress'
import { loadProgress, saveProgress } from './storage'

type Action =
  | { type: 'addStars'; n: number }
  | { type: 'learnWords'; ids: string[] }
  | { type: 'completeLesson'; lessonId: string }
  | { type: 'setPrincessName'; name: string }
  | { type: 'unlockItem'; itemId: string; costOverride?: number }
  | { type: 'equipItem'; itemId: string }
  | { type: 'markPlayed'; today: string }

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'addStars': return addStars(state, action.n)
    case 'learnWords': return learnWords(state, action.ids)
    case 'completeLesson': return completeLesson(state, action.lessonId)
    case 'setPrincessName': return setPrincessName(state, action.name)
    case 'unlockItem': return unlockItem(state, action.itemId, action.costOverride)
    case 'equipItem': return equipItem(state, action.itemId)
    case 'markPlayed': return markPlayed(state, action.today)
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

// 훅과 Provider를 같은 파일에 두기 위한 의도적 예외(런타임 무관, fast-refresh DX 룰).
// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
