/**
 * db.ts — Todas as operações de leitura/escrita no Supabase.
 *
 * Princípio: cada função é independente e silencia erros (retorna null/false
 * em vez de lançar exceções), para não quebrar a app quando offline.
 */

import { supabase } from './supabase'
import type { AppState, Habit } from './storage'
import type { Character } from './rpg'

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror das tabelas Supabase
// ─────────────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string
  name: string
  theme: string
  auth_id: string | null
  created_at: string
  updated_at: string
}

export interface DbCharacter {
  user_id: string
  level: number
  xp: number
  total_xp: number
  creds: number
  stat_strength: number
  stat_health: number
  stat_discipline: number
  stat_mind: number
  current_streak: number
  best_streak: number
  last_active: string | null
  updated_at: string
}

export interface DbHabit {
  id: string
  user_id: string
  label: string
  icon: string
  xp: number
  creds: number
  stat: string
  frequency: string
  kind: string
  target_value: number | null
  unit: string | null
  sort_order: number
  active: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertUser(userId: string, name: string, theme: string): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, name, theme, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) console.warn('[db] upsertUser:', error.message)
  return !error
}

export async function dbGetUser(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as DbUser
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertCharacter(userId: string, char: Character): Promise<boolean> {
  const { error } = await supabase
    .from('character')
    .upsert({
      user_id:         userId,
      level:           char.level,
      xp:              char.xp,
      total_xp:        char.totalXp ?? 0,
      creds:           char.creds ?? 0,
      stat_strength:   char.stats.strength,
      stat_health:     char.stats.health,
      stat_discipline: char.stats.discipline,
      stat_mind:       char.stats.mind,
      current_streak:  char.streak ?? 0,
      best_streak:     char.bestStreak ?? 0,
      last_active:     char.lastActive ?? null,
      updated_at:      new Date().toISOString(),
    }, { onConflict: 'user_id' })
  if (error) console.warn('[db] upsertCharacter:', error.message)
  return !error
}

export async function dbGetCharacter(userId: string): Promise<DbCharacter | null> {
  const { data, error } = await supabase
    .from('character')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as DbCharacter
}

// ─────────────────────────────────────────────────────────────────────────────
// HABITS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertHabits(userId: string, habits: Habit[]): Promise<boolean> {
  const rows = habits.map((h, i) => ({
    id:           h.id,          // slug estável ex: 'gym', 'water' (agora text no BD)
    user_id:      userId,
    label:        h.label,
    icon:         h.icon,
    xp:           h.xp,
    creds:        h.creds,
    stat:         h.stat,
    frequency:    h.type,
    kind:         h.kind ?? 'boolean',
    target_value: h.targetValue ?? null,
    unit:         h.unit ?? null,
    sort_order:   i,
    active:       true,
  }))

  const { error } = await supabase
    .from('habits')
    .upsert(rows, { onConflict: 'id' })
  if (error) console.warn('[db] upsertHabits:', error.message)
  return !error
}

export async function dbGetHabits(userId: string): Promise<DbHabit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('sort_order')
  if (error) { console.warn('[db] getHabits:', error.message); return [] }
  return (data ?? []) as DbHabit[]
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertDailyLog(
  userId: string,
  habitDbId: string,
  date: string,
  value: number
): Promise<boolean> {
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: userId, habit_id: habitDbId, log_date: date, value, logged_at: new Date().toISOString() },
      { onConflict: 'user_id,habit_id,log_date' }
    )
  if (error) console.warn('[db] upsertDailyLog:', error.message)
  return !error
}

export async function dbDeleteDailyLog(
  userId: string,
  habitDbId: string,
  date: string
): Promise<boolean> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitDbId)
    .eq('log_date', date)
  if (error) console.warn('[db] deleteDailyLog:', error.message)
  return !error
}

