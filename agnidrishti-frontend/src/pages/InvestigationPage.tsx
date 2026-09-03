import { Link, useParams } from 'react-router-dom'
import { NearbyFacilitiesTable } from '../components/tables/NearbyFacilitiesTable'
import { SatelliteContextViewer } from '../components/satellite/SatelliteContextViewer'
import { useSourceDetail } from '../services/sourceService'

const DEFAULT_SOURCE_ID = 'AGNI-IND-004821'

export default function InvestigationPage() {
  const { sourceId: routeSourceId } = useParams()
  const sourceId = routeSourceId ? decodeURIComponent(routeSourceId) : DEFAULT_SOURCE_ID
  const { data: source, isLoading, isError } = useSourceDetail(sourceId)

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/dashboard" className="text-xs font-medium text-accent hover:underline">← Back to dashboard</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Source investigation</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">{sourceId}</h1>
          <p className="mt-1 text-sm text-text-secondary">Context and proximity assessment</p>
        </div>
        {source && <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">{source.category} · {source.confidence}% confidence</span>}
      </div>
      {isLoading && <p className="mt-8 text-sm text-text-secondary">Loading source details...</p>}
      {isError && <p className="mt-8 text-sm text-danger">Unable to load source details.</p>}
      {source && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
          <div className="rounded-lg border border-border bg-surface p-5"><SatelliteContextViewer sourceId={source.id} /></div>
          <div className="rounded-lg border border-border bg-surface p-5"><NearbyFacilitiesTable sourceId={source.id} /></div>
        </div>
      )}
    </div>
  )
}
