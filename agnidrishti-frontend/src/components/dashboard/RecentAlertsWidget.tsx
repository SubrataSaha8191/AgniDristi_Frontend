import { Link } from 'react-router-dom'
import { useAlerts } from '../../services/alertService'

function formatAlertType(type: string) {
  return type.replaceAll('_', ' ')
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
}

export function RecentAlertsWidget() {
  const { data: alerts = [], isLoading } = useAlerts()
  const latestAlerts = [...alerts].sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp)).slice(0, 4)

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="recent-alerts-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-alerts-heading" className="text-sm font-semibold text-text-primary">Recent alerts</h2>
        <Link to="/alerts" className="text-xs font-medium text-accent hover:underline">View All</Link>
      </div>
      <div className="mt-4 divide-y divide-border">
        {isLoading && <p className="py-3 text-xs text-text-secondary">Loading alerts...</p>}
        {!isLoading && latestAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium capitalize text-text-primary">{formatAlertType(alert.type)} detected</p>
              <p className="mt-1 truncate font-mono text-[10px] text-text-secondary">{alert.sourceId}</p>
              <p className="mt-1 text-[10px] text-text-secondary">{formatTimestamp(alert.timestamp)}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${alert.severity === 'high' ? 'bg-red-50 text-danger' : alert.severity === 'medium' ? 'bg-amber-50 text-warning' : 'bg-slate-100 text-text-secondary'}`}>
              {alert.severity}
            </span>
          </div>
        ))}
        {!isLoading && alerts.length === 0 && <p className="py-3 text-xs text-text-secondary">No recent alerts.</p>}
      </div>
    </section>
  )
}
