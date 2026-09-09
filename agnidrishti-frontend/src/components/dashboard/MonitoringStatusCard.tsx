import { Activity, CheckCircle2, XCircle } from 'lucide-react'
import { useMonitoringState } from '../../services/dashboardService'

const value = (input: string | number | null | undefined) => input == null ? 'Not available' : String(input)
const formatTime = (input: string | null) => input ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(input)) : 'Not available'

export function MonitoringStatusCard() {
  const query = useMonitoringState()
  const latest = query.data?.latest
  return (
    <section className="rounded-lg border border-border bg-surface p-5" aria-labelledby="monitoring-heading">
      <div className="flex items-center gap-2 border-b border-border pb-3"><Activity size={18} /><h2 id="monitoring-heading" className="text-sm font-semibold">Monitoring status</h2></div>
      {query.isLoading && <div className="mt-4 h-24 animate-pulse bg-text-primary/10" role="status"><span className="sr-only">Loading monitoring state</span></div>}
      {query.isError && <div className="mt-4"><p className="text-xs font-bold text-danger">Monitoring state could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 rounded-lg border border-border px-3 py-1 text-xs font-semibold">Retry</button></div>}
      {query.data && <div className="mt-4 space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Stat label="Total runs" value={query.data.total_runs} /><Stat label="Completed" value={query.data.completed_runs} icon={<CheckCircle2 size={14} className="text-success" />} /><Stat label="Failed" value={query.data.failed_runs} icon={<XCircle size={14} className="text-danger" />} /></div>{latest ? <div className="rounded-lg border border-border p-3 text-xs"><p className="font-semibold">Latest: {latest.status}</p><p className="mt-1 text-text-secondary">{latest.trigger_type} · {formatTime(latest.started_at)}</p><p className="mt-1 font-mono text-text-secondary">Fetched {value(latest.fetched)} · Inserted {value(latest.inserted)} · Matched {value(latest.matched)} · Unmatched {value(latest.unmatched)} · Alerts {value(latest.alerts_created)}</p>{latest.error_message && <p className="mt-2 font-bold text-danger">{latest.error_message}</p>}</div> : <p className="text-xs text-text-secondary">No monitoring runs have been recorded.</p>}</div>}
    </section>
  )
}

function Stat({ label, value: input, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return <div className="rounded-lg border border-border p-3"><p className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary">{icon}{label}</p><p className="mt-1 font-mono text-xl font-semibold">{input}</p></div>
}
