import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { loadState, saveState, today, isDailyComplete, type AppState, type Habit } from '../lib/storage'
import { addXP, STAT_MAP } from '../lib/rpg'
import {
  dbUpsertUser,
  dbUpsertCharacter,
  dbUpsertHabits,
  dbUpsertDailyLog,
  dbDeleteDailyLog,
  dbUpsertWaterLog,
  dbInsertWeightLog,
  dbInsertPurchase,
  dbUpsertDailySummary,
  dbPullState,
} from '../lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

type Action =
  | { type: 'COMPLETE_HABIT'; habitId: string }
  | { type: 'UNCOMPLETE_HABIT'; habitId: string }
  | { type: 'LOG_QUANTITY'; habitId: string; value: number }
  | { type: 'LOG_WATER'; value: number }
  | { type: 'LOG_WEIGHT'; value: number }
  | { type: 'SET_CHARACTER_NAME'; name: string }
  | { type: 'CLEAR_LEVEL_UP' }
  | { type: 'BUY_ITEM'; itemId: string; cost: number; txId: string; date: string }
  | { type: 'COMPLETE_ONBOARDING'; name: string; habits: Habit[]; theme: string }
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'MERGE_REMOTE'; partial: Partial<AppState> }

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the habit ID to use as FK in daily_logs (slug = stable text id) */
function habitDbId(habit: Habit): string {
  return habit.id
}

