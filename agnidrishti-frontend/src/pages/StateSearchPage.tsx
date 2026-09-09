import { useMemo } from 'react'
import { ArrowLeft, Database, Flame, MapPin, Radio, Satellite } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { INDUSTRY_CATEGORIES, getIndustryCategory, type IndustryCategory } from '../lib/industryCategories'
import { useDetectionsByState, useRecentFirms, useThermalObjects, useVnfDetections } from '../services/dashboardService'
import DetectionStreakTracker from '../components/DetectionStreakTracker'
import type { RecentFirmsDetection, ThermalObject, VnfMapDetection } from '../types/dashboard'

type Dataset = 'vnf' | 'firms'
type CategoryFilter = 'all' | IndustryCategory

function samePlace(value: string | null | undefined, expected: string) {
  return (value ?? '').trim().localeCompare(expected.trim(), undefined, { sensitivity: 'accent' }) === 0
}

function displayDate(value: string | null) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function coordinate(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(4) : 'N/A'
}

function categoryForObject(object: ThermalObject | undefined) {
  return getIndustryCategory(object?.gem_industry_exact_type ?? object?.industry_name ?? object?.classification_label)
}

function StatePageSkeleton() {
  return <div className="space-y-2" role="status" aria-label="Loading detections"><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /></div>
}

