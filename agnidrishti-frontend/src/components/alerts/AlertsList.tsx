import { AlertTriangle, ArrowRight, Clock3, MapPin } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { alertMapHref, formatAlertTimestamp } from '../../lib/alertPresentation'
import {
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  FILTERED_ALERTS_EMPTY_MESSAGE,
  GLOBAL_ALERTS_EMPTY_MESSAGE,
  normalizeAlertType,
  useAlertTypes,
  useAlerts,
} from '../../services/alertService'
import { useSourceStore } from '../../stores/sourceStore'
import type { Alert, AlertType } from '../../types/source'

const PAGE_SIZE = 50
const SEVERITY_STYLES: Record<string, string> = { CRITICAL: 'bg-red-600 text-white', HIGH: 'bg-red-600 text-white', MEDIUM: 'bg-amber-500 text-black', LOW: 'bg-emerald-500 text-black' }

function AlertRow({ alert }: { alert: Alert }) {
  const openPanel = useSourceStore((state) => state.openPanel)
  const severity = alert.severity?.toUpperCase() ?? 'LOW'
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.LOW
  const mapHref = alertMapHref(alert)

  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 stroke-[2.2] text-text-primary" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-text-primary">{ALERT_TYPE_LABELS[alert.alert_type]}</h3><span className={`border border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase ${style}`}>{severity}</span></div>
          <p className="mt-1 font-mono text-xs font-bold text-text-secondary">Location incident #{alert.id}</p>
          {alert.message && <p className="mt-1 text-xs text-text-secondary">{alert.message}</p>}
          {alert.firms_uid && <p className="mt-1 font-mono text-xs text-text-secondary">FIRMS reference: {alert.firms_uid}</p>}
          {alert.object_uid && <p className="mt-1 font-mono text-xs text-text-secondary">Object reference: {alert.object_uid}</p>}
          {mapHref && <p className="mt-1 font-mono text-xs text-text-secondary">{alert.latitude!.toFixed(4)}, {alert.longitude!.toFixed(4)}</p>}
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-text-secondary"><Clock3 size={12} />{formatAlertTimestamp(alert.created_at)}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {mapHref && <a href={mapHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-2 border-black px-3 py-1.5 text-xs font-black uppercase text-text-primary hover:bg-black hover:text-white"><MapPin size={14} />View on map</a>}
        {alert.object_uid && <button type="button" onClick={() => openPanel(alert.object_uid!)} className="inline-flex items-center gap-2 border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white hover:bg-zinc-800 dark:bg-[#d8f5a9] dark:text-black">Investigate <ArrowRight size={14} /></button>}
      </div>
    </li>
  )
}

function LoadingSkeleton() {
  return <div className="space-y-2 p-4" role="status" aria-label="Loading alerts"><div className="h-24 animate-pulse bg-text-primary/10" /><div className="h-24 animate-pulse bg-text-primary/10" /><div className="h-24 animate-pulse bg-text-primary/10" /></div>
}

export function AlertsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedType = normalizeAlertType(searchParams.get('type') ?? '')
  const requestedPage = Number(searchParams.get('page') ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const offset = (page - 1) * PAGE_SIZE
  const alertTypes: AlertType[] = selectedType ? [selectedType] : []
  const alertsQuery = useAlerts({ alertTypes, limit: PAGE_SIZE, offset })
  const typesQuery = useAlertTypes()
  const response = alertsQuery.data
  const alerts = response?.alerts ?? []
  const total = response?.total ?? 0
  const count = response?.count ?? 0
  const remaining = Math.max(0, total - offset - count)
  const firstResult = count === 0 ? 0 : offset + 1
  const lastResult = count === 0 ? 0 : offset + count
  const canGoNext = response?.has_more === true

  const selectType = (nextType: AlertType | null) => {
    const next = new URLSearchParams()
    if (nextType) next.set('type', nextType)
    setSearchParams(next)
  }

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="mt-6 border-2 border-black bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-4 py-3">
        <div><h2 className="text-sm font-black uppercase tracking-wider text-text-primary">Actionable location alerts</h2><p className="mt-0.5 text-xs font-medium text-text-secondary">Confirmed repeated unknown activity and abnormal known sources.</p></div>
        {response && <div className="text-right text-xs font-bold text-text-secondary"><span className="font-mono text-text-primary">{firstResult}-{lastResult}</span> of <span className="font-mono text-text-primary">{total}</span> alerts · {count} loaded · {remaining} remaining{alertsQuery.isFetching ? ' · updating' : ''}{alertsQuery.dataUpdatedAt > 0 && <p className="mt-0.5 text-[10px]">Updated {formatAlertTimestamp(new Date(alertsQuery.dataUpdatedAt).toISOString())}</p>}</div>}
      </div>
      <div className="flex flex-wrap gap-2 border-b-2 border-black bg-surface p-3" aria-label="Filter alerts by type">
        <button type="button" onClick={() => selectType(null)} aria-pressed={!selectedType} className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-all ${!selectedType ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-[#d8f5a9] dark:text-black' : 'bg-surface text-text-primary hover:bg-black hover:text-white'}`}>All actionable alerts</button>
        {ALERT_TYPES.map((alertType) => (
          <button key={alertType} type="button" title={!typesQuery.isPending && !typesQuery.isError && !typesQuery.data?.includes(alertType) ? 'No current alerts of this type' : undefined} onClick={() => selectType(alertType)} aria-pressed={selectedType === alertType} className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-all ${selectedType === alertType ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-[#d8f5a9] dark:text-black' : 'bg-surface text-text-primary hover:bg-black hover:text-white'}`}>{ALERT_TYPE_LABELS[alertType]}</button>
        ))}
      </div>
      {alertsQuery.isPending && <LoadingSkeleton />}
      {alertsQuery.isError && <div className="p-6 text-center"><p className="text-sm font-bold text-danger">Unable to load actionable alerts.</p><button type="button" onClick={() => alertsQuery.refetch()} className="mt-3 border-2 border-black px-3 py-1 text-xs font-black uppercase">Retry</button></div>}
      {!alertsQuery.isPending && !alertsQuery.isError && alerts.length === 0 && <p className="p-8 text-center text-sm font-bold text-text-secondary">{selectedType ? FILTERED_ALERTS_EMPTY_MESSAGE : GLOBAL_ALERTS_EMPTY_MESSAGE}</p>}
      {alerts.length > 0 && <ul className="divide-y divide-black/20" aria-label="Actionable location alerts">{alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}</ul>}
      {response && (page > 1 || response.has_more) && <div className="flex items-center justify-between gap-3 border-t-2 border-black p-3"><button type="button" disabled={page === 1 || alertsQuery.isFetching} onClick={() => goToPage(page - 1)} className="border-2 border-black px-3 py-1.5 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="font-mono text-xs font-bold">Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><button type="button" disabled={!canGoNext || alertsQuery.isFetching} onClick={() => goToPage(page + 1)} className="border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#d8f5a9] dark:text-black">Next</button></div>}
    </div>
  )
}