/** Count done habits for a given log + habit list */
function countDone(habits: Habit[], log: Record<string, boolean | number>): number {
  return habits.filter((h) => {
    const val = log[h.id]
    if (h.kind === 'quantity') return typeof val === 'number' && val >= (h.targetValue ?? 1)
    return val === true
  }).length
}

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {

    case 'COMPLETE_HABIT': {
      const { habitId } = action
      const date = today()
      const dayLog = state.dailyLogs[date] ?? {}
      if (dayLog[habitId]) return state
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state
      const updatedChar = addXP(state.character, habit.xp)
      updatedChar.creds = (updatedChar.creds ?? 0) + (habit.creds ?? 0)
      const statKey = STAT_MAP[habitId]?.stat
      if (statKey) {
        updatedChar.stats = {
          ...updatedChar.stats,
          [statKey]: parseFloat(((updatedChar.stats[statKey as keyof typeof updatedChar.stats] ?? 1) + 0.1).toFixed(2)),
        }
      }
      return {
        ...state,
        character: updatedChar,
        dailyLogs: { ...state.dailyLogs, [date]: { ...dayLog, [habitId]: true } },
      }
    }

    case 'UNCOMPLETE_HABIT': {
      const { habitId } = action
      const date = today()
      const dayLog = state.dailyLogs[date] ?? {}
      if (!dayLog[habitId] && dayLog[habitId] !== 0) return state
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state
      const char = { ...state.character }
      char.xp = Math.max(0, char.xp - habit.xp)
      char.totalXp = Math.max(0, (char.totalXp ?? 0) - habit.xp)
      char.creds = Math.max(0, (char.creds ?? 0) - (habit.creds ?? 0))
      const statKey = STAT_MAP[habitId]?.stat
      if (statKey) {
        char.stats = {
          ...char.stats,
          [statKey]: parseFloat((Math.max(1, (char.stats[statKey as keyof typeof char.stats] ?? 1) - 0.1)).toFixed(2)),
        }
      }
      const newDayLog = { ...dayLog }
      delete newDayLog[habitId]
      return { ...state, character: char, dailyLogs: { ...state.dailyLogs, [date]: newDayLog } }
    }

    case 'LOG_QUANTITY': {
      const { habitId, value } = action
      const date = today()
      const dayLog = state.dailyLogs[date] ?? {}
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state
      const wasComplete = typeof dayLog[habitId] === 'number' && (dayLog[habitId] as number) >= (habit.targetValue ?? 1)
      const nowComplete = value >= (habit.targetValue ?? 1)
      let char = { ...state.character }
      if (!wasComplete && nowComplete) {
        char = addXP(char, habit.xp)
        char.creds = (char.creds ?? 0) + (habit.creds ?? 0)
        const statKey = STAT_MAP[habitId]?.stat
        if (statKey) {
          char.stats = {
            ...char.stats,
            [statKey]: parseFloat(((char.stats[statKey as keyof typeof char.stats] ?? 1) + 0.1).toFixed(2)),
          }
        }
      }
      if (wasComplete && !nowComplete) {
        char.xp = Math.max(0, char.xp - habit.xp)
        char.totalXp = Math.max(0, (char.totalXp ?? 0) - habit.xp)
        char.creds = Math.max(0, (char.creds ?? 0) - (habit.creds ?? 0))
      }
      return {
        ...state,
        character: char,
        dailyLogs: { ...state.dailyLogs, [date]: { ...dayLog, [habitId]: value } },
      }
    }

    case 'LOG_WATER':
      return { ...state, waterLogs: { ...state.waterLogs, [today()]: action.value } }

    case 'LOG_WEIGHT':
      return { ...state, weightLogs: [...(state.weightLogs ?? []), { date: today(), value: action.value }] }

    case 'SET_CHARACTER_NAME':
      return { ...state, character: { ...state.character, name: action.name } }

    case 'CLEAR_LEVEL_UP':
      return { ...state, character: { ...state.character, leveledUp: false } }

    case 'BUY_ITEM': {
      const { itemId, cost, txId, date } = action
      const credsBefore = state.character.creds ?? 0
      if (credsBefore < cost) return state
      const credsAfter = credsBefore - cost
      return {
        ...state,
        character: { ...state.character, creds: credsAfter },
        purchases: [...(state.purchases ?? []), { itemId, date, credsBefore, credsAfter, txId }],
      }
    }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboardingDone: true,
        habits: action.habits,
        character: { ...state.character, name: action.name },
      }

    case 'SET_HABITS':
      return { ...state, habits: action.habits }

    case 'MERGE_REMOTE': {
      // Merge remote data — remote wins for character & habits if they exist,
      // but keep local dailyLogs, waterLogs, weightLogs, purchases
      const { partial } = action
      return {
        ...state,
        character: partial.character
          ? { ...state.character, ...partial.character }
          : state.character,
        habits: partial.habits?.length
          ? partial.habits
          : state.habits,
      }
    }

    default:
      return state
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: AppState
  completeHabit: (id: string) => void
  uncompleteHabit: (id: string) => void
  logQuantity: (habitId: string, value: number) => void
  logWater: (v: number) => void
  logWeight: (v: number) => void
  setName: (n: string) => void
  clearLevelUp: () => void
  buyItem: (itemId: string, cost: number, txId: string, date: string) => void
  completeOnboarding: (name: string, habits: Habit[], theme: string) => void
  setHabits: (habits: Habit[]) => void
}

