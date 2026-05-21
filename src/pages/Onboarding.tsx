import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { THEMES, EXTRA_HABITS, type Habit, type OnboardingTheme } from '../lib/storage'
import { ChevronRight, Plus, X, Check, Zap } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: i === current ? 24 : 8,
            backgroundColor: i <= current ? '#00f5ff' : '#1a1a3a',
            boxShadow: i === current ? '0 0 8px #00f5ff88' : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Name
// ─────────────────────────────────────────────────────────────────────────────

function StepName({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <div className="font-mono-tech text-[10px] text-[#00f5ff] tracking-widest uppercase">
          // Routine RPG · Inicialização //
        </div>
        <h1 className="font-orbitron text-2xl font-black text-white leading-tight">
          Bem-vindo,<br />Runner.
        </h1>
        <p className="font-mono-tech text-xs text-[#8888aa] leading-relaxed max-w-xs mx-auto">
          Gamifica os teus hábitos diários. Ganha XP. Sobe de level. Desbloqueia recompensas reais pelo teu esforço.
        </p>
      </div>

      <div className="space-y-3">
        <label className="font-mono-tech text-[10px] text-[#8888aa] uppercase tracking-widest block">
          // Como te queres chamar?
        </label>
        <input
          type="text"
          maxLength={24}
          placeholder="Ex: Gabriel, Runner, G..."
          className="w-full bg-[#0a0a1a] border border-[#1a1a3a] focus:border-[#00f5ff] rounded-sm px-4 py-3 font-orbitron text-sm text-white outline-none placeholder:text-[#333355] transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onNext(name.trim()) }}
          autoFocus
        />
      </div>

      <button
        disabled={!name.trim()}
        onClick={() => onNext(name.trim())}
        className="w-full flex items-center justify-center gap-2 py-3 font-orbitron text-sm font-bold text-[#05050f] bg-[#00f5ff] rounded-sm hover:bg-[#00d4dd] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        Iniciar <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Theme selection
// ─────────────────────────────────────────────────────────────────────────────

function ThemeCard({ theme, selected, onSelect }: {
  theme: OnboardingTheme
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 rounded-sm border transition-all duration-300 cursor-pointer"
      style={{
        borderColor: selected ? theme.color : '#1a1a3a',
        backgroundColor: selected ? `${theme.color}11` : '#0a0a1a',
        boxShadow: selected ? `0 0 16px ${theme.color}22` : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{theme.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-orbitron text-sm font-bold" style={{ color: selected ? theme.color : '#ffffff' }}>
              {theme.label}
            </span>
            {selected && <Check size={14} style={{ color: theme.color }} />}
          </div>
          <p className="font-mono-tech text-[10px] text-[#8888aa] leading-relaxed">{theme.desc}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {theme.habits.slice(0, 4).map((h) => (
              <span
                key={h.id}
                className="font-mono-tech text-[9px] px-1.5 py-0.5 rounded-sm border"
                style={{ borderColor: `${theme.color}33`, color: theme.color }}
              >
                {h.icon} {h.label}
              </span>
            ))}
            {theme.habits.length > 4 && (
              <span className="font-mono-tech text-[9px] text-[#8888aa]">+{theme.habits.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function StepTheme({ onNext }: { onNext: (theme: OnboardingTheme) => void }) {
  const [selected, setSelected] = useState<ThemeId | null>(null)

  type ThemeId = 'balanced' | 'athlete' | 'hacker' | 'monk'

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="space-y-1">
        <div className="font-mono-tech text-[10px] text-[#00f5ff] tracking-widest uppercase">// Passo 2 de 3</div>
        <h2 className="font-orbitron text-lg font-black text-white">Escolhe o teu tema</h2>
        <p className="font-mono-tech text-[10px] text-[#8888aa]">
          Define o foco das tuas daily quests. Podes personalizar depois.
        </p>
      </div>

      <div className="space-y-3">
        {THEMES.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t}
            selected={selected === t.id}
            onSelect={() => setSelected(t.id as ThemeId)}
          />
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => {
          const t = THEMES.find((x) => x.id === selected)
          if (t) onNext(t)
        }}
        className="w-full flex items-center justify-center gap-2 py-3 font-orbitron text-sm font-bold text-[#05050f] bg-[#00f5ff] rounded-sm hover:bg-[#00d4dd] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        Continuar <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Customize habits
// ─────────────────────────────────────────────────────────────────────────────

const MIN_HABITS = 7

function HabitPill({ habit, selected, onToggle, canRemove }: {
  habit: Habit
  selected: boolean
  onToggle: () => void
  canRemove: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={selected && !canRemove}
      className="flex items-center gap-2 px-3 py-2 rounded-sm border text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
      style={{
        borderColor: selected ? '#00f5ff44' : '#1a1a3a',
        backgroundColor: selected ? '#00f5ff11' : '#0a0a1a',
        opacity: selected && !canRemove ? 0.5 : 1,
      }}
    >
      <span className="text-base">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-mono-tech text-[10px] text-white leading-tight">{habit.label}</div>
        <div className="font-mono-tech text-[9px] text-[#8888aa]">
          +{habit.xp}XP · +{habit.creds}₡
          {habit.kind === 'quantity' && ` · meta ${habit.targetValue} ${habit.unit}`}
        </div>
      </div>
      <div className="flex-shrink-0">
        {selected
          ? <X size={12} className="text-[#8888aa]" />
          : <Plus size={12} className="text-[#00f5ff]" />
        }
      </div>
    </button>
  )
}

function StepCustomize({
  theme,
  onFinish,
}: {
  theme: OnboardingTheme
  onFinish: (habits: Habit[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(theme.habits.map((h) => h.id)))

  // All habits available: theme habits + extras not already in theme
  const themeIds = new Set(theme.habits.map((h) => h.id))
  const extras = EXTRA_HABITS.filter((h) => !themeIds.has(h.id))
  const allHabits = [...theme.habits, ...extras]

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= MIN_HABITS) return prev // enforce minimum
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedHabits = allHabits.filter((h) => selected.has(h.id))

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="space-y-1">
        <div className="font-mono-tech text-[10px] text-[#00f5ff] tracking-widest uppercase">// Passo 3 de 3</div>
        <h2 className="font-orbitron text-lg font-black text-white">Personaliza as quests</h2>
        <p className="font-mono-tech text-[10px] text-[#8888aa]">
          Mínimo de {MIN_HABITS} quests. Selecionadas: <span className="text-[#00f5ff]">{selected.size}</span>
        </p>
      </div>

      {/* Selected summary */}
      <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-3">
        <div className="font-mono-tech text-[9px] text-[#8888aa] uppercase tracking-widest mb-2">Quests selecionadas</div>
        <div className="flex flex-wrap gap-1">
          {selectedHabits.map((h) => (
            <span
              key={h.id}
              className="font-mono-tech text-[9px] px-1.5 py-0.5 rounded-sm border"
              style={{ borderColor: `${theme.color}33`, color: theme.color }}
            >
              {h.icon} {h.label}
            </span>
          ))}
        </div>
        {/* XP total */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#1a1a3a]">
          <Zap size={10} className="text-[#00f5ff]" />
          <span className="font-mono-tech text-[9px] text-[#8888aa]">
            Total diário: <span className="text-[#00f5ff]">{selectedHabits.reduce((s, h) => s + h.xp, 0)} XP</span>
            {' · '}
            <span className="text-[#ffee00]">₡ {selectedHabits.reduce((s, h) => s + h.creds, 0)}</span>
          </span>
        </div>
      </div>

      {/* All available habits */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {allHabits.map((h) => (
          <HabitPill
            key={h.id}
            habit={h}
            selected={selected.has(h.id)}
            onToggle={() => toggle(h.id)}
            canRemove={selected.size > MIN_HABITS}
          />
        ))}
      </div>

      <button
        onClick={() => onFinish(selectedHabits)}
        className="w-full flex items-center justify-center gap-2 py-3 font-orbitron text-sm font-bold text-[#05050f] bg-[#00ff88] rounded-sm hover:bg-[#00dd77] transition-all cursor-pointer"
      >
        <Check size={16} /> Começar a jogar!
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Onboarding component
// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { completeOnboarding } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState<OnboardingTheme | null>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050f] px-4 py-8 relative overflow-hidden">
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0 scanlines opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        <Steps current={step} total={3} />

        {step === 0 && (
          <StepName
            onNext={(n) => { setName(n); setStep(1) }}
          />
        )}

        {step === 1 && (
          <StepTheme
            onNext={(t) => { setTheme(t); setStep(2) }}
          />
        )}

        {step === 2 && theme && (
          <StepCustomize
            theme={theme}
            onFinish={(habits) => completeOnboarding(name, habits, theme.id)}
          />
        )}
      </div>
    </div>
  )
}
