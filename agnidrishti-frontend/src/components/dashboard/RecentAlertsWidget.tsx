import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { alertMapHref, formatAlertTimestamp } from '../../lib/alertPresentation'
import {
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  FILTERED_ALERTS_EMPTY_MESSAGE,
  GLOBAL_ALERTS_EMPTY_MESSAGE,
  useAlerts,
} from '../../services/alertService'
import { useDashboardSummary } from '../../services/dashboardService'
import type { AlertType } from '../../types/source'

type AlertSelection = AlertType | 'ALL'

export function RecentAlertsWidget() {
  const [selectedType, setSelectedType] = useState<AlertSelection>('ALL')
  const query = useAlerts({ alertTypes: selectedType === 'ALL' ? [] : [selectedType], limit: 5, offset: 0 })
  const summaryQuery = useDashboardSummary()
  const alerts = query.data?.alerts ?? []
  const actionableTotal = summaryQuery.data?.alerts ?? query.data?.total ?? 0
  const selectedTotal = selectedType === 'ALL' ? actionableTotal : query.data?.total ?? 0

  return (
    <section className="rounded-lg border border-border bg-surface p-5" aria-labelledby="recent-alerts-heading">
      <div className="flex items-center justify-between border-b-2 border-text-primary pb-3">
        <div>
          <h2 id="recent-alerts-heading" className="text-sm font-semibold">Recent actionable alerts</h2>
          <p className="mt-0.5 text-[10px] font-bold text-text-secondary">Location-based incidents requiring attention</p>
        </div>
        <Link to={`/alerts${selectedType !== 'ALL' ? `?type=${selectedType}` : ''}`} className="rounded-lg border border-border bg-accent px-2.5 py-1 text-xs font-semibold text-text-primary hover:bg-accent/80">
          View all ({selectedTotal})
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-b border-text-primary/20 pb-3">
        <button type="button" onClick={() => setSelectedType('ALL')} aria-pressed={selectedType === 'ALL'} className={`rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold transition-colors ${selectedType === 'ALL' ? 'bg-accent text-text-primary' : 'bg-surface text-text-primary hover:bg-accent/20'}`}>All actionable alerts</button>
        {ALERT_TYPES.map((alertType) => <button key={alertType} type="button" onClick={() => setSelectedType(alertType)} aria-pressed={selectedType === alertType} className={`rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold transition-colors ${selectedType === alertType ? 'bg-accent text-text-primary' : 'bg-surface text-text-primary hover:bg-accent/20'}`}>{ALERT_TYPE_LABELS[alertType]}</button>)}
      </div>

      {query.isPending && <div className="mt-4 space-y-2" role="status" aria-label="Loading recent alerts"><div className="h-20 animate-pulse bg-text-primary/10" /><div className="h-20 animate-pulse bg-text-primary/10" /></div>}
      {query.isError && <div className="py-8 text-center"><p className="text-xs font-bold text-danger">Alerts could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 border border-border px-3 py-1 text-xs font-semibold">Retry</button></div>}
      {!query.isPending && !query.isError && alerts.length === 0 && <p className="py-8 text-center text-xs font-bold text-text-secondary">{selectedType === 'ALL' ? GLOBAL_ALERTS_EMPTY_MESSAGE : FILTERED_ALERTS_EMPTY_MESSAGE}</p>}

      <ul className="divide-y divide-text-primary/15">
        {alerts.map((alert) => {
          const mapHref = alertMapHref(alert)
          return (
            <li key={alert.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold">{ALERT_TYPE_LABELS[alert.alert_type]}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold text-text-secondary">Location incident #{alert.id}</p>
                  {alert.message && <p className="mt-1 text-xs text-text-secondary">{alert.message}</p>}
                  {alert.firms_uid && <p className="mt-1 font-mono text-[10px] text-text-secondary">FIRMS: {alert.firms_uid}</p>}
                  {alert.object_uid && <p className="mt-1 font-mono text-[10px] text-text-secondary">Object: {alert.object_uid}</p>}
                  <p className="mt-1 font-mono text-[10px] text-text-secondary">{formatAlertTimestamp(alert.created_at)}{mapHref ? ` · ${alert.latitude!.toFixed(4)}, ${alert.longitude!.toFixed(4)}` : ''}</p>
                </div>
                <span className="rounded-lg border border-border px-2 py-0.5 text-[10px] font-semibold">{alert.severity ?? 'LOW'}</span>
              </div>
              {mapHref && <a href={mapHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold underline"><MapPin size={12} />View on map</a>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
