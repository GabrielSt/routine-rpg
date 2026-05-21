import { useGame } from '../store/GameContext'
import { SectionTitle } from '../components/ui'

export default function Stats() {
  const { state } = useGame()
  const { weightLogs = [], waterLogs = {} } = state

  const last7Water = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    return { date: key.slice(5), value: waterLogs[key] ?? 0 }
  })

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="py-1">
        <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">// STATS //</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Water chart */}
        <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
          <SectionTitle color="green">Água — últimos 7 dias</SectionTitle>
          <div className="flex items-end gap-1 h-32">
            {last7Water.map(({ date, value }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#00ff88] rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(4, (value / 2.5) * 100)}px`,
                    boxShadow: value > 0 ? '0 0 6px rgba(0,255,136,0.4)' : 'none',
                    opacity: value > 0 ? 1 : 0.15,
                  }}
                />
                <span className="font-mono-tech text-[8px] text-[#8888aa]">{date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weight history */}
        <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
          <SectionTitle color="magenta">Histórico de Peso</SectionTitle>
          {weightLogs.length === 0 ? (
            <p className="font-mono-tech text-xs text-[#8888aa]">Nenhum registo ainda.</p>
          ) : (
            <div className="space-y-2">
              {[...weightLogs].reverse().map((l, i) => (
                <div key={i} className="flex justify-between font-mono-tech text-xs border-b border-[#1a1a3a] pb-1">
                  <span className="text-[#8888aa]">{l.date}</span>
                  <span className="text-[#ff00aa]">{l.value} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
