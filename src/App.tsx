import './utils/leafletIconFix'
import { useEffect } from 'react'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import { useGatewaySocket } from './hooks/useGatewaySocket'
import { startMockGateway } from './mocks/gatewayMock'
import TopNav from './components/TopNav'
import StatBar from './components/StatBar'
import RequestsFeed from './components/RequestsFeed/RequestsFeed'
import MapView from './components/MapView/MapView'
import RightPanel from './components/RightPanel/RightPanel'

const USE_MOCK = (import.meta as { env: Record<string, string> }).env.VITE_USE_MOCK_DATA === 'true'

function AppInner() {
  const { state, dispatch } = useDashboard()

  useGatewaySocket(dispatch)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('meshsos-theme') as 'dark' | 'light' | null
    const initial = saved ?? 'dark'
    dispatch({ type: 'SET_THEME', payload: initial })
  }, [dispatch])

  // Keep the <html> dark class in sync with React state — single source of truth
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  useEffect(() => {
    if (USE_MOCK) return startMockGateway(dispatch)
  }, [dispatch])

  // Escape deselects current request
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        dispatch({ type: 'REQUEST_SELECTED', payload: null })
        dispatch({ type: 'VEHICLE_SELECTED', payload: null })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [dispatch])

  return (
    <div className="font-sans bg-bg text-text">
      {/* Mobile guard */}
      <div className="md:hidden flex items-center justify-center min-h-screen bg-bg text-center px-8">
        <div>
          <div className="text-[40px] mb-4 opacity-30">📡</div>
          <p className="text-[16px] text-text-dim leading-relaxed">
            Dashboard requires a larger screen.
            <br />
            Please use a desktop or laptop.
          </p>
        </div>
      </div>

      {/* Full dashboard */}
      <div className="hidden md:flex md:flex-col md:h-screen md:overflow-hidden">
        <TopNav />
        <StatBar />
        <div className="flex flex-1 overflow-hidden">
          <RightPanel />
          <MapView />
          <RequestsFeed />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <DashboardProvider>
      <AppInner />
    </DashboardProvider>
  )
}
