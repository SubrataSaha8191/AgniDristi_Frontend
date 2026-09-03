import { AlertTriangle, ArrowRight, Clock3 } from 'lucide-react'
import { useAlerts } from '../../services/alertService'
import { useSourceStore } from '../../stores/sourceStore'
import type { Alert } from '../../types/source'

const ALERT_TYPE_LABELS: Record<Alert['type'], string> = {
  high_anomaly: 'High anomaly',
  new_persistent: 'New persistent source',
  unusual_pattern: 'Unusual pattern',
  new_industrial: 'New industrial source',
  low_confidence: 'Low-confidence classification',
}

const SEVERITY_STYLES: Record<Alert['severity'], string> = {
  high: 'border-danger/20 bg-danger/10 text-danger',
  medium: 'border-warning/20 bg-warning/10 text-warning',
  low: 'border-info/20 bg-info/10 text-info',
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function AlertRow({ alert }: { alert: Alert }) {
  const openPanel = useSourceStore((state) => state.openPanel)

  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`mt-0.5 rounded-full border p-2 ${SEVERITY_STYLES[alert.severity]}`}>
          <AlertTriangle size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-text-primary">{ALERT_TYPE_LABELS[alert.type]}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[alert.severity]}`}>
              {alert.severity}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-text-secondary">{alert.sourceId}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <Clock3 size={12} aria-hidden="true" />
            {formatTimestamp(alert.timestamp)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openPanel(alert.sourceId)}
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:self-auto"
      >
        Investigate
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </li>
  )
}

export function AlertsList() {
  const { data: alerts = [], isLoading, isError, dataUpdatedAt } = useAlerts()

  if (isLoading) return <p className="mt-6 text-sm text-text-secondary">Loading alerts...</p>
  if (isError) return <p className="mt-6 text-sm text-danger">Unable to load alerts.</p>
  if (alerts.length === 0) return <p className="mt-6 rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-secondary">No active alerts.</p>

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Active alerts</h2>
          <p className="mt-0.5 text-xs text-text-secondary">Review thermal-source events requiring attention.</p>
        </div>
        <div className="text-right text-xs text-text-secondary">
          <span className="font-medium text-text-primary">{alerts.length}</span> alerts · polling every 30s
          {dataUpdatedAt > 0 && <p className="mt-0.5">Updated {formatTimestamp(new Date(dataUpdatedAt).toISOString())}</p>}
        </div>
      </div>
      <ul className="divide-y divide-border" aria-label="Active alerts">
        {alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
      </ul>
    </div>
  )
}
