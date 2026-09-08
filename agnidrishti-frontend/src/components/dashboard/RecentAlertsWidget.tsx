import { Link } from 'react-router-dom'
import { useAlerts } from '../../services/alertService'
import type { Alert } from '../../types/source'

function formatAlertType(type: string) {
  return type.replaceAll('_', ' ').toLowerCase()
}

function formatTimestamp(ts?: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(d)
  } catch {
    return ts
  }
}

function severityStyle(severity: string | null) {
  const s = severity?.toUpperCase()
  if (s === 'HIGH' || s === 'CRITICAL') return 'border-2 border-black bg-red-600 text-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
  if (s === 'MEDIUM') return 'border-2 border-black bg-amber-500 text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
  return 'border-2 border-black bg-emerald-500 text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
}

function AlertRow({ alert }: { alert: Alert }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold uppercase text-text-primary">
          {formatAlertType(alert.alert_type)}
        </p>
        <p className="mt-1 truncate font-mono text-[10px] text-text-secondary font-bold">
          {alert.object_uid ?? alert.firms_uid ?? `Alert #${alert.id}`}
        </p>
        <p className="mt-1 text-[10px] text-text-secondary">
          {formatTimestamp(alert.created_at)}
        </p>
      </div>
      <span className={`shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase ${severityStyle(alert.severity)}`}>
        {alert.severity ?? 'INFO'}
      </span>
    </div>
  )
}

export function RecentAlertsWidget() {
  const { data: alerts = [], isLoading } = useAlerts()
  const displayAlerts = alerts.slice(0, 5)

  return (
    <section className="rounded-none border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-sm" aria-labelledby="recent-alerts-heading">
      <div className="flex items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-3">
        <h2 id="recent-alerts-heading" className="text-sm font-black uppercase tracking-wider text-text-primary">Recent Alerts</h2>
        <Link to="/alerts" className="text-xs font-bold uppercase tracking-wider text-text-primary hover:underline">View All →</Link>
      </div>
      <div className="mt-4 divide-y divide-black/20 dark:divide-zinc-800">
        {isLoading && <p className="py-3 text-xs font-bold text-text-secondary animate-pulse">Loading alerts...</p>}
        {!isLoading && displayAlerts.map((a) => <AlertRow key={a.id} alert={a} />)}
        {!isLoading && alerts.length === 0 && (
          <p className="py-3 text-xs text-text-secondary">No active alerts.</p>
        )}
      </div>
    </section>
  )
}

