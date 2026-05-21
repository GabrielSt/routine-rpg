import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider, useGame } from './store/GameContext'
import { Sidebar, BottomNav } from './components/layout/NavBar'
import LevelUpModal from './components/LevelUpModal'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import Stats from './pages/Stats'
import Achievements from './pages/Achievements'
import Shop from './pages/Shop'
import Onboarding from './pages/Onboarding'

function AppShell() {
  const { state } = useGame()
  if (!state.onboardingDone) return <Onboarding />

  return (
    <BrowserRouter>
      <Sidebar />
      <div className="min-h-screen lg:ml-56">
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 lg:pb-8 lg:px-8 lg:pt-8">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/quests"       element={<Quests />} />
            <Route path="/stats"        element={<Stats />} />
            <Route path="/shop"         element={<Shop />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </div>
      </div>
      <BottomNav />
      <LevelUpModal />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
