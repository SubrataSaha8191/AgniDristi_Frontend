import { Activity, AlertTriangle, Flame, Radar, ScanSearch, Sparkles, Zap } from 'lucide-react'
import { KPICard } from '../components/kpi/KPICard'
import { SectionHeading } from '../components/common/SectionHeading'
import { IndustryDistributionChart } from '../components/dashboard/IndustryDistributionChart'
import { MonitoringStatusCard } from '../components/dashboard/MonitoringStatusCard'
import { RecentAlertsWidget } from '../components/dashboard/RecentAlertsWidget'
import { ThermalObjectExplorer } from '../components/dashboard/ThermalObjectExplorer'
import { useDashboardSummary } from '../services/dashboardService'

function hintCount(hints: Record<string, number> | number | null | undefined) {
  if (typeof hints === 'number') return hints
  if (hints && typeof hints === 'object') return Object.values(hints).reduce((sum, count) => sum + count, 0)
  return null
}

export default function DashboardPage() {
  const summary = useDashboardSummary()
  const data = summary.data
  const cards = [
    { label: 'Thermal Objects', value: data?.thermal_objects, icon: Flame },
    { label: 'Temporal Hints', value: hintCount(data?.temporal_source_hints), icon: Sparkles },
    { label: 'FIRMS Detections', value: data?.firms_detections, icon: Radar },
    { label: 'Matched FIRMS', value: data?.matched_firms, icon: ScanSearch },
    { label: 'Unmatched FIRMS', value: data?.unmatched_firms, icon: Zap },
    { label: 'Alerts', value: data?.alerts, icon: AlertTriangle },
    { label: 'Monitoring', value: data?.latest_monitoring?.status ?? null, icon: Activity },
  ]

  return (
    <div className="space-y-9 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-text-primary pb-5">
        <div><div className="inline-flex items-center gap-2 border-2 border-black bg-black px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#d8f5a9]"><span className="h-2 w-2 bg-[#d8f5a9]" />System intelligence</div><h1 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-text-primary sm:text-4xl">Thermal source intelligence</h1><p className="mt-2 text-xs font-bold uppercase tracking-widest text-text-secondary">Backend-reported thermal objects, FIRMS detections, and flare assessments</p></div>
        {summary.isFetching && <span role="status" className="text-xs font-black uppercase text-text-secondary">Refreshing…</span>}
      </header>

      <section aria-label="Dashboard summary">
        <SectionHeading num="01" title="Operational summary" subtitle="Latest values reported by the Agni-Drishti API" />
        {summary.isError ? <div className="border-2 border-black bg-surface p-5"><p className="text-sm font-bold text-danger">Dashboard summary could not be loaded.</p><button type="button" onClick={() => summary.refetch()} className="mt-3 border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white">Retry</button></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{cards.map((card) => <KPICard key={card.label} label={card.label} value={summary.isLoading ? '…' : card.value ?? 'Not available'} icon={card.icon} />)}</div>}
      </section>

      <section aria-label="Spatial object explorer"><SectionHeading num="02" title="Spatial object explorer" subtitle="Synchronized filters, object list, and FIRMS overlay" /><ThermalObjectExplorer /></section>

      <section aria-label="Distribution and alerts"><SectionHeading num="03" title="Distribution and alerts" subtitle="Industry classifications and current operational alerts" /><div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]"><IndustryDistributionChart /><RecentAlertsWidget /></div></section>

      <section aria-label="Monitoring state"><SectionHeading num="04" title="Monitoring state" subtitle="Latest execution and aggregate pipeline status" /><MonitoringStatusCard /></section>
    </div>
  )
}