export default function StateSearchPage() {
  const { stateName } = useParams<{ stateName: string }>()
  const decodedState = stateName ? decodeURIComponent(stateName) : ''
  const [searchParams, setSearchParams] = useSearchParams()
  const dataset: Dataset = searchParams.get('source') === 'firms' ? 'firms' : 'vnf'
  const requestedCategory = searchParams.get('category')
  const category: CategoryFilter = requestedCategory && INDUSTRY_CATEGORIES.some((item) => item.key === requestedCategory)
    ? requestedCategory as IndustryCategory
    : 'all'

  const stateFilter = useMemo(() => ({
    state_name: decodedState,
    ...(category === 'all' ? {} : { category }),
  }), [category, decodedState])
  const vnfQuery = useVnfDetections('both', 1000, 0, true, stateFilter)
  const firmsQuery = useRecentFirms(10_000, undefined, stateFilter)
  const objectsQuery = useThermalObjects({ limit: 5000, offset: 0, state_name: decodedState })
  const stateCountsQuery = useDetectionsByState()

  const objectById = useMemo(() => new Map((objectsQuery.data?.objects ?? []).map((object) => [object.object_uid, object])), [objectsQuery.data?.objects])
  const stateVnf = useMemo(() => (vnfQuery.data?.detections ?? []).filter((item) => samePlace(item.state_name, decodedState)), [decodedState, vnfQuery.data?.detections])
  const stateFirms = useMemo(() => (firmsQuery.data?.detections ?? []).filter((item) => samePlace(item.state_name, decodedState)), [decodedState, firmsQuery.data?.detections])

  const categoryForVnf = (item: VnfMapDetection) => item.industry_category ?? getIndustryCategory(item.gem_industry_exact_type)
  const categoryForFirms = (item: RecentFirmsDetection) => item.industry_category ?? categoryForObject(item.matched_object_uid ? objectById.get(item.matched_object_uid) : undefined)
  const filteredVnf = category === 'all' ? stateVnf : stateVnf.filter((item) => categoryForVnf(item) === category)
  const filteredFirms = category === 'all' ? stateFirms : stateFirms.filter((item) => categoryForFirms(item) === category)
  const currentRows = dataset === 'vnf' ? filteredVnf : filteredFirms
  const stateAggregate = stateCountsQuery.data?.states.find((item) => samePlace(item.state_name, decodedState))
  const loading = dataset === 'vnf' ? vnfQuery.isLoading : firmsQuery.isLoading || objectsQuery.isLoading
  const isError = dataset === 'vnf' ? vnfQuery.isError : firmsQuery.isError || objectsQuery.isError

  const updateFilters = (next: { source?: Dataset; category?: CategoryFilter }) => {
    const params = new URLSearchParams(searchParams)
    if (next.source) params.set('source', next.source)
    if (next.category) {
      if (next.category === 'all') params.delete('category')
      else params.set('category', next.category)
    }
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-accent"><ArrowLeft size={14} /> Dashboard</Link>
        <span aria-hidden="true">/</span><span>State detections</span><span aria-hidden="true">/</span>
        <span className="font-semibold text-text-primary">{decodedState}</span>
      </nav>

      <header className="border-b border-border pb-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"><MapPin size={13} /> State intelligence</div>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">{decodedState} detections</h1>
            <p className="mt-1 text-xs leading-5 text-text-secondary">Inspect VNF evidence or recent FIRMS monitoring hits, then isolate an industrial category. Counts reflect records returned by the current data feeds.</p>
          </div>
          <dl className="grid min-w-[20rem] grid-cols-3 border border-border bg-surface text-center">
            <div className="p-3"><dt className="text-[9px] uppercase text-text-secondary">VNF indexed</dt><dd className="mt-1 font-mono text-lg font-semibold">{stateAggregate?.vnf_detection_count.toLocaleString() ?? stateVnf.length.toLocaleString()}</dd></div>
            <div className="border-x border-border p-3"><dt className="text-[9px] uppercase text-text-secondary">FIRMS indexed</dt><dd className="mt-1 font-mono text-lg font-semibold">{stateAggregate?.firms_detection_count.toLocaleString() ?? stateFirms.length.toLocaleString()}</dd></div>
            <div className="p-3"><dt className="text-[9px] uppercase text-text-secondary">Shown</dt><dd className="mt-1 font-mono text-lg font-semibold text-accent">{currentRows.length.toLocaleString()}</dd></div>
          </dl>
        </div>
      </header>

      <section aria-labelledby="detection-filters" className="border border-border bg-surface p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="detection-filters" className="text-xs font-semibold">Detection source</h2>
            <div className="mt-2 inline-flex border border-border bg-bg p-1" role="group" aria-label="Detection source">
              <button type="button" aria-pressed={dataset === 'vnf'} onClick={() => updateFilters({ source: 'vnf' })} className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold ${dataset === 'vnf' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}><Database size={14} /> VNF <span className="font-mono">{vnfQuery.data?.total ?? 0}</span></button>
              <button type="button" aria-pressed={dataset === 'firms'} onClick={() => updateFilters({ source: 'firms' })} className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold ${dataset === 'firms' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}><Satellite size={14} /> FIRMS <span className="font-mono">{firmsQuery.data?.count ?? 0}</span></button>
            </div>
          </div>
          <div className="lg:text-right">
            <h2 className="text-xs font-semibold">Industry category</h2>
            <div className="mt-2 flex flex-wrap gap-2 lg:justify-end" role="group" aria-label="Industry category">
              <button type="button" aria-pressed={category === 'all'} onClick={() => updateFilters({ category: 'all' })} className={`border px-3 py-1.5 text-[11px] font-semibold ${category === 'all' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent'}`}>All</button>
              {INDUSTRY_CATEGORIES.map((item) => <button key={item.key} type="button" aria-pressed={category === item.key} onClick={() => updateFilters({ category: item.key })} className={`border px-3 py-1.5 text-[11px] font-semibold ${category === item.key ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent'}`}>{item.label}</button>)}
            </div>
          </div>
        </div>
      </section>

      <DetectionStreakTracker scope={{ stateName: decodedState }} selectedSource={dataset} />

      <section aria-labelledby="detection-results">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="detection-results" className="flex items-center gap-2 text-sm font-semibold"><Flame size={16} className="text-accent" /> {dataset.toUpperCase()} detections in {decodedState}</h2>
          <span className="font-mono text-[10px] text-text-secondary">{category === 'all' ? 'ALL CATEGORIES' : category.replace('_', ' ').toUpperCase()}</span>
        </div>

        {loading && <StatePageSkeleton />}
        {isError && <div className="border border-danger/50 bg-danger/5 p-8 text-center text-xs text-danger">The {dataset.toUpperCase()} feed could not be loaded. Check the API connection and try again.</div>}
        {!loading && !isError && currentRows.length === 0 && <div className="border border-border bg-surface p-10 text-center"><Radio className="mx-auto text-text-secondary" size={22} /><p className="mt-3 text-sm font-semibold">No matching detections</p><p className="mt-1 text-xs text-text-secondary">No {dataset.toUpperCase()} records in {decodedState} match this category.</p></div>}

        {!loading && !isError && currentRows.length > 0 && (
          <div className="overflow-x-auto border border-border bg-surface">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="bg-bg text-[10px] uppercase tracking-wider text-text-secondary"><tr><th className="px-4 py-3 font-semibold">Detection</th><th className="px-4 py-3 font-semibold">District</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Coordinates</th><th className="px-4 py-3 font-semibold">Thermal signal</th><th className="px-4 py-3 font-semibold">Date</th></tr></thead>
              <tbody className="divide-y divide-border">
                {dataset === 'vnf' ? filteredVnf.map((row) => (
                  <tr key={`vnf-${row.id}`} className="hover:bg-accent/5"><td className="px-4 py-3"><span className="font-mono font-semibold">{row.id_key || `VNF-${row.id}`}</span><span className="mt-1 block text-[10px] text-text-secondary">{row.sensor || 'VNF sensor'} · {row.vnf_type || 'untyped'}</span></td><td className="px-4 py-3">{row.district_name || 'Unassigned'}</td><td className="px-4 py-3"><span className="border border-border bg-bg px-2 py-1 text-[10px] font-semibold uppercase">{getIndustryCategory(row.gem_industry_exact_type).replace('_', ' ')}</span></td><td className="px-4 py-3 font-mono text-[11px]">{coordinate(row.latitude)}, {coordinate(row.longitude)}</td><td className="px-4 py-3 font-mono">{row.temp_primary != null ? `${row.temp_primary.toLocaleString()} K` : 'N/A'}</td><td className="px-4 py-3">{displayDate(row.mscan_date)}</td></tr>
                )) : filteredFirms.map((row) => {
                  const matchedObject = row.matched_object_uid ? objectById.get(row.matched_object_uid) : undefined
                  return <tr key={row.firms_uid} className="hover:bg-accent/5"><td className="px-4 py-3"><span className="font-mono font-semibold">{row.firms_uid}</span><span className="mt-1 block text-[10px] text-text-secondary">{row.satellite || 'Satellite'} · {row.known_source ? 'known source' : 'unmatched'}</span></td><td className="px-4 py-3">{row.district_name || 'Unassigned'}</td><td className="px-4 py-3"><span className="border border-border bg-bg px-2 py-1 text-[10px] font-semibold uppercase">{categoryForObject(matchedObject).replace('_', ' ')}</span></td><td className="px-4 py-3 font-mono text-[11px]">{coordinate(row.latitude)}, {coordinate(row.longitude)}</td><td className="px-4 py-3 font-mono">{row.frp != null ? `${row.frp.toLocaleString()} MW` : 'N/A'}</td><td className="px-4 py-3">{displayDate(row.acq_date)}</td></tr>
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
