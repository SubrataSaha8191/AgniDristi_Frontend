import { AlertTriangle, Factory, Flame, History, Plus, ShieldAlert } from 'lucide-react'
import { KPICard } from '../components/kpi/KPICard'
import { FilterPanel } from '../components/filters/FilterPanel'
import { ThermalMap } from '../components/map/ThermalMap'
import { ActivityTimelineChart } from '../components/charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../components/charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../components/charts/AnomalyDetectionChart'
import { RecentAlertsWidget } from '../components/dashboard/RecentAlertsWidget'
import { RegionalSourcesChart } from '../components/dashboard/RegionalSourcesChart'
import { IndustrialVsNaturalChart } from '../components/dashboard/IndustrialVsNaturalChart'
import { SourceTrendTable } from '../components/dashboard/SourceTrendTable'
import { useSourceStore } from '../stores/sourceStore'
import { useKPISummary } from '../services/kpiService'

export default function DashboardPage() {
  const { data: kpis, isLoading, isError } = useKPISummary()
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)

  const cards = [
    { label: 'Total Sources', value: kpis?.totalSources, deltaPct: kpis?.totalSourcesDeltaPct ?? 0, icon: Flame },
    { label: 'Persistent Sources', value: kpis?.persistentSources, deltaPct: 0, icon: History },
    { label: 'New Sources', value: kpis?.newSources, deltaPct: 0, icon: Plus },
    { label: 'Abnormal Sources', value: kpis?.abnormalSources, deltaPct: 0, icon: AlertTriangle },
    { label: 'Industrial Sources', value: kpis?.industrialSources, deltaPct: 0, icon: Factory },
    { label: 'High-Risk Alerts', value: kpis?.highRiskAlerts, deltaPct: 0, icon: ShieldAlert },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-text-secondary">Thermal source intelligence overview</p>
      
      {isError ? (
        <p className="mt-8 text-danger">Unable to load KPI summary.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => (
            <KPICard
              key={card.label}
              label={card.label}
              value={isLoading ? '...' : card.value ?? 0}
              deltaPct={card.deltaPct}
              icon={card.icon}
            />
          ))}
        </div>
      )}
      <div className="mt-6">
        <ThermalMap />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          {selectedSourceId ? <ActivityTimelineChart sourceId={selectedSourceId} /> : (
            <section aria-label="Historical activity">
              <h2 className="text-sm font-semibold text-text-primary">Historical activity</h2>
              <p className="mt-3 text-sm text-text-secondary">Select a source on the map to see its activity.</p>
            </section>
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          {selectedSourceId ? <ThermalFingerprintChart sourceId={selectedSourceId} /> : (
            <section aria-label="Thermal fingerprint">
              <h2 className="text-sm font-semibold text-text-primary">Thermal fingerprint</h2>
              <p className="mt-3 text-sm text-text-secondary">Select a source on the map to see its fingerprint.</p>
            </section>
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          {selectedSourceId ? <AnomalyDetectionChart sourceId={selectedSourceId} /> : (
            <section aria-label="Anomaly detection">
              <h2 className="text-sm font-semibold text-text-primary">Anomaly detection</h2>
              <p className="mt-3 text-sm text-text-secondary">Select a source on the map to see its anomaly trend.</p>
            </section>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1.4fr)]">
        <RecentAlertsWidget />
        <RegionalSourcesChart />
        <IndustrialVsNaturalChart />
      </div>
      <div className="mt-6">
        <SourceTrendTable />
      </div>
      <div className="mt-6">
        <FilterPanel />
      </div>
    </div>
  )
}
