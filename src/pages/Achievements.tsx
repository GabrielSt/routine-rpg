import { SectionTitle } from '../components/ui'

interface Achievement {
  id: string
  label: string
  desc: string
  icon: string
  color: string
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quest',  label: 'Primeira Quest',    desc: 'Completa a tua primeira quest diária.',    icon: '⚡', color: '#00f5ff' },
  { id: 'week_gym',     label: '7 Dias no Ginásio', desc: 'Vai ao ginásio 7 dias seguidos.',          icon: '💪', color: '#ff00aa' },
  { id: 'hydrated',     label: 'Bem Hidratado',      desc: 'Bebe 2.5L durante 7 dias seguidos.',       icon: '💧', color: '#00ff88' },
  { id: 'clean_plate',  label: 'Louça em Dia',       desc: 'Faz a louça 30 dias seguidos.',            icon: '🫧', color: '#00f5ff' },
  { id: 'level_5',      label: 'Street Rat',         desc: 'Atinge o nível 5.',                        icon: '🐀', color: '#00ff88' },
  { id: 'level_10',     label: 'Runner',             desc: 'Atinge o nível 10.',                       icon: '🏃', color: '#00f5ff' },
  { id: 'level_20',     label: 'Edgerunner',         desc: 'Atinge o nível 20.',                       icon: '⚡', color: '#ff8800' },
]

export default function Achievements() {
  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="py-1">
        <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">// CONQUISTAS //</span>
      </div>
      <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
        <SectionTitle color="yellow">Badges</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {ALL_ACHIEVEMENTS.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 border border-[#1a1a3a] rounded-sm opacity-40">
              <span className="text-2xl w-8 text-center">{a.icon}</span>
              <div>
                <div className="font-orbitron text-xs text-white">{a.label}</div>
                <div className="font-mono-tech text-[10px] text-[#8888aa]">{a.desc}</div>
              </div>
              <div className="ml-auto font-mono-tech text-[10px] text-[#4a4a6a] uppercase">locked</div>
            </div>
          ))}
        </div>
        <p className="font-mono-tech text-[10px] text-[#555577] mt-4 text-center">
          // Sistema de desbloqueio automático — próxima iteração //
        </p>
      </div>
    </div>
  )
}
