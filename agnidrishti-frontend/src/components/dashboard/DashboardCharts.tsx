import { ActivityTimelineChart } from '../charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../charts/AnomalyDetectionChart'

export function DashboardCharts({ sourceId }: { sourceId: string | null }) {
  if (!sourceId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface/60 p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-text-primary">No Thermal Source Selected</p>
        <p className="mt-2 text-xs font-bold text-text-secondary">
          Select a thermal source object on the spatial map above to inspect detail timelines, thermal fingerprints, and anomaly trends.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <ActivityTimelineChart sourceId={sourceId} />
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <ThermalFingerprintChart sourceId={sourceId} />
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <AnomalyDetectionChart sourceId={sourceId} />
      </div>
    </div>
  )
}

