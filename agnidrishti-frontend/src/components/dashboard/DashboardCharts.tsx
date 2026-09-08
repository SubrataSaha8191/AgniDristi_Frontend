import { ActivityTimelineChart } from '../charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../charts/AnomalyDetectionChart'
import { useSources } from '../../services/sourceService'

export function DashboardCharts({ sourceId }: { sourceId: string | null }) {
  const { data: sources = [] } = useSources()
  const activeId = sourceId || sources[0]?.id || 'THERM_5D14B37847E0'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-none border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-sm">
        <ActivityTimelineChart sourceId={activeId} />
      </div>
      <div className="rounded-none border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-sm">
        <ThermalFingerprintChart sourceId={activeId} />
      </div>
      <div className="rounded-none border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-sm">
        <AnomalyDetectionChart sourceId={activeId} />
      </div>
    </div>
  )
}

