import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSourceStore } from '../../stores/sourceStore'
import { useSourceDetail } from '../../services/sourceService'
import { DataSourceBadge } from './DataSourceBadge'
import { DetailField, SourceStatusSummary } from './SourceDetailHelpers'

export function SourceSnapshotPanel() {
  const selectedSourceId = useSourceStore((s) => s.selectedSourceId)
  const isPanelOpen = useSourceStore((s) => s.isPanelOpen)
  const isPanelCollapsed = useSourceStore((s) => s.isPanelCollapsed)
  const toggleCollapse = useSourceStore((s) => s.togglePanelCollapse)
  const closePanel = useSourceStore((s) => s.closePanel)
  const { data: source, isLoading, isError } = useSourceDetail(selectedSourceId)

  function handleClose() {
    closePanel()
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.leaflet-container')?.focus())
  }

  if (!isPanelOpen) return null

  return (
    <AnimatePresence>
      {isPanelCollapsed ? (
        <motion.div initial={{ x: 50 }} animate={{ x: 0 }} exit={{ x: 50 }}
          className="fixed right-0 top-24 z-[1100] flex items-center gap-2 border-2 border-r-0 border-black dark:border-zinc-700 bg-surface p-2 shadow-lg">
          <button type="button" onClick={toggleCollapse} aria-label="Expand source snapshot"
            className="flex items-center gap-1 text-xs font-black uppercase text-text-primary hover:text-accent">
            <ChevronLeft size={18} />
            <span className="max-w-[120px] truncate">{selectedSourceId ?? 'SNAPSHOT'}</span>
          </button>
        </motion.div>
      ) : (
        <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.2 }}
          role="dialog" aria-modal="true" aria-label="Source snapshot"
          className="source-panel-scroll fixed inset-y-0 right-0 z-[1100] w-full max-w-md overflow-y-auto border-l-2 border-black dark:border-zinc-700 bg-surface p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b-2 border-black dark:border-zinc-700 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Source snapshot</p>
              <h2 className="mt-0.5 text-lg font-black uppercase tracking-wider text-text-primary">{selectedSourceId}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={toggleCollapse} aria-label="Collapse panel" title="Collapse panel to unblock view"
                className="rounded-none border border-black dark:border-zinc-700 p-1.5 text-text-primary hover:bg-zinc-200 dark:hover:bg-zinc-800">
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={handleClose} aria-label="Close source snapshot"
                className="rounded-none border border-black dark:border-zinc-700 p-1.5 text-text-primary hover:bg-zinc-200 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>
          </div>

          {isLoading && <p className="mt-6 text-xs font-bold uppercase text-text-secondary animate-pulse">Loading source telemetry...</p>}
          {isError && <p className="mt-6 text-xs font-bold uppercase text-danger">Unable to load source telemetry.</p>}
          {source && (
            <>
              <SourceStatusSummary source={source} />
              <div className="mt-4"><DataSourceBadge /></div>
              <dl className="mt-5 space-y-1">
                <DetailField label="Source ID" value={source.id} />
                <DetailField label="Classification" value={source.category} />
                <DetailField label="Industry subtype" value={source.industrySubtype ?? 'Not classified'} />
                <DetailField label="Confidence score" value={`${source.confidence}%`} />
                <DetailField label="Persistence status" value={source.status} />
                <DetailField label="Anomaly level" value={source.anomalyLevel} />
                <DetailField label="Coordinates" value={`${source.lat.toFixed(4)}, ${source.lon.toFixed(4)}`} />
              </dl>
              <Link to={`/investigation/${encodeURIComponent(source.id)}`} onClick={handleClose}
                className="mt-6 block rounded-none border-2 border-black bg-black dark:bg-[#d8f5a9] px-4 py-2.5 text-center text-xs font-black uppercase tracking-widest text-[#d8f5a9] dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:opacity-90">
                View Full Investigation
              </Link>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
