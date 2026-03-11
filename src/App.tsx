import './utils/leafletIconFix'
import { useEffect, useRef } from 'react'
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

  // Mock auto-delivery: when a vehicle goes en route, simulate delivery after travel time
  const deliveryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  useEffect(() => {
    if (!USE_MOCK) return
    state.vehicles.forEach(vehicle => {
      const hasTimer = deliveryTimers.current.has(vehicle.id)
      if (vehicle.status === 'enroute' && vehicle.assignedRequestIds.length > 0 && !hasTimer) {
        // Capture values for the closure
        const reqIds = [...vehicle.assignedRequestIds]
        const vehicleSnapshot = { ...vehicle }
        // Simulated travel time: ~12 seconds for demo
        const timer = setTimeout(() => {
          dispatch({ type: 'REQUESTS_DELIVERED', payload: reqIds })
          dispatch({ type: 'VEHICLE_UPDATED', payload: { ...vehicleSnapshot, status: 'returning', assignedRequestIds: [] } })
          deliveryTimers.current.delete(vehicle.id)
          setTimeout(() => {
            dispatch({ type: 'CLEAR_RECENTLY_DELIVERED', payload: reqIds })
          }, 10_000)
        }, 12_000)
        deliveryTimers.current.set(vehicle.id, timer)
      } else if (vehicle.status !== 'enroute' && hasTimer) {
        // Vehicle was recalled before delivery — cancel the timer
        clearTimeout(deliveryTimers.current.get(vehicle.id)!)
        deliveryTimers.current.delete(vehicle.id)
      }
    })
  }, [state.vehicles, dispatch])

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
