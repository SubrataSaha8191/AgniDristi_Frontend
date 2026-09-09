import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Layers, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDetectionsByState } from '../../services/dashboardService'
import { sortStateDetections, type StateSortOption } from './stateDetectionUtils'

export function StateDistrictDetectionsWidget() {
  const { data, isLoading, isError, refetch } = useDetectionsByState()
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({})
  const [searchFilter, setSearchFilter] = useState('')
  const [sortOption, setSortOption] = useState<StateSortOption>('name-asc')

  const toggleState = (stateName: string) => {
    setExpandedStates((prev) => ({ ...prev, [stateName]: !prev[stateName] }))
  }

  const states = (data?.states ?? []).filter((state) => {
    const name = state.state_name?.trim().toLowerCase()
    return Boolean(name && name !== 'unassigned' && name !== 'unknown' && name !== 'n/a')
  })
  const maxDetections = Math.max(...states.map((s) => s.total_detection_count), 1)

  const filteredStates = sortStateDetections(states
    .filter((s) => {
      if (!searchFilter.trim()) return true
      const term = searchFilter.toLowerCase()
      if (s.state_name.toLowerCase().includes(term)) return true
      return s.districts.some((d) => d.district_name.toLowerCase().includes(term))
    }), sortOption)

  return (
    <section className="flex flex-col h-[32rem] max-h-[32rem] rounded-lg border border-border bg-surface p-5 shadow-sm overflow-hidden" aria-labelledby="state-district-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 shrink-0">
        <div>
          <h2 id="state-district-heading" className="flex items-center gap-2 text-sm font-semibold text-text-primary uppercase tracking-wider">
            <MapPin size={17} className="text-accent" aria-hidden="true" />
            Detections by State & District
          </h2>
          <p className="mt-0.5 text-[10px] font-bold text-text-secondary">
            Live administrative geography breakdown ({data?.count ?? 0} states · {data?.total_detections.toLocaleString() ?? 0} detections total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'name-asc' | 'count-desc' | 'count-asc')}
            className="rounded-lg border border-border bg-bg px-2.5 py-1 text-xs font-semibold text-text-primary outline-none focus:ring-1 focus:ring-accent cursor-pointer"
            aria-label="Sort states by"
          >
            <option value="name-asc">Sort: Name (A–Z)</option>
            <option value="count-desc">Sort: Count (High to Low)</option>
            <option value="count-asc">Sort: Count (Low to High)</option>
          </select>

          <input
            type="text"
            placeholder="Search state/district..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg px-2.5 py-1 text-xs font-medium text-text-primary outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-3" role="status">
          <div className="h-12 animate-pulse bg-text-primary/10" />
          <div className="h-12 animate-pulse bg-text-primary/10" />
          <div className="h-12 animate-pulse bg-text-primary/10" />
        </div>
      )}

      {isError && (
        <div className="py-8 text-center">
          <p className="text-xs font-bold text-danger">Unable to load geography breakdown.</p>
          <button type="button" onClick={() => void refetch()} className="mt-3 border border-border bg-accent px-3 py-1 text-xs font-semibold text-white">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredStates.length === 0 && (
        <p className="py-8 text-center text-xs font-bold text-text-secondary">No matching states or districts found.</p>
      )}

      {!isLoading && !isError && filteredStates.length > 0 && (
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
          {filteredStates.map((stateItem) => {
            const isExpanded = Boolean(expandedStates[stateItem.state_name])
            const percentage = Math.round((stateItem.total_detection_count / maxDetections) * 100)

            return (
              <div key={stateItem.state_name} className="border border-border bg-bg/50 p-3 transition-colors hover:border-accent">
                <div className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleState(stateItem.state_name)}
                      className="cursor-pointer text-text-secondary hover:text-accent"
                    >
                      {isExpanded ? <ChevronDown size={16} className="text-accent shrink-0" /> : <ChevronRight size={16} className="text-text-secondary shrink-0" />}
                    </button>
                    <Link
                      to={`/state/${encodeURIComponent(stateItem.state_name)}`}
                      className="font-semibold text-xs text-text-primary truncate hover:text-accent hover:underline flex items-center gap-1"
                    >
                      <span>{stateItem.state_name}</span>
                      <ExternalLink size={11} className="text-text-secondary opacity-60 hover:opacity-100" />
                    </Link>
                    <span className="font-mono text-[10px] text-text-secondary">({stateItem.districts.length} districts)</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-text-primary">{stateItem.total_detection_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-transparent border border-border">
                  <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
                </div>

                <div className="mt-1 flex justify-between text-[9px] font-mono text-text-secondary">
                  <span>VNF: {stateItem.vnf_detection_count.toLocaleString()}</span>
                  <span>FIRMS: {stateItem.firms_detection_count.toLocaleString()}</span>
                </div>

                {/* Accordion list of districts */}
                {isExpanded && stateItem.districts.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2.5 space-y-1.5 pl-4">
                    {stateItem.districts.map((district) => (
                      <div key={district.district_name} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/40 last:border-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Layers size={12} className="text-text-secondary shrink-0" />
                          <span className="font-medium text-text-primary truncate">{district.district_name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                          <span className="text-text-secondary">VNF: {district.vnf_detection_count}</span>
                          <span className="text-text-secondary">FIRMS: {district.firms_detection_count}</span>
                          <span className="font-bold text-text-primary">{district.total_detection_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
