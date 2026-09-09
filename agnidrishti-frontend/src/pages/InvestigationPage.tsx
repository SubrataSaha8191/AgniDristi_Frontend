import { Link, useParams } from 'react-router-dom'
import { SatelliteContextViewer } from '../components/satellite/SatelliteContextViewer'
import { SourceHistoryTimeline } from '../components/timeline/SourceHistoryTimeline'
import { ActivityTimelineChart } from '../components/charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../components/charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../components/charts/AnomalyDetectionChart'
import { useSourceDetail } from '../services/sourceService'
import { useSourceStore } from '../stores/sourceStore'

export default function InvestigationPage() {
  const { sourceId: routeSourceId } = useParams()
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)
  const sourceId = routeSourceId ? decodeURIComponent(routeSourceId) : selectedSourceId
  const { data: source, isLoading, isError } = useSourceDetail(sourceId)

  if (!sourceId) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
         <Link to="/dashboard" className="text-xs font-semibold text-text-primary hover:underline">← Back to dashboard</Link>
         <div className="rounded-lg border border-border border-dashed bg-surface p-12 text-center">
           <h2 className="text-lg font-semibold text-text-primary">No Thermal Source Selected</h2>
           <p className="mt-2 text-xs font-medium text-text-secondary max-w-md mx-auto">
            Select a thermal source object on the spatial map or search list to inspect detail timelines, thermal fingerprints, and spatial imagery.
          </p>
           <Link to="/dashboard" className="mt-6 inline-block rounded-lg border border-border bg-accent px-5 py-2.5 text-xs font-medium text-white hover:opacity-90 transition-colors">
            Go to Spatial Map
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
       <Link to="/dashboard" className="text-xs font-semibold text-text-primary hover:underline">← Back to dashboard</Link>
       <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
           <span className="text-[10px] font-medium text-text-secondary">Source Investigation</span>
           <h1 className="mt-1 text-3xl font-semibold text-text-primary">{sourceId}</h1>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Context and spatial proximity assessment</p>
        </div>
        {source && (
          <div className="flex items-center gap-2">
             <span className="rounded-lg border border-border bg-accent px-3 py-1 text-xs font-medium text-white">
              {source.industrySubtype ?? source.category} · {source.confidence}% CONF
            </span>
          </div>
        )}
      </div>
       {isLoading && <p className="mt-8 text-xs font-medium text-text-secondary">Loading source details...</p>}
       {isError && <p className="mt-8 text-xs font-medium text-danger">Unable to load source details.</p>}
      {source && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
             <div className="rounded-lg border border-border bg-surface p-5"><ActivityTimelineChart sourceId={source.id} /></div>
             <div className="rounded-lg border border-border bg-surface p-5"><ThermalFingerprintChart sourceId={source.id} /></div>
             <div className="rounded-lg border border-border bg-surface p-5"><AnomalyDetectionChart sourceId={source.id} /></div>
          </div>
           <div className="rounded-lg border border-border bg-surface p-5"><SatelliteContextViewer sourceId={source.id} /></div>
           <div className="rounded-lg border border-border bg-surface p-5"><SourceHistoryTimeline source={source} /></div>
        </>
      )}
    </div>
  )
}
