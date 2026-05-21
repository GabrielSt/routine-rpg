import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { Card, SectionTitle, Button } from './ui'
import { Scale } from 'lucide-react'

export default function WeightTracker() {
  const { state, logWeight } = useGame()
  const { weightLogs = [] } = state
  const [input, setInput] = useState('')

  const last = weightLogs[weightLogs.length - 1]
  const prev = weightLogs[weightLogs.length - 2]
  const diff = last && prev ? (last.value - prev.value).toFixed(1) : null

  const handleLog = () => {
    const val = parseFloat(input)
    if (!isNaN(val) && val > 0) {
      logWeight(val)
      setInput('')
    }
  }

  return (
    <Card glow="magenta">
      <SectionTitle color="magenta">Peso Corporal</SectionTitle>
      <div className="flex items-center gap-4 mb-3">
        <Scale size={28} className="text-[#ff00aa] flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,170,0.6))' }} />
        <div>
          <div className="font-orbitron text-2xl text-white">
            {last ? `${last.value} kg` : '— kg'}
          </div>
          {diff !== null && (
            <div className={`font-mono-tech text-xs mt-0.5 ${parseFloat(diff) < 0 ? 'text-[#00ff88]' : 'text-[#ff00aa]'}`}>
              {parseFloat(diff) > 0 ? '+' : ''}{diff} kg vs anterior
            </div>
          )}
          {last && (
            <div className="font-mono-tech text-[10px] text-[#8888aa] mt-0.5">{last.date}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="number" step="0.1" min="0" placeholder="ex: 75.5"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLog()}
          className="flex-1 bg-[#05050f] border border-[#1a1a3a] text-white text-xs font-mono-tech rounded-sm px-3 py-2 outline-none focus:border-[#ff00aa]"
        />
        <Button variant="magenta" onClick={handleLog}>Registar</Button>
      </div>
      {weightLogs.length > 1 && (
        <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
          {[...weightLogs].reverse().slice(0, 5).map((l, i) => (
            <div key={i} className="flex justify-between font-mono-tech text-[10px] text-[#8888aa]">
              <span>{l.date}</span>
              <span className="text-[#ff00aa]">{l.value} kg</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