const GameContext = createContext<GameContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const stateRef = useRef(state)
  stateRef.current = state

  // ── Persist locally on every state change ──────────────────────────────────
  useEffect(() => { saveState(state) }, [state])

  // ── On mount: pull remote state or bootstrap if first time ───────────────
  useEffect(() => {
    if (!state.onboardingDone) return
    const s = stateRef.current
    const userId = s.userId

    dbPullState(userId).then((remote) => {
      if (remote) {
        // User exists in Supabase — merge remote data
        dispatch({ type: 'MERGE_REMOTE', partial: remote })

        // If habits are missing in Supabase (e.g. migration happened after bootstrap),
        // push them now
        if (!remote.habits?.length && s.habits.length > 0) {
          console.log('[db] User exists but has no habits in Supabase — pushing habits...')
          dbUpsertHabits(userId, s.habits)
        }
      } else {
        // User doesn't exist in Supabase yet — full bootstrap from localStorage
        console.log('[db] User not found in Supabase — bootstrapping from localStorage...')
        dbUpsertUser(userId, s.character.name, 'balanced').then(() => {
          dbUpsertCharacter(userId, s.character)
          dbUpsertHabits(userId, s.habits)
          const date = today()
          const log = s.dailyLogs[date] ?? {}
          s.habits.forEach((habit) => {
            const val = log[habit.id]
            if (val === true) dbUpsertDailyLog(userId, habitDbId(habit), date, 1)
            else if (typeof val === 'number' && val > 0) dbUpsertDailyLog(userId, habitDbId(habit), date, val)
          })
          const glasses = s.waterLogs[date]
          if (glasses) dbUpsertWaterLog(userId, date, glasses)
          s.purchases?.forEach((p) => {
            dbInsertPurchase(userId, p.itemId, p.credsBefore, p.credsAfter, p.txId, p.date)
          })
          console.log('[db] Bootstrap complete.')
        })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount

  // ── Sync character + summary after every state change ─────────────────────
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!state.onboardingDone) return
    // Debounce 1.5s to batch rapid updates (e.g. quantity slider)
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const s = stateRef.current
      const userId = s.userId
      dbUpsertCharacter(userId, s.character)

      // Daily summary
      const date = today()
      const log = s.dailyLogs[date] ?? {}
      const done = countDone(s.habits, log)
      dbUpsertDailySummary(userId, date, done, s.habits.length, 0, 0)
    }, 1500)
  }, [state.character, state.dailyLogs, state.onboardingDone])

  // ─────────────────────────────────────────────────────────────────────────
  // Action helpers
  // ─────────────────────────────────────────────────────────────────────────

  const completeHabit = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_HABIT', habitId: id })
    const s = stateRef.current
    const habit = s.habits.find((h) => h.id === id)
    if (!habit) return
    dbUpsertDailyLog(s.userId, habitDbId(habit), today(), 1)
  }, [])

  const uncompleteHabit = useCallback((id: string) => {
    dispatch({ type: 'UNCOMPLETE_HABIT', habitId: id })
    const s = stateRef.current
    const habit = s.habits.find((h) => h.id === id)
    if (!habit) return
    dbDeleteDailyLog(s.userId, habitDbId(habit), today())
  }, [])

  const logQuantity = useCallback((habitId: string, value: number) => {
    dispatch({ type: 'LOG_QUANTITY', habitId, value })
    const s = stateRef.current
    const habit = s.habits.find((h) => h.id === habitId)
    if (!habit) return
    dbUpsertDailyLog(s.userId, habitDbId(habit), today(), value)
  }, [])

  const logWater = useCallback((v: number) => {
    dispatch({ type: 'LOG_WATER', value: v })
    const s = stateRef.current
    dbUpsertWaterLog(s.userId, today(), v)
  }, [])

  const logWeight = useCallback((v: number) => {
    dispatch({ type: 'LOG_WEIGHT', value: v })
    const s = stateRef.current
    dbInsertWeightLog(s.userId, v)
  }, [])

  const setName = useCallback((n: string) => {
    dispatch({ type: 'SET_CHARACTER_NAME', name: n })
    const s = stateRef.current
    dbUpsertUser(s.userId, n, 'balanced')
  }, [])

  const clearLevelUp = useCallback(() => dispatch({ type: 'CLEAR_LEVEL_UP' }), [])

  const buyItem = useCallback((itemId: string, cost: number, txId: string, date: string) => {
    dispatch({ type: 'BUY_ITEM', itemId, cost, txId, date })
    const s = stateRef.current
    const credsBefore = s.character.creds ?? 0
    dbInsertPurchase(s.userId, itemId, credsBefore, credsBefore - cost, txId, date)
  }, [])

  const completeOnboarding = useCallback((name: string, habits: Habit[], theme: string) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', name, habits, theme })
    const s = stateRef.current
    const userId = s.userId
    dbUpsertUser(userId, name, theme).then(() => {
      dbUpsertCharacter(userId, { ...s.character, name })
      dbUpsertHabits(userId, habits)
    })
  }, [])

  const setHabits = useCallback((habits: Habit[]) => {
    dispatch({ type: 'SET_HABITS', habits })
    const s = stateRef.current
    dbUpsertHabits(s.userId, habits)
  }, [])

  return (
    <GameContext.Provider value={{
      state, completeHabit, uncompleteHabit, logQuantity,
      logWater, logWeight, setName, clearLevelUp, buyItem,
      completeOnboarding, setHabits,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
