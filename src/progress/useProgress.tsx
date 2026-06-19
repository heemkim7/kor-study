import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { addStars, completeLesson, learnWords, setPrincessName, unlockItem, equipItem, markPlayed, addReviewWord, removeReviewWord, logPlay, setDailyGoal, crackEgg, plantSeed, waterPlant, growGarden, openChest, unlockRoyal, type Progress } from './progress'
import { loadProgress, saveProgress } from './storage'

type Action =
  | { type: 'addStars'; n: number }
  | { type: 'learnWords'; ids: string[] }
  | { type: 'completeLesson'; lessonId: string }
  | { type: 'setPrincessName'; name: string }
  | { type: 'unlockItem'; itemId: string; costOverride?: number }
  | { type: 'equipItem'; itemId: string }
  | { type: 'markPlayed'; today: string }
  | { type: 'reviewWrong'; id: string }
  | { type: 'reviewMastered'; id: string }
  | { type: 'logPlay'; today: string }
  | { type: 'setDailyGoal'; n: number }
  | { type: 'crackEgg' }
  | { type: 'plantSeed'; plantId: string }
  | { type: 'waterPlant'; index: number }
  | { type: 'openChest'; today: string }
  | { type: 'unlockRoyal'; id: string }

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'addStars': return addStars(state, action.n)
    case 'learnWords': return learnWords(state, action.ids)
    // 레슨을 완료하면 스티커 지급(completeLesson) + 마법 정원도 한 단계 성장(growGarden)
    case 'completeLesson': return growGarden(completeLesson(state, action.lessonId))
    case 'setPrincessName': return setPrincessName(state, action.name)
    case 'unlockItem': return unlockItem(state, action.itemId, action.costOverride)
    case 'equipItem': return equipItem(state, action.itemId)
    case 'markPlayed': return markPlayed(state, action.today)
    case 'reviewWrong': return addReviewWord(state, action.id)
    case 'reviewMastered': return removeReviewWord(state, action.id)
    case 'logPlay': return logPlay(state, action.today)
    case 'setDailyGoal': return setDailyGoal(state, action.n)
    case 'crackEgg': return crackEgg(state)
    case 'plantSeed': return plantSeed(state, action.plantId)
    case 'waterPlant': return waterPlant(state, action.index)
    case 'openChest': return openChest(state, action.today)
    case 'unlockRoyal': return unlockRoyal(state, action.id)
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
