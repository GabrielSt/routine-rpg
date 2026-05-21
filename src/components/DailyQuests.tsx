import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { today, isDailyComplete } from '../lib/storage'
import type { Habit } from '../lib/storage'
import { SectionTitle } from '../components/ui'
import { CheckCircle, Circle, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import type { GlowColor } from '../lib/rpg'

// ─────────────────────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────────────────────

interface HabitColor { color: GlowColor; hex: string }

const STAT_COLORS: Record<string, HabitColor> = {
  strength:   { color: 'magenta', hex: '#ff00aa' },
  health:     { color: 'green',   hex: '#00ff88' },
  discipline: { color: 'cyan',    hex: '#00f5ff' },
  mind:       { color: 'yellow',  hex: '#ffee00' },
}

function habitColor(h: Habit): HabitColor {
  return STAT_COLORS[h.stat] ?? { color: 'cyan', hex: '#00f5ff' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Boolean habit row
// ─────────────────────────────────────────────────────────────────────────────

interface HabitRowProps { habit: Habit; done: boolean; onToggle: () => void }

function BooleanRow({ habit, done, onToggle }: HabitRowProps) {
  const c = habitColor(habit)

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 rounded-sm border transition-all duration-300 cursor-pointer text-left group"
      style={done
        ? { backgroundColor: `${c.hex}11`, borderColor: `${c.hex}44` }
        : { backgroundColor: '#05050f', borderColor: '#1a1a3a' }
      }
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${done ? 'line-through opacity-50' : 'text-white'}`}>
          {habit.label}
        </div>
        <div className="font-mono-tech text-[10px] text-[#8888aa] uppercase tracking-widest">
          {habit.type === 'daily' ? 'Daily Quest' : 'Recorrente'}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Zap size={10} style={{ color: c.hex }} />
        <span className="font-orbitron text-xs" style={{ color: c.hex }}>+{habit.xp}</span>
        <span className="font-orbitron text-xs text-[#ffee00]">+{habit.creds ?? 0}₡</span>
      </div>
      <div className="flex-shrink-0 ml-1">
        {done
          ? <CheckCircle size={20} style={{ color: c.hex }} />
          : <Circle size={20} className="text-[#4a4a6a] group-hover:text-[#6a6a8a] transition-colors" />
        }
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quantity habit row
// ─────────────────────────────────────────────────────────────────────────────

interface QuantityRowProps {
  habit: Habit
  value: number
  onChange: (v: number) => void
}

function QuantityRow({ habit, value, onChange }: QuantityRowProps) {
  const c = habitColor(habit)
  const target = habit.targetValue ?? 1
  const pct = Math.min(100, (value / target) * 100)
  const done = value >= target
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(String(value))

  const step = target >= 1000 ? 500 : target >= 100 ? 10 : 1

  const commit = (raw: string) => {
    const n = Math.max(0, parseInt(raw, 10) || 0)
    onChange(n)
    setInputVal(String(n))
    setEditing(false)
  }

  return (
    <div
      className="rounded-sm border transition-all duration-300 overflow-hidden"
      style={done
        ? { backgroundColor: `${c.hex}11`, borderColor: `${c.hex}44` }
        : { backgroundColor: '#05050f', borderColor: '#1a1a3a' }
      }
    >
      <div className="flex items-center gap-3 p-3">
        <span className="text-2xl w-8 text-center flex-shrink-0">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${done ? 'opacity-70' : 'text-white'}`}>{habit.label}</div>
          <div className="font-mono-tech text-[10px] text-[#8888aa] uppercase tracking-widest">
            {habit.type === 'daily' ? 'Daily Quest' : 'Recorrente'} · meta {target.toLocaleString('pt-PT')} {habit.unit}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Zap size={10} style={{ color: c.hex }} />
          <span className="font-orbitron text-xs" style={{ color: c.hex }}>+{habit.xp}</span>
          <span className="font-orbitron text-xs text-[#ffee00]">+{habit.creds ?? 0}₡</span>
        </div>
        {done
          ? <CheckCircle size={20} style={{ color: c.hex }} className="flex-shrink-0 ml-1" />
          : <Circle size={20} className="text-[#4a4a6a] flex-shrink-0 ml-1" />
        }
      </div>

      {/* Progress bar + controls */}
      <div className="px-3 pb-3 space-y-2">
        <div className="h-1.5 bg-[#1a1a3a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: c.hex,
              boxShadow: done ? `0 0 8px ${c.hex}88` : 'none',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(Math.max(0, value - step))}
              className="w-7 h-7 rounded-sm border border-[#2a2a4a] flex items-center justify-center text-[#8888aa] hover:border-[#4a4a6a] hover:text-white transition-all cursor-pointer"
            >
              <ChevronDown size={14} />
            </button>

            {editing ? (
              <input
                autoFocus
                type="number"
                className="w-20 bg-[#0a0a1a] border border-[#00f5ff55] rounded-sm font-mono-tech text-xs text-white text-center px-1 py-0.5 outline-none"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commit(inputVal) }}
              />
            ) : (
              <button
                onClick={() => { setInputVal(String(value)); setEditing(true) }}
                className="font-mono-tech text-sm font-bold cursor-pointer"
                style={{ color: done ? c.hex : '#ffffff' }}
              >
                {value.toLocaleString('pt-PT')}
                <span className="text-[10px] text-[#8888aa] ml-1">{habit.unit}</span>
              </button>
            )}

            <button
              onClick={() => onChange(Math.min(target * 2, value + step))}
              className="w-7 h-7 rounded-sm border border-[#2a2a4a] flex items-center justify-center text-[#8888aa] hover:border-[#4a4a6a] hover:text-white transition-all cursor-pointer"
            >
              <ChevronUp size={14} />
            </button>
          </div>

          <span className="font-mono-tech text-[10px]" style={{ color: done ? c.hex : '#8888aa' }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLD = 0.7

export default function DailyQuests() {
  const { state, completeHabit, uncompleteHabit, logQuantity } = useGame()
  const { habits, dailyLogs } = state
  const log = dailyLogs[today()] ?? {}

  const dailyHabits     = habits.filter((h) => h.type === 'daily')
  const recurrentHabits = habits.filter((h) => h.type !== 'daily')

  const countDone = (list: Habit[]) =>
    list.filter((h) => {
      const val = log[h.id]
      if (h.kind === 'quantity') return typeof val === 'number' && val >= (h.targetValue ?? 1)
      return val === true
    }).length

  const allHabits    = [...dailyHabits, ...recurrentHabits]
  const totalDone    = countDone(allHabits)
  const total        = allHabits.length
  const pct          = total > 0 ? totalDone / total : 0
  const isComplete   = isDailyComplete(habits, log)
  const thresholdPct = THRESHOLD * 100

  const handleToggle = (habit: Habit) => {
    if (habit.kind === 'quantity') return // handled by QuantityRow
    const val = log[habit.id]
    if (val === true) uncompleteHabit(habit.id)
    else completeHabit(habit.id)
  }

  const renderHabit = (h: Habit) => {
    if (h.kind === 'quantity') {
      const val = typeof log[h.id] === 'number' ? (log[h.id] as number) : 0
      return (
        <QuantityRow
          key={h.id}
          habit={h}
          value={val}
          onChange={(v) => logQuantity(h.id, v)}
        />
      )
    }
    return (
      <BooleanRow
        key={h.id}
        habit={h}
        done={!!log[h.id]}
        onToggle={() => handleToggle(h)}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <SectionTitle color="cyan">Daily Quests</SectionTitle>
        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-xs text-[#8888aa]">
            {totalDone}/{total}
          </span>
          {isComplete && (
            <span className="font-mono-tech text-[9px] text-[#00ff88] border border-[#00ff8844] px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
              ✓ Daily OK
            </span>
          )}
        </div>
      </div>

      {/* Progress bar with 70% threshold marker */}
      <div className="relative h-2 bg-[#1a1a3a] rounded-full mb-1 overflow-visible">
        {/* filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: isComplete ? '#00ff88' : '#00f5ff',
            boxShadow: isComplete ? '0 0 8px rgba(0,255,136,0.6)' : '0 0 6px rgba(0,245,255,0.4)',
          }}
        />
        {/* 70% threshold marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
          style={{ left: `${thresholdPct}%`, backgroundColor: '#ffee00', boxShadow: '0 0 4px #ffee00' }}
        />
      </div>
      <div
        className="font-mono-tech text-[9px] mb-4"
        style={{ marginLeft: `${thresholdPct}%`, color: '#ffee00' }}
      >
        70%
      </div>

      {/* Daily */}
      <div className="space-y-2 mb-5">
        {dailyHabits.map(renderHabit)}
      </div>

      {/* Recurrent */}
      {recurrentHabits.length > 0 && (
        <>
          <SectionTitle color="yellow">Quests Recorrentes</SectionTitle>
          <div className="space-y-2">
            {recurrentHabits.map(renderHabit)}
          </div>
        </>
      )}
    </div>
  )
}
