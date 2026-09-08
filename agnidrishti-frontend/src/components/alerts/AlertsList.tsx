import { AlertTriangle, ArrowRight, Clock3 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAlerts } from '../../services/alertService'
import { useSourceStore } from '../../stores/sourceStore'
import type { Alert } from '../../types/source'

const categories = [{ key: 'ALL', label: 'All Categories' }, { key: 'unmatched_anomaly', label: 'Unmatched Anomaly' }, { key: 'repeated_unmatched', label: 'Repeated Unmatched' }, { key: 'abnormal_known_source', label: 'Abnormal Known Source' }] as const
const SEVERITY_STYLES: Record<string, string> = { CRITICAL: 'bg-red-600 text-white', HIGH: 'bg-red-600 text-white', MEDIUM: 'bg-amber-500 text-black', LOW: 'bg-emerald-500 text-black' }

function formatTimestamp(ts?: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function AlertRow({ alert }: { alert: Alert }) {
  const openPanel = useSourceStore((s) => s.openPanel)
  const sev = alert.severity?.toUpperCase() ?? 'LOW'
  const style = SEVERITY_STYLES[sev] ?? SEVERITY_STYLES.LOW
  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 text-text-primary shrink-0 stroke-[2.2]" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold uppercase text-text-primary">{alert.alert_type.replaceAll('_', ' ')}</h3><span className={`border border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase ${style}`}>{sev}</span></div>
          <p className="mt-1 font-mono text-xs text-text-secondary font-bold">{alert.object_uid ?? `Alert #${alert.id}`}</p>
          {alert.message && <p className="mt-1 text-xs text-text-secondary">{alert.message}</p>}
          {alert.latitude != null && alert.longitude != null && <p className="mt-1 font-mono text-xs text-text-secondary">{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</p>}
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary font-semibold"><Clock3 size={12} />{formatTimestamp(alert.created_at)}</p>
        </div>
      </div>
      {alert.object_uid && <button type="button" onClick={() => openPanel(alert.object_uid!)} className="inline-flex shrink-0 items-center gap-2 border-2 border-black bg-black dark:bg-[#d8f5a9] px-3 py-1.5 text-xs font-black uppercase text-white dark:text-black hover:bg-zinc-800">Investigate <ArrowRight size={14} /></button>}
    </li>
  )
}

export function AlertsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type') || 'ALL'
  const { data: alerts = [], isLoading, isError, dataUpdatedAt, refetch } = useAlerts()

  const counts: Record<string, number> = {
    ALL: alerts.length,
    unmatched_anomaly: alerts.filter((a) => a.alert_type === 'unmatched_anomaly').length,
    repeated_unmatched: alerts.filter((a) => a.alert_type === 'repeated_unmatched').length,
    abnormal_known_source: alerts.filter((a) => a.alert_type === 'abnormal_known_source').length,
  }
  const filtered = activeType === 'ALL' ? alerts : alerts.filter((a) => a.alert_type === activeType)

  if (isLoading) return <p className="mt-6 text-sm font-bold text-text-secondary">Loading alerts…</p>
  if (isError) return <div className="mt-6 border-2 border-black bg-surface p-6 text-center"><p className="text-sm font-bold text-danger">Unable to load alerts.</p><button type="button" onClick={() => refetch()} className="mt-3 border-2 border-black px-3 py-1 text-xs font-black uppercase">Retry</button></div>

  return (
    <div className="mt-6 border-2 border-black bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-4 py-3">
        <div><h2 className="text-sm font-black uppercase tracking-wider text-text-primary">Active Alerts Stream</h2><p className="mt-0.5 text-xs text-text-secondary font-medium">Real-time thermal source detection and satellite anomaly alerts.</p></div>
        <div className="text-right text-xs text-text-secondary font-bold"><span className="font-mono text-text-primary">{filtered.length}</span> / <span className="font-mono text-text-primary">{alerts.length}</span> ALERTS · POLLING 30S{dataUpdatedAt > 0 && <p className="mt-0.5 text-[10px]">Updated {formatTimestamp(new Date(dataUpdatedAt).toISOString())}</p>}</div>
      </div>
      <div className="flex flex-wrap gap-2 border-b-2 border-black p-3 bg-surface">
        {categories.map((cat) => (
          <button key={cat.key} type="button" onClick={() => setSearchParams(cat.key === 'ALL' ? {} : { type: cat.key })} className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-all ${activeType === cat.key ? 'bg-black text-white dark:bg-[#d8f5a9] dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-surface text-text-primary hover:bg-black hover:text-white'}`}>{cat.label} ({counts[cat.key] ?? 0})</button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="p-8 text-center text-sm font-bold text-text-secondary">No alerts found for this category.</p> : <ul className="divide-y divide-black/20" aria-label="Active alerts">{filtered.map((a) => <AlertRow key={a.id} alert={a} />)}</ul>}
    </div>
  )
}



