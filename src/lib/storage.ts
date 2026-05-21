import type { Character } from './rpg'

// ─────────────────────────────────────────────────────────────────────────────
// Habits
// ─────────────────────────────────────────────────────────────────────────────

export type QuestKind = 'boolean' | 'quantity'

export interface Habit {
  id: string
  dbId?: string             // UUID do Supabase (preenchido após sync)
  label: string
  icon: string
  xp: number
  creds: number
  stat: string
  type: 'daily' | 'every3days' | 'weekly'
  // quantity quests
  kind?: QuestKind          // defaults to 'boolean'
  targetValue?: number      // e.g. 8000 (steps), 20 (pages)
  unit?: string             // e.g. 'passos', 'páginas', 'min'
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding Themes
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId = 'balanced' | 'athlete' | 'hacker' | 'monk'

export interface OnboardingTheme {
  id: ThemeId
  label: string
  icon: string
  desc: string
  color: string
  habits: Habit[]
}

const BALANCED_HABITS: Habit[] = [
  { id: 'wakeup',  label: 'Acordar cedo',          icon: '🌅', xp: 25, creds: 5,  stat: 'discipline', type: 'daily' },
  { id: 'dishes',  label: 'Louça em dia',           icon: '🫧', xp: 20, creds: 4,  stat: 'discipline', type: 'daily' },
  { id: 'gym',     label: 'Exercício físico',        icon: '⚡', xp: 50, creds: 10, stat: 'strength',   type: 'daily' },
  { id: 'water',   label: 'Beber 2.5L de água',      icon: '💧', xp: 30, creds: 6,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 8, unit: 'copos' },
  { id: 'laundry', label: 'Lavar roupa',              icon: '👕', xp: 25, creds: 5,  stat: 'discipline', type: 'every3days' },
  { id: 'sleep',   label: 'Dormir 7h+',               icon: '🌙', xp: 20, creds: 4,  stat: 'mind',       type: 'daily' },
  { id: 'reading', label: 'Ler 20 min',               icon: '📖', xp: 15, creds: 3,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 20, unit: 'min' },
]

const ATHLETE_HABITS: Habit[] = [
  { id: 'wakeup',     label: 'Acordar às 7h',          icon: '🌅', xp: 30, creds: 6,  stat: 'discipline', type: 'daily' },
  { id: 'gym',        label: 'Treino de força',          icon: '🏋️', xp: 60, creds: 12, stat: 'strength',   type: 'daily' },
  { id: 'cardio',     label: 'Cardio 20 min',            icon: '🏃', xp: 35, creds: 7,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 20, unit: 'min' },
  { id: 'protein',    label: 'Atingir proteína diária',  icon: '🥩', xp: 25, creds: 5,  stat: 'strength',   type: 'daily' },
  { id: 'water',      label: 'Beber 3L de água',         icon: '💧', xp: 30, creds: 6,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 10, unit: 'copos' },
  { id: 'sleep',      label: 'Dormir 8h+',               icon: '🌙', xp: 25, creds: 5,  stat: 'mind',       type: 'daily' },
  { id: 'stretching', label: 'Alongamento / mobilidade', icon: '🧘', xp: 20, creds: 4,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 10, unit: 'min' },
]

const HACKER_HABITS: Habit[] = [
  { id: 'wakeup',    label: 'Acordar às 8h',           icon: '🌅', xp: 25, creds: 5,  stat: 'discipline', type: 'daily' },
  { id: 'deepwork',  label: 'Deep work / código',       icon: '💻', xp: 60, creds: 12, stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 60, unit: 'min' },
  { id: 'learning',  label: 'Aprender algo novo',       icon: '🧠', xp: 35, creds: 7,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 30, unit: 'min' },
  { id: 'nophone',   label: 'Sem redes sociais pela manhã', icon: '📵', xp: 25, creds: 5, stat: 'discipline', type: 'daily' },
  { id: 'reading',   label: 'Ler (técnico ou não)',      icon: '📖', xp: 20, creds: 4,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 20, unit: 'min' },
  { id: 'water',     label: 'Beber 2L de água',          icon: '💧', xp: 20, creds: 4,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 7, unit: 'copos' },
  { id: 'sleep',     label: 'Dormir 7h+',                icon: '🌙', xp: 20, creds: 4,  stat: 'mind',       type: 'daily' },
]

const MONK_HABITS: Habit[] = [
  { id: 'wakeup',      label: 'Acordar às 6h',           icon: '🌅', xp: 30, creds: 6,  stat: 'discipline', type: 'daily' },
  { id: 'meditation',  label: 'Meditação',                icon: '🧘', xp: 35, creds: 7,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 10, unit: 'min' },
  { id: 'journaling',  label: 'Journaling',               icon: '📓', xp: 25, creds: 5,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 10, unit: 'min' },
  { id: 'reading',     label: 'Leitura diária',           icon: '📖', xp: 25, creds: 5,  stat: 'mind',       type: 'daily', kind: 'quantity', targetValue: 30, unit: 'min' },
  { id: 'nophone',     label: 'Sem telemóvel após 22h',   icon: '📵', xp: 20, creds: 4,  stat: 'discipline', type: 'daily' },
  { id: 'water',       label: 'Beber 2.5L de água',       icon: '💧', xp: 20, creds: 4,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 8, unit: 'copos' },
  { id: 'sleep',       label: 'Dormir às 23h',            icon: '🌙', xp: 30, creds: 6,  stat: 'mind',       type: 'daily' },
]

export const THEMES: OnboardingTheme[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    icon: '🎯',
    desc: 'Mix equilibrado de saúde, disciplina e mente. Boa opção se queres começar sem focar numa área específica.',
    color: '#00f5ff',
    habits: BALANCED_HABITS,
  },
  {
    id: 'athlete',
    label: 'Athlete',
    icon: '🏋️',
    desc: 'Foco em performance física: treino, nutrição, recuperação e hidratação. Para quem leva o corpo a sério.',
    color: '#ff00aa',
    habits: ATHLETE_HABITS,
  },
  {
    id: 'hacker',
    label: 'Hacker',
    icon: '💻',
    desc: 'Produtividade e foco máximo. Deep work, aprendizagem contínua e higiene digital.',
    color: '#00ff88',
    habits: HACKER_HABITS,
  },
  {
    id: 'monk',
    label: 'Monk',
    icon: '🧘',
    desc: 'Equilíbrio mental, slow living e introspecção. Meditação, journaling e rotinas tranquilas.',
    color: '#ffee00',
    habits: MONK_HABITS,
  },
]

