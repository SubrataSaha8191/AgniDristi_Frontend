import { useMemo } from 'react'
import { ArrowLeft, BarChart3, Building2, ChevronRight, Database, MapPin, Satellite } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { INDUSTRY_CATEGORIES, getIndustryCategory, getIndustryLabel, getIndustryRoute, resolveIndustryCategory } from '../lib/industryCategories'
import { useAllVnfDetections, useRecentFirms, useThermalObjects } from '../services/dashboardService'

interface StateIndustryStat {
  state: string
  vnf: number
  firms: number
  facilities: number
}

export default function IndustrySearchPage() {
  const { industryType } = useParams<{ industryType: string }>()
  const category = resolveIndustryCategory(industryType ? decodeURIComponent(industryType) : 'other')
  const label = getIndustryLabel(category)
  const vnfQuery = useAllVnfDetections('both')
  const firmsQuery = useRecentFirms(10_000)
  const objectsQuery = useThermalObjects({ limit: 5000, offset: 0 })

  const analytics = useMemo(() => {
    const objects = objectsQuery.data?.objects ?? []
    const matchingObjects = objects.filter((object) => getIndustryCategory(object.gem_industry_exact_type ?? object.industry_name ?? object.classification_label) === category)
    const objectById = new Map(objects.map((object) => [object.object_uid, object]))
    const vnf = (vnfQuery.data?.detections ?? []).filter((row) => getIndustryCategory(row.gem_industry_exact_type) === category)
    const firms = (firmsQuery.data?.detections ?? []).filter((row) => {
      const object = row.matched_object_uid ? objectById.get(row.matched_object_uid) : undefined
      return getIndustryCategory(object?.gem_industry_exact_type ?? object?.industry_name ?? object?.classification_label) === category
    })
    const byState = new Map<string, StateIndustryStat>()
    const getState = (name: string | null | undefined) => {
      const state = name?.trim() || 'Unassigned'
      const entry = byState.get(state) ?? { state, vnf: 0, firms: 0, facilities: 0 }
      byState.set(state, entry)
      return entry
    }
    vnf.forEach((row) => { getState(row.state_name).vnf += 1 })
    firms.forEach((row) => { getState(row.state_name).firms += 1 })
    matchingObjects.forEach((row) => { getState(row.state_name).facilities += 1 })
    return {
      vnf,
      firms,
      matchingObjects,
      states: Array.from(byState.values()).sort((a, b) => (b.vnf + b.firms) - (a.vnf + a.firms) || a.state.localeCompare(b.state)),
    }
  }, [category, firmsQuery.data?.detections, objectsQuery.data?.objects, vnfQuery.data?.detections])

  const loading = vnfQuery.isLoading || firmsQuery.isLoading || objectsQuery.isLoading
  const isError = vnfQuery.isError || firmsQuery.isError || objectsQuery.isError

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-accent"><ArrowLeft size={14} /> Dashboard</Link>
        <span aria-hidden="true">/</span><span>Industry statistics</span><span aria-hidden="true">/</span><span className="font-semibold text-text-primary">{label}</span>
      </nav>

      <header className="border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-accent bg-accent/10 text-accent"><Building2 size={20} /></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Industry intelligence</p><h1 className="mt-1 text-2xl font-semibold">{label} statistics</h1><p className="mt-1 text-xs leading-5 text-text-secondary">Detection volume and known facility coverage by state.</p></div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Industry categories">
        {INDUSTRY_CATEGORIES.map((item) => <Link key={item.key} to={getIndustryRoute(item.key)} aria-current={item.key === category ? 'page' : undefined} className={`border px-3 py-2 text-xs font-semibold ${item.key === category ? 'border-accent bg-accent text-white' : 'border-border bg-surface text-text-secondary hover:border-accent hover:text-text-primary'}`}>{item.label}</Link>)}
      </div>

      {loading && <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading industry statistics">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse bg-surface" />)}</div>}
      {isError && <div className="border border-danger/50 bg-danger/5 p-8 text-center text-xs text-danger">Industry statistics could not be loaded. Check the API connection and try again.</div>}

      {!loading && !isError && (
        <>
          <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Database size={13} /> VNF detections</dt><dd className="mt-2 font-mono text-2xl font-semibold">{analytics.vnf.length.toLocaleString()}</dd></div>
            <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Satellite size={13} /> FIRMS matches</dt><dd className="mt-2 font-mono text-2xl font-semibold">{analytics.firms.length.toLocaleString()}</dd></div>
            <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><Building2 size={13} /> Known facilities</dt><dd className="mt-2 font-mono text-2xl font-semibold">{analytics.matchingObjects.length.toLocaleString()}</dd></div>
            <div className="bg-surface p-4"><dt className="flex items-center gap-2 text-[10px] uppercase text-text-secondary"><MapPin size={13} /> States represented</dt><dd className="mt-2 font-mono text-2xl font-semibold text-accent">{analytics.states.filter((item) => item.state !== 'Unassigned').length.toLocaleString()}</dd></div>
          </dl>

          <section aria-labelledby="state-breakdown">
            <div className="mb-3 flex items-center justify-between"><h2 id="state-breakdown" className="flex items-center gap-2 text-sm font-semibold"><BarChart3 size={16} className="text-accent" /> State breakdown</h2><span className="font-mono text-[10px] text-text-secondary">VNF + FIRMS</span></div>
            {analytics.states.length === 0 ? (
              <div className="border border-border bg-surface p-10 text-center"><p className="text-sm font-semibold">No {label.toLowerCase()} records found</p><p className="mt-1 text-xs text-text-secondary">The current feeds do not contain a record mapped to this category.</p></div>
            ) : (
              <div className="overflow-x-auto border border-border bg-surface">
                <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                  <thead className="bg-bg text-[10px] uppercase tracking-wider text-text-secondary"><tr><th className="px-4 py-3 font-semibold">State</th><th className="px-4 py-3 text-right font-semibold">VNF</th><th className="px-4 py-3 text-right font-semibold">FIRMS</th><th className="px-4 py-3 text-right font-semibold">Facilities</th><th className="px-4 py-3 text-right font-semibold">Total detections</th><th className="px-4 py-3"><span className="sr-only">Open state</span></th></tr></thead>
                  <tbody className="divide-y divide-border">{analytics.states.map((item) => <tr key={item.state} className="hover:bg-accent/5"><td className="px-4 py-3 font-semibold">{item.state}</td><td className="px-4 py-3 text-right font-mono">{item.vnf.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono">{item.firms.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono">{item.facilities.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono font-semibold">{(item.vnf + item.firms).toLocaleString()}</td><td className="px-4 py-3 text-right">{item.state !== 'Unassigned' && <Link to={`/state/${encodeURIComponent(item.state)}?source=vnf&category=${category}`} className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">View <ChevronRight size={13} /></Link>}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
