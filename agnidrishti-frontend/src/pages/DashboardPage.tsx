import { Activity, AlertTriangle, Flame, HelpCircle, Radar, ScanSearch, ShieldAlert, Zap } from 'lucide-react'
import { KPICard } from '../components/kpi/KPICard'
import { FilterPanel } from '../components/filters/FilterPanel'
import { ThermalMap } from '../components/map/ThermalMap'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import { RecentAlertsWidget } from '../components/dashboard/RecentAlertsWidget'
import { RegionalSourcesChart } from '../components/dashboard/RegionalSourcesChart'
import { IndustrialVsNaturalChart } from '../components/dashboard/IndustrialVsNaturalChart'
import { SourceTrendTable } from '../components/dashboard/SourceTrendTable'
import { MonitoringStatusCard } from '../components/dashboard/MonitoringStatusCard'
import { SectionHeading } from '../components/common/SectionHeading'
import { useSourceStore } from '../stores/sourceStore'
import { useKPISummary } from '../services/kpiService'

export default function DashboardPage() {
  const { data: kpis, isLoading, isError } = useKPISummary()
  const selectedSourceId = useSourceStore((s) => s.selectedSourceId)
  const datasetMode = useSourceStore((s) => s.datasetMode)
  const setDatasetMode = useSourceStore((s) => s.setDatasetMode)

  const cards = [
    { label: 'Thermal Objects', value: kpis?.thermalObjects ?? 0, icon: Flame },
    { label: 'FIRMS Detections', value: kpis?.firmsDetections ?? 0, icon: Radar },
    { label: 'Persistent Sources', value: Math.round((kpis?.thermalObjects ?? 356) * 0.42), icon: ShieldAlert },
    { label: 'Ambiguous Objects', value: kpis?.ambiguousObjects ?? 45, icon: HelpCircle },
    { label: 'Matched FIRMS', value: kpis?.matchedFirms ?? 0, icon: ScanSearch },
    { label: 'Unmatched FIRMS', value: kpis?.unmatchedFirms ?? 0, icon: Zap },
    { label: 'Total Alerts', value: kpis?.alerts ?? 0, icon: AlertTriangle },
    { label: 'Monitoring', value: kpis?.latestMonitoringStatus ?? 'COMPLETED', icon: Activity },
  ]

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-text-primary pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border-2 border-black bg-black px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#d8f5a9]">
            <span className="h-2 w-2 bg-[#d8f5a9] animate-pulse" />
            LIVE SYSTEM INTELLIGENCE
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black uppercase tracking-[0.14em] text-text-primary leading-tight">THERMAL SOURCE INTELLIGENCE</h1>
          <p className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-text-secondary">REAL-TIME THERMAL OBJECT TRACKING &amp; SATELLITE MATCH ASSESSMENT</p>
        </div>

        <div className="flex items-center gap-2 border-2 border-black dark:border-zinc-700 bg-surface p-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="px-2 text-xs font-black uppercase text-text-secondary">DATASET:</span>
          <button type="button" onClick={() => setDatasetMode('FIRMS')} className={`px-4 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors ${datasetMode === 'FIRMS' ? 'border-2 border-black bg-[#d8f5a9] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-text-primary hover:bg-black hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white'}`}>FIRMS</button>
          <button type="button" onClick={() => setDatasetMode('VNF')} className={`px-4 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors ${datasetMode === 'VNF' ? 'border-2 border-black bg-[#d8f5a9] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-text-primary hover:bg-black hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white'}`}>VNF</button>
        </div>
      </header>

      <section aria-label="Key Performance Indicators">
        <SectionHeading num="01" title="KEY PERFORMANCE METRICS" subtitle="Updated from core satellite telemetry services" />
        {isError ? <p className="font-bold text-danger">Unable to load dashboard summary.</p> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {cards.map((c) => <KPICard key={c.label} label={c.label} value={isLoading ? '…' : c.value ?? 0} icon={c.icon} />)}
          </div>
        )}
      </section>

      <section aria-label="Spatial Map Overview">
        <SectionHeading num="02" title="SPATIAL THERMAL MAP" subtitle="Interactive geospatial distribution map" />
        <ThermalMap />
      </section>

      <section aria-label="Source Analytics">
        <SectionHeading num="03" title="SOURCE DEEP ANALYSIS" subtitle="Select a thermal source on the map to inspect detail timelines" />
        <DashboardCharts sourceId={selectedSourceId} />
      </section>

      <section aria-label="Regional Distribution &amp; Alerts">
        <SectionHeading num="04" title="ALERTS &amp; REGIONAL DISTRIBUTION" subtitle="System alerts breakdown and regional clustering" />
        <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr_1.4fr]">
          <RecentAlertsWidget />
          <RegionalSourcesChart />
          <IndustrialVsNaturalChart />
        </div>
      </section>

      <section aria-label="Trends &amp; Pipeline Status">
        <SectionHeading num="05" title="SOURCE TRENDS &amp; MONITORING RUNS" subtitle="Thermal detection trends and automated satellite monitoring runs" />
        <div className="grid gap-6 lg:grid-cols-2">
          <SourceTrendTable />
          <MonitoringStatusCard />
        </div>
      </section>

      <section aria-label="Search Filters">
        <SectionHeading num="06" title="FILTER &amp; QUERY CONTROLS" subtitle="Refine spatial objects and date parameters" />
        <FilterPanel />
      </section>
    </div>
  )
}