// Extra habits the user can add during onboarding
export const EXTRA_HABITS: Habit[] = [
  { id: 'steps',      label: 'Caminhar / passos',       icon: '👣', xp: 25, creds: 5,  stat: 'health',     type: 'daily', kind: 'quantity', targetValue: 8000, unit: 'passos' },
  { id: 'cold_shower',label: 'Duche frio',               icon: '🚿', xp: 20, creds: 4,  stat: 'discipline', type: 'daily' },
  { id: 'no_sugar',   label: 'Sem açúcar processado',    icon: '🚫', xp: 20, creds: 4,  stat: 'health',     type: 'daily' },
  { id: 'gratitude',  label: 'Gratidão / afirmações',    icon: '🙏', xp: 15, creds: 3,  stat: 'mind',       type: 'daily' },
  { id: 'vitamin',    label: 'Tomar vitaminas',           icon: '💊', xp: 10, creds: 2,  stat: 'health',     type: 'daily' },
  { id: 'budget',     label: 'Rever gastos do dia',       icon: '💰', xp: 15, creds: 3,  stat: 'discipline', type: 'daily' },
  { id: 'laundry',    label: 'Lavar roupa',               icon: '👕', xp: 25, creds: 5,  stat: 'discipline', type: 'every3days' },
  { id: 'dishes',     label: 'Louça em dia',              icon: '🫧', xp: 20, creds: 4,  stat: 'discipline', type: 'daily' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Shop
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopItem {
  id: string
  label: string
  desc: string
  icon: string
  cost: number
  category: 'food' | 'leisure' | 'wellness' | 'gear'
}

export interface PurchasedItem {
  itemId: string
  date: string
  credsBefore: number
  credsAfter: number
  txId: string
}

export const SHOP_ITEMS: ShopItem[] = [
  // Food & Drink
  { id: 'dinner_out',     label: 'Jantar Fora',          desc: 'Mereces um bom jantar num restaurante à tua escolha.',        icon: '🍽️',  cost: 300, category: 'food' },
  { id: 'sushi',          label: 'Noite de Sushi',        desc: 'Um jantar de sushi premium, sem culpa.',                      icon: '🍣',  cost: 250, category: 'food' },
  { id: 'burger',         label: 'Hambúrguer Especial',   desc: 'Um bom hambúrguer artesanal quando quiseres.',               icon: '🍔',  cost: 100, category: 'food' },
  { id: 'coffee',         label: 'Café Especial',         desc: 'Um café de especialidade ou drink à tua escolha.',           icon: '☕',  cost: 50,  category: 'food' },
  // Leisure
  { id: 'movie_night',    label: 'Noite de Cinema',       desc: 'Uma sessão de cinema com pipocas incluídas.',                icon: '🎬',  cost: 150, category: 'leisure' },
  { id: 'gaming_session', label: 'Sessão Gaming Livre',   desc: 'Uma tarde inteira a jogar sem culpa.',                       icon: '🎮',  cost: 80,  category: 'leisure' },
  { id: 'series_binge',   label: 'Maratona de Série',     desc: 'Uma tarde/noite a ver uma série à tua escolha.',             icon: '📺',  cost: 110, category: 'leisure' },
  { id: 'day_off',        label: 'Dia de Descanso Total', desc: 'Um dia inteiro sem obrigações. Mereces.',                   icon: '😴',  cost: 400, category: 'leisure' },
  // Wellness
  { id: 'massage',        label: 'Massagem',              desc: 'Uma sessão de massagem para recuperação.',                   icon: '💆',  cost: 350, category: 'wellness' },
  { id: 'supplement',     label: 'Suplemento',            desc: 'Um suplemento ou produto de saúde à tua escolha.',          icon: '💊',  cost: 200, category: 'wellness' },
  // Gear
  { id: 'new_gear',       label: 'Roupa de Treino',       desc: 'Uma peça nova de roupa de treino à tua escolha.',            icon: '👟',  cost: 600, category: 'gear' },
  { id: 'book',           label: 'Livro Novo',            desc: 'Compra aquele livro que tens em wishlist.',                  icon: '📚',  cost: 180, category: 'gear' },
  { id: 'tech_gadget',    label: 'Gadget Tech',           desc: 'Um pequeno gadget ou acessório tech que estejas a querer.', icon: '🔧',  cost: 700, category: 'gear' },
]

// ─────────────────────────────────────────────────────────────────────────────
// App State
// ─────────────────────────────────────────────────────────────────────────────

export interface WeightLog {
  date: string
  value: number
}

export interface AppState {
  userId: string
  onboardingDone: boolean
  character: Character
  // dailyLogs: date → habitId → true (boolean) | number (quantity)
  dailyLogs: Record<string, Record<string, boolean | number>>
  weightLogs: WeightLog[]
  waterLogs: Record<string, number>
  achievements: string[]
  habits: Habit[]
  purchases: PurchasedItem[]
}

const KEY = 'routine_rpg'

function generateUserId(): string {
  return 'usr_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16)
}

const defaultState = (): AppState => ({
  userId: generateUserId(),
  onboardingDone: false,
  character: {
    name: 'Runner',
    level: 1,
    xp: 0,
    totalXp: 0,
    creds: 0,
    stats: { strength: 1, health: 1, discipline: 1, mind: 1 },
    streak: 0,
    lastActive: null,
  },
  dailyLogs: {},
  weightLogs: [],
  waterLogs: {},
  achievements: [],
  habits: BALANCED_HABITS,
  purchases: [],
})

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const saved = JSON.parse(raw) as Partial<AppState>
    const def = defaultState()
    return {
      ...def,
      ...saved,
      userId: saved.userId ?? def.userId,
      onboardingDone: saved.onboardingDone ?? false,
      character: {
        ...def.character,
        ...saved.character,
        creds: saved.character?.creds ?? 0,
      },
      habits: saved.habits?.length ? saved.habits : def.habits,
      purchases: saved.purchases ?? [],
    }
  } catch {
    return defaultState()
  }
}

export const saveState = (state: AppState): void => {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export const today = (): string => new Date().toISOString().split('T')[0]

/** Returns true if >=70% of today's habits are completed */
export const isDailyComplete = (
  habits: Habit[],
  log: Record<string, boolean | number>
): boolean => {
  const done = habits.filter((h) => {
    const val = log[h.id]
    if (h.kind === 'quantity') return typeof val === 'number' && val >= (h.targetValue ?? 1)
    return val === true
  }).length
  return habits.length > 0 && done / habits.length >= 0.7
}
