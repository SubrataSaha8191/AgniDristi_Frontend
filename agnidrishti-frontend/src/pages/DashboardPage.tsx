import { AlertTriangle, Factory, Flame, History, Plus, ShieldAlert } from 'lucide-react'
import { KPICard } from '../components/kpi/KPICard'
import { ThermalMap } from '../components/map/ThermalMap'
import { useKPISummary } from '../services/kpiService'

export default function DashboardPage() {
  const { data: kpis, isLoading, isError } = useKPISummary()

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
    </div>
  )
}
