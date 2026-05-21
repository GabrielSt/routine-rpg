import CharacterPanel from '../components/CharacterPanel'
import DailyQuests from '../components/DailyQuests'
import WaterTracker from '../components/WaterTracker'
import WeightTracker from '../components/WeightTracker'

const dateStr = () =>
  new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export default function Dashboard() {
  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <span className="font-mono-tech text-[10px] text-[#8888aa] uppercase tracking-widest">{dateStr()}</span>
        <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">// HQ //</span>
      </div>

      {/* Desktop: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <CharacterPanel />
          <WaterTracker />
          <WeightTracker />
        </div>

        {/* Right column */}
        <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
          <DailyQuests />
        </div>
      </div>
    </div>
  )
}
