export interface Rank {
  minLevel: number
  maxLevel: number
  title: string
  color: string
}

export interface Stats {
  strength: number
  health: number
  discipline: number
  mind: number
}

export interface Character {
  name: string
  level: number
  xp: number
  totalXp: number
  creds: number
  stats: Stats
  streak: number
  bestStreak?: number
  lastActive: string | null
  leveledUp?: boolean
  levelsGained?: number
}

// XP required per level (increases progressively)
export const XP_PER_LEVEL = (level: number): number =>
  Math.floor(100 * Math.pow(1.4, level - 1))

export const RANKS: Rank[] = [
  { minLevel: 1,  maxLevel: 4,  title: 'Flatline',   color: '#666688' },
  { minLevel: 5,  maxLevel: 9,  title: 'Street Rat', color: '#00ff88' },
  { minLevel: 10, maxLevel: 14, title: 'Runner',      color: '#00f5ff' },
  { minLevel: 15, maxLevel: 19, title: 'Merc',        color: '#ffee00' },
  { minLevel: 20, maxLevel: 29, title: 'Edgerunner',  color: '#ff8800' },
  { minLevel: 30, maxLevel: 49, title: 'Netrunner',   color: '#ff00aa' },
  { minLevel: 50, maxLevel: 99, title: 'Legend',      color: '#ffffff' },
]

export const getRank = (level: number): Rank =>
  RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ?? RANKS[0]

// Creds earned per level-up (scales with level)
export const CREDS_PER_LEVEL = (level: number): number => Math.floor(50 * Math.pow(1.2, level - 1))

export const addXP = (character: Character, amount: number): Character => {
  let { xp, level, totalXp, creds } = character
  xp += amount
  totalXp = (totalXp ?? 0) + amount
  creds = creds ?? 0
  let leveledUp = false
  let levelsGained = 0

  while (xp >= XP_PER_LEVEL(level)) {
    xp -= XP_PER_LEVEL(level)
    creds += CREDS_PER_LEVEL(level) // earn creds on level up
    level++
    leveledUp = true
    levelsGained++
  }

  return { ...character, xp, level, totalXp, creds, leveledUp, levelsGained }
}

export type StatKey = 'strength' | 'health' | 'discipline' | 'mind'
export type GlowColor = 'cyan' | 'magenta' | 'yellow' | 'green'

export const STAT_MAP: Record<string, { stat: StatKey; label: string }> = {
  gym:     { stat: 'strength',   label: 'Força' },
  water:   { stat: 'health',     label: 'Saúde' },
  dishes:  { stat: 'discipline', label: 'Disciplina' },
  laundry: { stat: 'discipline', label: 'Disciplina' },
  sleep:   { stat: 'mind',       label: 'Mente' },
  reading: { stat: 'mind',       label: 'Mente' },
  weight:  { stat: 'health',     label: 'Saúde' },
}
