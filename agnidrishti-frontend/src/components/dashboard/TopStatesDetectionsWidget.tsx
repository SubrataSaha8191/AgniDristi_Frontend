import { useDetectionsByState } from '../../services/dashboardService'
import { sortStateDetections } from './stateDetectionUtils'

export function TopStatesDetectionsWidget() {
  const { data, isLoading, isError, refetch } = useDetectionsByState()
  const topStates = sortStateDetections((data?.states ?? []).filter((state) => {
    const name = state.state_name?.trim().toLowerCase()
    return Boolean(name && name !== 'unassigned' && name !== 'unknown' && name !== 'n/a')
  }), 'count-desc').slice(0, 4)
  const maxDetections = Math.max(...topStates.map((state) => state.total_detection_count), 1)

  return (
    <section className="rounded-lg border border-border/50 bg-surface p-4" aria-labelledby="top-states-heading">
      <div className="border-b border-border/50 pb-2">
        <h2 id="top-states-heading" className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
          <span className="mr-2 font-mono text-accent">03.1</span>
          Top states by detections
        </h2>
        <p className="mt-0.5 text-[9px] font-bold text-text-secondary">Highest-volume state detections across VNF and FIRMS</p>
      </div>

      {isLoading && <div className="mt-3 space-y-2" role="status" aria-label="Loading top states"><div className="h-9 animate-pulse bg-text-primary/10" /><div className="h-9 animate-pulse bg-text-primary/10" /><div className="h-9 animate-pulse bg-text-primary/10" /><div className="h-9 animate-pulse bg-text-primary/10" /></div>}
      {isError && <div className="py-4 text-center"><p className="text-[10px] font-bold text-danger">State summary could not be loaded.</p><button type="button" onClick={() => void refetch()} className="mt-2 border border-border bg-accent px-2.5 py-1 text-[10px] font-semibold text-white">Retry</button></div>}
      {!isLoading && !isError && topStates.length === 0 && <p className="py-4 text-center text-[10px] font-bold text-text-secondary">No state detections reported.</p>}

      {!isLoading && !isError && topStates.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {topStates.map((state) => {
            const percentage = Math.round((state.total_detection_count / maxDetections) * 100)
            return (
              <div key={state.state_name} className="border border-border bg-bg/50 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[11px] font-semibold text-text-primary">{state.state_name}</span>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-text-primary">{state.total_detection_count.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1 w-full border border-border bg-transparent"><div className="h-full bg-accent" style={{ width: `${percentage}%` }} /></div>
                <div className="mt-0.5 flex justify-between font-mono text-[8px] text-text-secondary"><span>VNF: {state.vnf_detection_count.toLocaleString()}</span><span>FIRMS: {state.firms_detection_count.toLocaleString()}</span></div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
