import type { ReactNode } from 'react'
import type { GlowColor } from '../../lib/rpg'

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; glow?: GlowColor }

export const Card = ({ children, className = '', glow = 'cyan' }: CardProps) => {
  const glowMap: Record<GlowColor, string> = {
    cyan:    'border-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.2)]',
    magenta: 'border-[#ff00aa] shadow-[0_0_15px_rgba(255,0,170,0.2)]',
    yellow:  'border-[#ffee00] shadow-[0_0_15px_rgba(255,238,0,0.2)]',
    green:   'border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]',
  }
  return (
    <div className={`bg-[#0a0a1a] border ${glowMap[glow]} rounded-sm p-4 ${className}`}>
      {children}
    </div>
  )
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
interface SectionTitleProps { children: ReactNode; color?: GlowColor }

export const SectionTitle = ({ children, color = 'cyan' }: SectionTitleProps) => {
  const colorMap: Record<GlowColor, string> = {
    cyan:    'text-[#00f5ff] text-glow-cyan',
    magenta: 'text-[#ff00aa] text-glow-magenta',
    yellow:  'text-[#ffee00] text-glow-yellow',
    green:   'text-[#00ff88] text-glow-green',
  }
  return (
    <h2 className={`font-orbitron text-xs tracking-widest uppercase mb-3 ${colorMap[color]}`}>
      <span className="mr-2 opacity-60">//</span>{children}
    </h2>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  max: number
  color?: GlowColor
  className?: string
  animated?: boolean
}

export const ProgressBar = ({ value, max, color = 'cyan', className = '', animated = false }: ProgressBarProps) => {
  const pct = Math.min(100, (value / max) * 100)
  const colorMap: Record<GlowColor, string> = {
    cyan:    'bg-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.6)]',
    magenta: 'bg-[#ff00aa] shadow-[0_0_8px_rgba(255,0,170,0.6)]',
    yellow:  'bg-[#ffee00] shadow-[0_0_8px_rgba(255,238,0,0.6)]',
    green:   'bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]',
  }
  return (
    <div className={`h-2 bg-[#1a1a3a] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[color]} ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── StatBadge ─────────────────────────────────────────────────────────────────
interface StatBadgeProps { label: string; value: number; color?: GlowColor }

export const StatBadge = ({ label, value, color = 'cyan' }: StatBadgeProps) => {
  const colorMap: Record<GlowColor, string> = {
    cyan:    'text-[#00f5ff] border-[#00f5ff22]',
    magenta: 'text-[#ff00aa] border-[#ff00aa22]',
    yellow:  'text-[#ffee00] border-[#ffee0022]',
    green:   'text-[#00ff88] border-[#00ff8822]',
  }
  return (
    <div className={`border rounded-sm px-3 py-2 text-center ${colorMap[color]}`}>
      <div className="font-orbitron text-lg font-bold">{Math.floor(value)}</div>
      <div className="font-mono-tech text-[10px] opacity-60 uppercase tracking-widest">{label}</div>
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: GlowColor
  className?: string
  disabled?: boolean
}

export const Button = ({ children, onClick, variant = 'cyan', className = '', disabled = false }: ButtonProps) => {
  const variantMap: Record<GlowColor, string> = {
    cyan:    'border-[#00f5ff] text-[#00f5ff] hover:bg-[#00f5ff] hover:text-black shadow-[0_0_10px_rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]',
    magenta: 'border-[#ff00aa] text-[#ff00aa] hover:bg-[#ff00aa] hover:text-black shadow-[0_0_10px_rgba(255,0,170,0.2)] hover:shadow-[0_0_20px_rgba(255,0,170,0.5)]',
    green:   'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black shadow-[0_0_10px_rgba(0,255,136,0.2)] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]',
    yellow:  'border-[#ffee00] text-[#ffee00] hover:bg-[#ffee00] hover:text-black shadow-[0_0_10px_rgba(255,238,0,0.2)] hover:shadow-[0_0_20px_rgba(255,238,0,0.5)]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-orbitron text-xs tracking-widest uppercase border px-4 py-2 rounded-sm transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${variantMap[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
