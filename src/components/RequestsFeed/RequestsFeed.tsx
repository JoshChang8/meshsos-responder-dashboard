import { useState, useMemo, useEffect } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import FeedTabs, { FeedTab } from './FilterChips'
import RequestRow from './RequestRow'

export default function RequestsFeed() {
  const { state, dispatch } = useDashboard()
  const [tab, setTab] = useState<FeedTab>('recent')
  const [collapsed, setCollapsed] = useState(true)

  // Keyboard shortcut: ] to toggle (right panel)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ']') setCollapsed(c => !c)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const newCount = state.requests.filter(r => r.status === 'new').length
  const active = state.requests.filter(r => r.status !== 'delivered')

  const counts = useMemo<Record<FeedTab, number>>(() => ({
    recent: active.length,
    medical: active.filter(r => r.supplies.includes('medical') || r.medicalProfiles.length > 0).length,
    other: active.filter(r => !r.supplies.includes('medical') && r.medicalProfiles.length === 0).length,
  }), [active])

  const filtered = useMemo(() => {
    return active
      .filter(r => {
        if (tab === 'medical') return r.supplies.includes('medical') || r.medicalProfiles.length > 0
        if (tab === 'other') return !r.supplies.includes('medical') && r.medicalProfiles.length === 0
        return true
      })
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  }, [active, tab])

  function toggleExpand(id: string) {
    const newExpanded = state.expandedRequestId === id ? null : id
    dispatch({ type: 'REQUEST_EXPANDED', payload: newExpanded })
    if (newExpanded) dispatch({ type: 'REQUEST_SELECTED', payload: id })
  }

  // Collapsed: narrow strip on the RIGHT
  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-11 bg-bg2 border-l border-border flex flex-col items-center py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="text-text-muted hover:text-text transition-colors text-base leading-none"
          title="Expand requests ]"
        >‹</button>

        {newCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-red flex items-center justify-center text-[10px] font-bold text-white font-mono">
            {newCount > 9 ? '9+' : newCount}
          </div>
        )}

        <div className="flex-1 flex items-center">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted"
            style={{ writingMode: 'vertical-rl' }}
          >
            Requests
          </span>
        </div>
      </div>
    )
  }

  // Expanded panel — RIGHT: border-l
  return (
    <div className="w-[310px] flex-shrink-0 bg-bg2 border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-[13px] font-semibold text-text">Requests</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-text-muted hover:text-text transition-colors text-[13px] px-1 leading-none"
          title="Collapse ]"
        >
          ›
        </button>
      </div>

      {/* Tabs */}
      <FeedTabs active={tab} onChange={setTab} counts={counts} />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-text-muted text-[13px] py-12">
            No {tab} requests
          </div>
        )}
        {filtered.map(req => (
          <RequestRow
            key={req.id}
            request={req}
            isSelected={state.selectedRequestId === req.id}
            isExpanded={state.expandedRequestId === req.id}
            onToggleExpand={() => toggleExpand(req.id)}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-border flex-shrink-0">
        <span className="text-[10px] text-text-muted">Press <kbd className="font-mono bg-surface2 px-1 py-px rounded text-[9px] border border-border">]</kbd> to collapse</span>
      </div>
    </div>
  )
}
