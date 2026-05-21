import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Swords, BarChart3, Trophy, ShoppingBag } from 'lucide-react'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'HQ' },
  { to: '/quests',       icon: Swords,          label: 'Quests' },
  { to: '/stats',        icon: BarChart3,        label: 'Stats' },
  { to: '/shop',         icon: ShoppingBag,      label: 'Loja' },
  { to: '/achievements', icon: Trophy,           label: 'Conquistas' },
]

const activeClass = 'text-[#00f5ff] bg-[#00f5ff0d] border-r-2 border-[#00f5ff]'
const inactiveClass = 'text-[#8888aa] hover:text-[#00f5ff66] hover:bg-[#ffffff05]'

// ── Desktop sidebar ────────────────────────────────────────────────────────────
export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-[#07071a] border-r border-[#1a1a3a] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1a1a3a]">
        <div className="font-orbitron text-xs text-[#00f5ff] tracking-widest text-glow-cyan">// EDGE</div>
        <div className="font-orbitron text-lg font-black text-white leading-tight">PROTOCOL</div>
        <div className="font-mono-tech text-[9px] text-[#8888aa] mt-1">ROUTINE RPG v0.1</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-all duration-200 ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Icon size={18} />
            <span className="font-mono-tech text-xs uppercase tracking-widest">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1a1a3a]">
        <div className="font-mono-tech text-[9px] text-[#444466]">// SYSTEM ONLINE //</div>
      </div>
    </aside>
  )
}

// ── Mobile bottom nav ──────────────────────────────────────────────────────────
export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05050f]/95 backdrop-blur border-t border-[#1a1a3a]">
      <div className="flex items-stretch">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200
              ${isActive
                ? 'text-[#00f5ff] border-t-2 border-[#00f5ff] -mt-px'
                : 'text-[#8888aa] border-t-2 border-transparent -mt-px hover:text-[#00f5ff66]'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-mono-tech text-[9px] uppercase tracking-widest">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
