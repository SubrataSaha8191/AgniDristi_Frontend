import { Link } from 'react-router-dom'
import { useDashboardAlerts } from '../../services/dashboardService'
import { useSourceStore } from '../../stores/sourceStore'

const formatTime = (input: string | null) => {
  if (!input) return 'Creation time unavailable'
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? input : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function RecentAlertsWidget() {
  const query = useDashboardAlerts(5)
  const openPanel = useSourceStore((state) => state.openPanel)
  const alerts = query.data?.alerts ?? []
  return (
    <section className="border-2 border-text-primary bg-surface p-5" aria-labelledby="recent-alerts-heading">
      <div className="flex items-center justify-between border-b-2 border-text-primary pb-3"><h2 id="recent-alerts-heading" className="text-sm font-black uppercase tracking-wider">Recent alerts</h2><Link to="/alerts" className="text-xs font-black uppercase underline">View all</Link></div>
      {query.isLoading && <div className="mt-4 space-y-2" role="status"><div className="h-14 animate-pulse bg-text-primary/10" /><div className="h-14 animate-pulse bg-text-primary/10" /><span className="sr-only">Loading alerts</span></div>}
      {query.isError && <div className="py-8 text-center"><p className="text-xs font-bold text-danger">Alerts could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 border-2 border-black px-3 py-1 text-xs font-black uppercase">Retry</button></div>}
      {!query.isLoading && !query.isError && alerts.length === 0 && <p className="py-8 text-center text-xs font-bold text-text-secondary">No alerts have been reported.</p>}
      <ul className="divide-y divide-text-primary/15">{alerts.map((alert) => <li key={alert.id} className="py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase">{alert.alert_type.replaceAll('_', ' ')}</p><p className="mt-1 text-xs text-text-secondary">{alert.message ?? 'No message provided'}</p><p className="mt-1 font-mono text-[10px] text-text-secondary">{formatTime(alert.created_at)}{alert.latitude != null && alert.longitude != null ? ` · ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}` : ''}</p></div><span className="border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase">{alert.severity ?? 'Not set'}</span></div>{alert.object_uid && <button type="button" onClick={() => openPanel(alert.object_uid!)} className="mt-2 text-[10px] font-black uppercase underline">Open object {alert.object_uid}</button>}</li>)}</ul>
    </section>
  )
}
