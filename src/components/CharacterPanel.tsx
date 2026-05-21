import { useGame } from '../store/GameContext'
import { XP_PER_LEVEL, getRank } from '../lib/rpg'
import type { GlowColor } from '../lib/rpg'
import { ProgressBar, StatBadge } from './ui'

const statColors: Record<string, GlowColor> = {
  strength:   'magenta',
  health:     'green',
  discipline: 'cyan',
  mind:       'yellow',
}

const statLabels: Record<string, string> = {
  strength:   'Força',
  health:     'Saúde',
  discipline: 'Disciplina',
  mind:       'Mente',
}

export default function CharacterPanel() {
  const { state } = useGame()
  const { character } = state
  const rank = getRank(character.level)
  const xpNeeded = XP_PER_LEVEL(character.level)

  return (
    <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-5 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f5ff]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f5ff]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00f5ff]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f5ff]" />

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-sm border-2 border-[#00f5ff] bg-[#05050f] flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)] flex-shrink-0">
          <span className="text-3xl">⚡</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-lg font-bold text-white truncate">{character.name}</div>
          <div className="font-mono-tech text-xs mt-0.5" style={{ color: rank.color }}>[ {rank.title} ]</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono-tech text-xs text-[#8888aa]">LVL {character.level}</span>
            <span className="font-mono-tech text-xs text-[#8888aa]">·</span>
            <span className="font-mono-tech text-xs text-[#ffee00]">₡ {character.creds ?? 0}</span>
            <span className="font-mono-tech text-[9px] text-[#555577] uppercase">creds</span>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">XP</span>
          <span className="font-mono-tech text-[10px] text-[#8888aa]">{character.xp} / {xpNeeded}</span>
        </div>
        <ProgressBar value={character.xp} max={xpNeeded} color="cyan" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(Object.entries(character.stats) as [string, number][]).map(([key, val]) => (
          <StatBadge key={key} label={statLabels[key] ?? key} value={val} color={statColors[key] ?? 'cyan'} />
        ))}
      </div>
    </div>
  )
}