export async function dbGetDailyLogs(userId: string, date: string): Promise<{ habit_id: string; value: number }[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('habit_id, value')
    .eq('user_id', userId)
    .eq('log_date', date)
  if (error) { console.warn('[db] getDailyLogs:', error.message); return [] }
  return (data ?? []) as { habit_id: string; value: number }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertDailySummary(
  userId: string,
  date: string,
  habitsDone: number,
  habitsTotal: number,
  xpEarned: number,
  credsEarned: number
): Promise<boolean> {
  const completionPct = habitsTotal > 0 ? (habitsDone / habitsTotal) * 100 : 0
  const { error } = await supabase
    .from('daily_summary')
    .upsert({
      user_id:        userId,
      summary_date:   date,
      habits_total:   habitsTotal,
      habits_done:    habitsDone,
      completion_pct: completionPct,
      daily_complete: completionPct >= 70,
      xp_earned:      xpEarned,
      creds_earned:   credsEarned,
    }, { onConflict: 'user_id,summary_date' })
  if (error) console.warn('[db] upsertDailySummary:', error.message)
  return !error
}

// ─────────────────────────────────────────────────────────────────────────────
// WATER LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbUpsertWaterLog(userId: string, date: string, glasses: number): Promise<boolean> {
  const { error } = await supabase
    .from('water_logs')
    .upsert({ user_id: userId, log_date: date, glasses }, { onConflict: 'user_id,log_date' })
  if (error) console.warn('[db] upsertWaterLog:', error.message)
  return !error
}

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbInsertWeightLog(userId: string, valueKg: number): Promise<boolean> {
  const { error } = await supabase
    .from('weight_logs')
    .insert({ user_id: userId, value_kg: valueKg })
  if (error) console.warn('[db] insertWeightLog:', error.message)
  return !error
}

export async function dbGetWeightLogs(userId: string): Promise<{ value_kg: number; logged_at: string }[]> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('value_kg, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true })
  if (error) { console.warn('[db] getWeightLogs:', error.message); return [] }
  return (data ?? []) as { value_kg: number; logged_at: string }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASES
// ─────────────────────────────────────────────────────────────────────────────

export async function dbInsertPurchase(
  userId: string,
  itemId: string,
  credsBefore: number,
  credsAfter: number,
  txId: string,
  purchasedAt: string
): Promise<boolean> {
  const { error } = await supabase
    .from('purchases')
    .insert({ user_id: userId, item_id: itemId, creds_before: credsBefore, creds_after: credsAfter, tx_id: txId, purchased_at: purchasedAt })
  if (error) console.warn('[db] insertPurchase:', error.message)
  return !error
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL STATE PULL — carrega tudo do Supabase e converte para AppState parcial
// ─────────────────────────────────────────────────────────────────────────────

export async function dbPullState(userId: string): Promise<Partial<AppState> | null> {
  const [userRow, charRow, habitsRows] = await Promise.all([
    dbGetUser(userId),
    dbGetCharacter(userId),
    dbGetHabits(userId),
  ])

  if (!userRow) return null // utilizador não existe ainda no Supabase

  const character: Partial<Character> = charRow
    ? {
        name:       userRow.name,
        level:      charRow.level,
        xp:         charRow.xp,
        totalXp:    charRow.total_xp,
        creds:      charRow.creds,
        stats: {
          strength:   charRow.stat_strength,
          health:     charRow.stat_health,
          discipline: charRow.stat_discipline,
          mind:       charRow.stat_mind,
        },
        streak:     charRow.current_streak,
        bestStreak: charRow.best_streak,
        lastActive: charRow.last_active,
      }
    : {}

  const habits: Habit[] = habitsRows.map((h) => ({
    id:          h.id,        // slug text (ex: 'gym', 'water')
    label:       h.label,
    icon:        h.icon,
    xp:          h.xp,
    creds:       h.creds,
    stat:        h.stat,
    type:        h.frequency as Habit['type'],
    kind:        h.kind as Habit['kind'],
    targetValue: h.target_value ?? undefined,
    unit:        h.unit ?? undefined,
  }))

  return {
    character: character as Character,
    habits:    habits.length > 0 ? habits : undefined,
  }
}
