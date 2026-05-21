import { useEffect, useState } from 'react'
import { useGame } from '../store/GameContext'
import { getRank, CREDS_PER_LEVEL } from '../lib/rpg'

export default function LevelUpModal() {
  const { state, clearLevelUp } = useGame()
  const { character } = state
  const [visible, setVisible] = useState(false)
  const [snapshot, setSnapshot] = useState({ level: 1, credEarned: 0 })

  useEffect(() => {
    if (character.leveledUp) {
      setSnapshot({
        level: character.level,
        credEarned: CREDS_PER_LEVEL(character.level - 1),
      })
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        clearLevelUp()
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [character.leveledUp, clearLevelUp])

  if (!visible) return null

  const rank = getRank(snapshot.level)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center animate-fade-in-up">
        <div className="font-mono-tech text-[#8888aa] text-xs tracking-widest mb-2">// LEVEL UP DETECTED //</div>
        <div className="font-orbitron text-6xl font-black text-white text-glow-cyan mb-2">
          LVL {snapshot.level}
        </div>
        <div className="font-orbitron text-xl mb-3" style={{ color: rank.color }}>
          [ {rank.title} ]
        </div>
        <div className="font-mono-tech text-sm text-[#ffee00] mb-2">
          + ₡ {snapshot.credEarned} Creds desbloqueados
        </div>
        <div className="font-mono-tech text-xs text-[#8888aa]">Sistema actualizado — bom trabalho, Runner.</div>
      </div>
    </div>
  )
}
