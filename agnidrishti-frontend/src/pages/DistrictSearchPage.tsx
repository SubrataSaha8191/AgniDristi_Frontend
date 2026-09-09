import { useMemo } from 'react'
import { ArrowLeft, ChevronRight, Database, Factory, Flame, MapPin, Satellite } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useRecentFirms, useThermalObjects, useVnfDetections } from '../services/dashboardService'
import { useSourceStore } from '../stores/sourceStore'
import DetectionStreakTracker from '../components/DetectionStreakTracker'

const DISTRICT_ALIASES: Record<string, string> = {
  haldia: 'Purba Medinipur',
}

function canonicalDistrict(name: string) {
  return DISTRICT_ALIASES[name.trim().toLowerCase()] ?? name
}

function displayDate(value: string | null) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DistrictSearchPage() {
  const { districtName } = useParams<{ districtName: string }>()
  const decodedDistrict = districtName ? decodeURIComponent(districtName) : ''
  const backendDistrict = canonicalDistrict(decodedDistrict)
  const filters = useMemo(() => ({ district_name: backendDistrict }), [backendDistrict])
  const objectsQuery = useThermalObjects({ limit: 5000, offset: 0, ...filters })
  const vnfQuery = useVnfDetections('both', 1000, 0, true, filters)
  const firmsQuery = useRecentFirms(10_000, undefined, filters)
  const openPanel = useSourceStore((state) => state.openPanel)

  const objects = objectsQuery.data?.objects ?? []
  const detections = vnfQuery.data?.detections ?? []
  const loading = objectsQuery.isLoading || vnfQuery.isLoading || firmsQuery.isLoading
  const isError = objectsQuery.isError || vnfQuery.isError || firmsQuery.isError
  const aliasNote = backendDistrict !== decodedDistrict ? `Data mapped to ${backendDistrict} district` : null

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-accent"><ArrowLeft size={14} /> Dashboard</Link>
        <span aria-hidden="true">/</span><span>District search</span><span aria-hidden="true">/</span>
        <span className="font-semibold text-text-primary">{decodedDistrict}</span>
      </nav>

      <header className="border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-accent bg-accent/10 text-accent"><MapPin size={20} /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">District intelligence</p>
            <h1 className="mt-1 text-2xl font-semibold">{decodedDistrict}</h1>
            <p className="mt-1 text-xs leading-5 text-text-secondary">Thermal objects and satellite detections associated with this district.</p>
            {aliasNote && <p className="mt-1 text-[10px] font-semibold text-warning">{aliasNote}</p>}
          </div>
        </div>
      </header>

      <dl className="grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Factory size={13} /> Thermal objects</dt><dd className="mt-2 font-mono text-2xl font-semibold">{(objectsQuery.data?.total ?? 0).toLocaleString()}</dd></div>
        <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Database size={13} /> VNF detections</dt><dd className="mt-2 font-mono text-2xl font-semibold">{(vnfQuery.data?.total ?? 0).toLocaleString()}</dd></div>
        <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Satellite size={13} /> FIRMS detections</dt><dd className="mt-2 font-mono text-2xl font-semibold">{(firmsQuery.data?.count ?? 0).toLocaleString()}</dd></div>
      </dl>

      <DetectionStreakTracker scope={{ districtName: backendDistrict }} selectedSource="all" />

      {loading && <div className="space-y-2" role="status" aria-label="Loading district data"><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /></div>}
      {isError && <div className="border border-danger/50 bg-danger/5 p-8 text-center text-xs text-danger">District data could not be loaded. Check the API connection and try again.</div>}

      {!loading && !isError && <>
        <section aria-labelledby="district-objects">
          <h2 id="district-objects" className="mb-3 flex items-center gap-2 text-sm font-semibold"><Factory size={16} className="text-accent" /> Thermal objects ({objects.length})</h2>
          {objects.length === 0 ? <div className="border border-border bg-surface p-8 text-center text-xs text-text-secondary">No persistent thermal objects are currently mapped to this district.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {objects.map((object) => <article key={object.object_uid} className="flex flex-col justify-between border border-border bg-surface p-4 hover:border-accent">
              <div><p className="text-[10px] font-semibold uppercase text-accent">{object.industry_category?.replace('_', ' ') || 'other'}</p><h3 className="mt-2 text-sm font-semibold">{object.gem_facility_name || object.industry_name || object.classification_label || object.object_uid}</h3><p className="mt-1 text-xs text-text-secondary">{object.state_name || 'State unassigned'}</p></div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="font-mono text-[10px] text-text-secondary">{object.object_uid}</span><button type="button" onClick={() => openPanel(object.object_uid)} className="inline-flex items-center gap-1 border border-accent px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white">Investigate <ChevronRight size={14} /></button></div>
            </article>)}
          </div>}
        </section>

        <section aria-labelledby="district-vnf">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="district-vnf" className="flex items-center gap-2 text-sm font-semibold"><Flame size={16} className="text-accent" /> VNF detections</h2><span className="font-mono text-[10px] text-text-secondary">Showing {detections.length.toLocaleString()} of {(vnfQuery.data?.total ?? 0).toLocaleString()}</span></div>
          {detections.length === 0 ? <div className="border border-border bg-surface p-8 text-center text-xs text-text-secondary">No VNF detections are currently mapped to this district.</div> : <div className="max-h-[34rem] overflow-auto border border-border bg-surface">
            <table className="w-full min-w-[680px] border-collapse text-left text-xs"><thead className="sticky top-0 bg-bg text-[10px] uppercase text-text-secondary"><tr><th className="px-4 py-3">Detection</th><th className="px-4 py-3">Facility</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Temperature</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-border">
              {detections.map((detection) => <tr key={detection.id} className="hover:bg-accent/5"><td className="px-4 py-3 font-mono font-semibold">{detection.id_key || `VNF-${detection.id}`}</td><td className="px-4 py-3">{detection.gem_facility_name || detection.matched_object_uid || 'Unmatched'}</td><td className="px-4 py-3 uppercase">{(detection.industry_category || 'other').replace('_', ' ')}</td><td className="px-4 py-3 font-mono">{detection.temp_primary != null ? `${detection.temp_primary.toLocaleString()} K` : 'N/A'}</td><td className="px-4 py-3">{displayDate(detection.mscan_date)}</td></tr>)}
            </tbody></table>
          </div>}
        </section>
      </>}
    </div>
  )
}
