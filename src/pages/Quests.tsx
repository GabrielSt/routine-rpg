import { SectionTitle } from '../components/ui'

export default function Quests() {
  return (
    <div className="animate-fade-in-up">
      <div className="py-1 mb-4">
        <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">// QUESTS //</span>
      </div>
      <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
        <SectionTitle color="cyan">Em breve</SectionTitle>
        <p className="font-mono-tech text-xs text-[#8888aa]">
          Histórico de quests e milestones — próxima iteração.
        </p>
      </div>
    </div>
  )
}
