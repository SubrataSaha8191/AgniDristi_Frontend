import { AlertTriangle, Factory, Flame, History, Plus, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KPICard } from '../components/kpi/KPICard'
import { FilterPanel } from '../components/filters/FilterPanel'
import { ThermalMap } from '../components/map/ThermalMap'
import { ActivityTimelineChart } from '../components/charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../components/charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../components/charts/AnomalyDetectionChart'
import { useSourceStore } from '../stores/sourceStore'
import { useKPISummary } from '../services/kpiService'
import { useAlerts } from '../services/alertService'
import { useSources } from '../services/sourceService'

const trendRows = [
  ['Industrial', 'industrial', 'green', '+7.1%'],
  ['Natural / Biomass', 'natural_biomass', 'green', '+5.3%'],
  ['Persistent', 'persistent', 'green', '+6.7%'],
  ['Abnormal', 'abnormal', 'green', '+18.5%'],
  ['Unknown', 'unknown', 'red', '-2.1%'],
  ['FIRMS detections', 'gas_flare', 'green', '+9.8%'],
] as const

const regions = [
  { district: 'Ranchi', state: 'Jharkhand' },
  { district: 'Dhanbad', state: 'Jharkhand' },
  { district: 'Patna', state: 'Bihar' },
  { district: 'Gaya', state: 'Bihar' },
  { district: 'Bhagalpur', state: 'Bihar' },
  { district: 'Kolkata', state: 'West Bengal' },
  { district: 'Purulia', state: 'West Bengal' },
  { district: 'Paschim Bardhaman', state: 'West Bengal' },
]

function seedFromString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function regionForSource(sourceId: string) {
  return regions[seedFromString(sourceId) % regions.length]
}

function alertLabel(type: string) {
  return type.replaceAll('_', ' ')
}

export default function DashboardPage() {
  const { data: kpis, isLoading, isError } = useKPISummary()
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)
  const { data: alerts = [] } = useAlerts()
  const { data: sources = [] } = useSources()
  const industrialCount = sources.filter((source) => source.category === 'industrial').length
  const naturalCount = sources.filter((source) => source.category === 'natural_biomass').length
  const unknownCount = sources.filter((source) => source.category === 'unknown').length
  const sourceTotal = sources.length
  const industrialShare = sourceTotal ? (industrialCount / sourceTotal) * 100 : 0
  const naturalShare = sourceTotal ? (naturalCount / sourceTotal) * 100 : 0
  const regionalThermalSources = regions
    .map((region) => ({
      name: region.district,
      value: sources.filter((source) => {
        const assignedRegion = regionForSource(source.id)
        return assignedRegion.district === region.district && assignedRegion.state === region.state
      }).length,
    }))
    .filter((region) => region.value > 0)
    .sort((first, second) => second.value - first.value)

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <div className="mt-6">
        <FilterPanel />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="recent-alerts-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-alerts-heading" className="text-sm font-semibold text-text-primary">Recent alerts</h2>
            <Link to="/alerts" className="text-xs font-medium text-accent hover:underline">View All</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium capitalize text-text-primary">{alertLabel(alert.type)} detected</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-text-secondary">{alert.sourceId}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-medium capitalize ${alert.severity === 'high' ? 'text-danger' : alert.severity === 'medium' ? 'text-warning' : 'text-text-secondary'}`}>{alert.severity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="regional-sources-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="regional-sources-heading" className="text-sm font-semibold text-text-primary">Regional thermal sources</h2>
            <Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View details →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
            {regionalThermalSources.map((region) => (
              <div key={region.name}>
                <div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-medium text-text-primary">{region.name}</span><span className="font-mono text-text-secondary">{region.value}</span></div>
                <div className="mt-2 h-2 rounded-full bg-bg"><div className="h-2 rounded-full bg-accent" style={{ width: `${(region.value / (regionalThermalSources[0]?.value || 1)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="source-breakdown-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="source-breakdown-heading" className="text-sm font-semibold text-text-primary">Industrial vs Natural</h2>
            <Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View details →</Link>
          </div>
          <div className="mt-5 flex items-center justify-center gap-6">
            <div className="h-32 w-32 rounded-full" style={{ background: `conic-gradient(var(--color-accent) 0 ${industrialShare}%, var(--color-success) ${industrialShare}% ${industrialShare + naturalShare}%, var(--color-border) ${industrialShare + naturalShare}% 100%)` }} aria-label="Industrial, natural, and unknown source breakdown" role="img" />
            <div className="space-y-3 text-xs text-text-secondary"><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-accent" />Industrial {industrialShare.toFixed(1)}%</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-success" />Natural / Biomass {naturalShare.toFixed(1)}%</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-border" />Unknown {sourceTotal ? ((unknownCount / sourceTotal) * 100).toFixed(1) : '0.0'}%</p></div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="source-trend-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="source-trend-heading" className="text-sm font-semibold text-text-primary">Source Trend (30 Days)</h2>
            <Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View All</Link>
          </div>
            <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] uppercase tracking-wide text-text-secondary"><tr><th className="pb-2 font-medium">Source type</th><th className="pb-2 text-right font-medium">Count</th><th className="pb-2 text-right font-medium">Change</th></tr></thead><tbody className="divide-y divide-border">{trendRows.map(([label, category, tone, change]) => <tr key={label}><td className="py-2 text-text-primary">{label}</td><td className="py-2 text-right font-mono text-text-secondary">{sources.filter((source) => source.category === category).length}</td><td className={`py-2 text-right font-mono ${tone === 'red' ? 'text-danger' : 'text-success'}`}>{change}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  )
}
