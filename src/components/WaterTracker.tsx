import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { today } from '../lib/storage'
import { Card, SectionTitle, ProgressBar, Button } from './ui'
import { Droplets } from 'lucide-react'

const WATER_GOAL = 2.5

export default function WaterTracker() {
  const { state, logWater } = useGame()
  const current = state.waterLogs[today()] ?? 0
  const [input, setInput] = useState('')

  const add = (amount: number) => {
    const next = parseFloat(Math.min(WATER_GOAL + 0.5, current + amount).toFixed(2))
    logWater(next)
  }

  const setCustom = () => {
    const val = parseFloat(input)
    if (!isNaN(val) && val >= 0) {
      logWater(Math.min(WATER_GOAL + 0.5, val))
      setInput('')
    }
  }

  return (
    <Card glow="green">
      <SectionTitle color="green">Hidratação</SectionTitle>
      <div className="flex items-center gap-3 mb-3">
        <Droplets size={28} className="text-[#00ff88] flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.6))' }} />
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono-tech text-[#00ff88]">{current.toFixed(1)}L</span>
            <span className="font-mono-tech text-[#8888aa]">/ {WATER_GOAL}L</span>
          </div>
          <ProgressBar value={current} max={WATER_GOAL} color="green" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {([0.25, 0.5, 1] as const).map((v) => (
          <Button key={v} variant="green" onClick={() => add(v)} className="text-[10px] px-2 py-1">
            +{v}L
          </Button>
        ))}
        <div className="flex gap-1 ml-auto">
          <input
            type="number" step="0.1" min="0" placeholder="0.0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-16 bg-[#05050f] border border-[#1a1a3a] text-white text-xs font-mono-tech rounded-sm px-2 py-1 outline-none focus:border-[#00ff88]"
          />
          <Button variant="green" onClick={setCustom} className="text-[10px] px-2 py-1">SET</Button>
        </div>
      </div>
    </Card>
  )
}
