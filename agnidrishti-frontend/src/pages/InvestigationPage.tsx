import { Link, useParams } from 'react-router-dom'
import { NearbyFacilitiesTable } from '../components/tables/NearbyFacilitiesTable'
import { SatelliteContextViewer } from '../components/satellite/SatelliteContextViewer'
import { SourceHistoryTimeline } from '../components/timeline/SourceHistoryTimeline'
import { ActivityTimelineChart } from '../components/charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../components/charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../components/charts/AnomalyDetectionChart'
import { useSourceDetail } from '../services/sourceService'
import { useSources } from '../services/sourceService'
import { useSourceStore } from '../stores/sourceStore'

export default function InvestigationPage() {
  const { sourceId: routeSourceId } = useParams()
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)
  const { data: sources = [] } = useSources()
  const sourceId = routeSourceId ? decodeURIComponent(routeSourceId) : selectedSourceId ?? sources[0]?.id ?? 'THERM_0DE3BA3A11F1'
  const { data: source, isLoading, isError } = useSourceDetail(sourceId)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/dashboard" className="text-xs font-black uppercase text-text-primary hover:underline">← Back to dashboard</Link>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-text-primary pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">SOURCE INVESTIGATION</span>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-text-primary">{sourceId}</h1>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Context and spatial proximity assessment</p>
        </div>
        {source && (
          <div className="flex items-center gap-2">
            <span className="border-2 border-black dark:border-zinc-700 bg-[#d8f5a9] px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {source.industrySubtype ?? source.category} · {source.confidence}% CONF
            </span>
          </div>
        )}
      </div>
      {!sourceId && <p className="mt-8 text-xs font-bold uppercase text-text-secondary">Loading thermal source intelligence...</p>}
      {isLoading && <p className="mt-8 text-xs font-bold uppercase text-text-secondary">Loading source details...</p>}
      {isError && <p className="mt-8 text-xs font-bold uppercase text-danger">Unable to load source details.</p>}
      {source && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><ActivityTimelineChart sourceId={source.id} /></div>
            <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><ThermalFingerprintChart sourceId={source.id} /></div>
            <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><AnomalyDetectionChart sourceId={source.id} /></div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
            <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><SatelliteContextViewer sourceId={source.id} /></div>
            <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><NearbyFacilitiesTable sourceId={source.id} /></div>
          </div>
          <div className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><SourceHistoryTimeline source={source} /></div>
        </>
      )}
    </div>
  )
}
