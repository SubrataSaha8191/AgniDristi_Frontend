import { useMemo, useState } from 'react'
import { Bell, Flame, Radar, ScanSearch, Zap } from 'lucide-react'
import { KPICard } from '../components/kpi/KPICard'
import { SectionHeading } from '../components/common/SectionHeading'
import { IndustryDistributionChart } from '../components/dashboard/IndustryDistributionChart'
import { RecentAlertsWidget } from '../components/dashboard/RecentAlertsWidget'
import { TopStatesDetectionsWidget } from '../components/dashboard/TopStatesDetectionsWidget'
import { ThermalObjectExplorer } from '../components/dashboard/ThermalObjectExplorer'
import { useDashboardMap, useDashboardSummary, useMapDates } from '../services/dashboardService'

export type MapDatasetMode = 'firms' | 'vnf'

export default function DashboardPage() {
  const datesQuery = useMapDates(30)
  const [requestedDate, setRequestedDate] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string | null>(null)
  const [datasetMode, setDatasetMode] = useState<MapDatasetMode>('firms')
  const mapQuery = useDashboardMap(requestedDate, 'all', 0, timeRange)
  const summaryQuery = useDashboardSummary()
  const mapData = mapQuery.data
  const availableDates = datesQuery.data?.dates ?? []
  const selectedDate = requestedDate ?? mapData?.selected_date ?? availableDates[0]?.date ?? null
  const matchedObjectCount = useMemo(
    () => new Set((mapData?.firms ?? []).map((detection) => detection.matched_object_uid).filter(Boolean)).size,
    [mapData?.firms],
  )
  const cards = [
    { label: 'FIRMS detections', value: mapData?.counts.firms, icon: Radar, loading: mapQuery.isLoading },
    { label: 'Matched FIRMS', value: mapData?.counts.matched_firms, icon: ScanSearch, loading: mapQuery.isLoading },
    { label: 'Unmatched FIRMS', value: mapData?.counts.unmatched_firms, icon: Zap, loading: mapQuery.isLoading },
    { label: 'Matched objects', value: matchedObjectCount, icon: Flame, loading: mapQuery.isLoading },
    { label: 'Actionable alerts', value: summaryQuery.data?.alerts, icon: Bell, loading: summaryQuery.isLoading },
  ]

  return (
    <div className="space-y-9 pb-12">
       <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
         <div>
           <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">Thermal source intelligence</h1>
         </div>
         {mapQuery.isFetching && <span role="status" className="text-xs font-medium text-text-secondary">Refreshing...</span>}
       </header>

      <section aria-label="Selected-date operational summary">
        <SectionHeading num="01" title="Operational summary" subtitle={timeRange ? `Rolling range ${timeRange} activity` : selectedDate ? `FIRMS activity for ${selectedDate}` : 'Thermal telemetry activity'} />
        <div className="mb-4 -mt-2 flex flex-wrap items-center justify-end gap-3">
          {mapData?.time_range && (
            <div className="text-[10px] font-mono text-text-secondary border border-border bg-surface px-2.5 py-1.5">
              Range: <span className="font-bold text-accent">{mapData.time_range.range}</span> ({new Date(mapData.time_range.from).toLocaleDateString()} - {new Date(mapData.time_range.to).toLocaleDateString()})
            </div>
          )}

          <div className="flex items-center gap-1 bg-surface border border-border p-1">
            <span className="px-2 text-[10px] font-semibold text-text-secondary">Time Window:</span>
            <button
              type="button"
              onClick={() => { setRequestedDate(null); setTimeRange('24h') }}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${timeRange === '24h' ? 'bg-accent text-white' : 'hover:bg-bg'}`}
            >
              24h
            </button>
            <button
              type="button"
              onClick={() => { setRequestedDate(null); setTimeRange('7d') }}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${timeRange === '7d' ? 'bg-accent text-white' : 'hover:bg-bg'}`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => { setRequestedDate(null); setTimeRange('30d') }}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${timeRange === '30d' ? 'bg-accent text-white' : 'hover:bg-bg'}`}
            >
              30d
            </button>
          </div>

          <label className="text-[10px] font-medium text-text-secondary">
            Specific date:
            <select
              value={requestedDate ?? ''}
              disabled={datesQuery.isLoading || datesQuery.isError || availableDates.length === 0}
              onChange={(event) => {
                if (event.target.value) {
                  setTimeRange(null)
                  setRequestedDate(event.target.value)
                }
              }}
              className="ml-2 border border-border bg-surface px-3 py-1.5 font-mono text-xs font-medium text-text-primary outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select date...</option>
              {datesQuery.isLoading && <option value="">Loading dates...</option>}
              {datesQuery.isError && <option value="">Dates unavailable</option>}
              {availableDates.map((entry) => <option key={entry.date} value={entry.date}>{entry.date} | {entry.firms_count} hits</option>)}
            </select>
          </label>
        </div>
         {mapQuery.isError ? <div className="rounded-lg border border-border bg-surface p-5"><p className="text-sm font-medium text-danger">Summary data could not be loaded.</p><button type="button" onClick={() => { void mapQuery.refetch() }} className="mt-3 rounded-lg border border-border bg-accent px-3 py-1.5 text-xs font-medium text-white">Retry</button></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map((card) => <KPICard key={card.label} label={card.label} value={card.loading ? '...' : card.value ?? 'Not available'} icon={card.icon} />)}</div>}
      </section>

      <section aria-label="Spatial object explorer"><SectionHeading num="02" title="Spatial object explorer" subtitle="Switch between selected-date FIRMS matches and VNF source history" /><ThermalObjectExplorer requestedDate={requestedDate} selectedDate={selectedDate} datasetMode={datasetMode} onDatasetModeChange={setDatasetMode} /></section>

       <section aria-label="Distribution and alerts"><SectionHeading num="03" title="Distribution and alerts" subtitle="Industry classifications and current operational alerts" /><div className="grid items-stretch gap-6 xl:grid-cols-[1.25fr_1fr]"><div className="flex min-w-0 flex-col gap-4"><IndustryDistributionChart /><TopStatesDetectionsWidget /></div><RecentAlertsWidget /></div></section>
    </div>
  )
}
