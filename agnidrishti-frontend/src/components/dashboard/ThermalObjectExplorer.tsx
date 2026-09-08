import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useClassDistribution, useRecentFirms, useThermalObjects } from '../../services/dashboardService'
import { useFilterStore } from '../../stores/filterStore'
import { useSourceStore } from '../../stores/sourceStore'
import type { GasFlareLikelihood } from '../../types/dashboard'
import { ThermalMap } from '../map/ThermalMap'

const fieldClass = 'mt-1 w-full border-2 border-black dark:border-zinc-700 bg-surface px-3 py-2 text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-text-primary'
const flareOptions: GasFlareLikelihood[] = ['LIKELY', 'POSSIBLE', 'UNLIKELY']
const display = (value: string | number | null | undefined, suffix = '') => value == null || value === '' ? 'Not available' : `${value}${suffix}`

export function ThermalObjectExplorer() {
  const filters = useFilterStore()
  const classes = useClassDistribution()
  const query = useThermalObjects({ limit: filters.objectLimit, offset: filters.objectOffset, classification: filters.classification || undefined, source_hint: filters.temporalSource || undefined, gas_flare_likelihood: filters.gasFlareLikelihood, likely_only: filters.likelyFlaresOnly })
  const firms = useRecentFirms(500)
  const openPanel = useSourceStore((state) => state.openPanel)
  const objects = useMemo(() => query.data?.objects ?? [], [query.data?.objects])
  const sourceHints = useMemo(() => [...new Set(objects.map((object) => object.temporal_source_hint).filter(Boolean) as string[])].sort(), [objects])
  const total = query.data?.total ?? 0
  const canNext = filters.objectOffset + filters.objectLimit < total
  const reset = () => { filters.setClassification(''); filters.setTemporalSource(''); filters.setGasFlareLikelihood(''); filters.setLikelyFlaresOnly(false); filters.setObjectOffset(0) }

  return (
    <div className="space-y-4">
      <section className="border-2 border-text-primary bg-surface p-4" aria-label="Thermal object filters">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Industry classification
            <select className={fieldClass} value={filters.classification} onChange={(event) => { filters.setClassification(event.target.value); filters.setObjectOffset(0) }}><option value="">All classifications</option>{(classes.data?.classes ?? []).map((entry) => <option key={entry.label} value={entry.label}>{entry.label} ({entry.count})</option>)}</select>
          </label>
          <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Temporal source
            <select className={fieldClass} value={filters.temporalSource} onChange={(event) => { filters.setTemporalSource(event.target.value); filters.setObjectOffset(0) }}><option value="">All temporal sources</option>{sourceHints.map((hint) => <option key={hint} value={hint}>{hint}</option>)}</select>
          </label>
          <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Flare likelihood
            <select className={fieldClass} value={filters.gasFlareLikelihood} disabled={filters.likelyFlaresOnly} onChange={(event) => { filters.setGasFlareLikelihood(event.target.value as GasFlareLikelihood | ''); filters.setObjectOffset(0) }}><option value="">All assessments</option>{flareOptions.map((option) => <option key={option}>{option}</option>)}</select>
          </label>
          <label className="flex min-h-14 cursor-pointer items-center gap-2 border-2 border-black dark:border-zinc-700 px-3 text-xs font-black uppercase text-text-primary"><input type="checkbox" checked={filters.likelyFlaresOnly} onChange={(event) => { filters.setLikelyFlaresOnly(event.target.checked); filters.setObjectOffset(0) }} className="h-4 w-4 accent-red-600" /><Flame size={15} className="text-red-600" /> Likely gas flares only</label>
          <button type="button" onClick={reset} className="min-h-14 border-2 border-black bg-black px-4 text-xs font-black uppercase text-white dark:bg-[#d8f5a9] dark:text-black">Reset filters</button>
        </div>
        {classes.isError && <p className="mt-2 text-xs font-bold text-danger">Classification options are unavailable. You can still browse all objects.</p>}
      </section>

      <ThermalMap objects={objects} detections={firms.data?.detections ?? []} isLoading={query.isLoading || firms.isLoading} error={query.isError} onRetry={() => { void query.refetch(); void firms.refetch() }} />
      {firms.isError && <p className="text-xs font-bold text-warning">FIRMS detections could not be overlaid. Thermal objects remain available.</p>}

      <section className="overflow-hidden border-2 border-text-primary bg-surface" aria-labelledby="thermal-object-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-text-primary px-4 py-3"><div><h3 id="thermal-object-list-heading" className="text-sm font-black uppercase">Thermal object list</h3><p className="text-xs text-text-secondary">Showing {objects.length} on this page, {total} backend matches</p></div><label className="text-[10px] font-black uppercase text-text-secondary">Rows<select value={filters.objectLimit} onChange={(event) => { filters.setObjectLimit(Number(event.target.value)); filters.setObjectOffset(0) }} className="ml-2 border-2 border-black bg-surface p-1 text-xs text-text-primary"><option>25</option><option>50</option><option>100</option><option>500</option></select></label></div>
        {query.isLoading && <div className="space-y-2 p-4" role="status"><div className="h-9 animate-pulse bg-text-primary/10" /><div className="h-9 animate-pulse bg-text-primary/10" /><span className="sr-only">Loading thermal objects</span></div>}
        {query.isError && <div className="p-6 text-center"><p className="text-sm font-bold text-danger">Thermal objects could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white">Retry</button></div>}
        {!query.isLoading && !query.isError && objects.length === 0 && <div className="p-8 text-center"><p className="text-sm font-black uppercase">No objects match these filters</p><p className="mt-1 text-xs text-text-secondary">Clear one or more filters to broaden the result.</p><button type="button" onClick={reset} className="mt-3 border-2 border-black px-3 py-1.5 text-xs font-black uppercase">Clear filters</button></div>}
        {objects.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-black text-white dark:bg-zinc-800"><tr><th className="p-3">Object</th><th className="p-3">Classification</th><th className="p-3">Temporal source</th><th className="p-3">Flare assessment</th><th className="p-3">Temperature</th><th className="p-3">Coordinates</th></tr></thead><tbody className="divide-y divide-text-primary/15">{objects.map((object) => <tr key={object.object_uid} role="button" tabIndex={0} aria-label={`Open details for ${object.object_uid}`} onClick={() => openPanel(object.object_uid)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPanel(object.object_uid) } }} className="cursor-pointer hover:bg-bg/40 focus:bg-bg/40 focus:outline focus:outline-2 focus:outline-offset-[-2px]"><td className="p-3 font-mono font-black underline decoration-2 underline-offset-2">{object.object_uid}</td><td className="p-3">{display(object.classification_label)}<span className="block text-[10px] text-text-secondary">Confidence: {object.confidence == null ? 'Not available' : `${Math.round(object.confidence * 100)}%`}</span></td><td className="p-3">{display(object.temporal_source_hint)}</td><td className="p-3"><span className={`font-black ${object.gas_flare_likelihood === 'LIKELY' ? 'text-red-600' : object.gas_flare_likelihood === 'POSSIBLE' ? 'text-warning' : 'text-info'}`}>{display(object.gas_flare_likelihood)}</span><span className="block text-[10px] text-text-secondary">Score: {object.gas_flare_score == null ? 'Not available' : `${Math.round(object.gas_flare_score * 100)}%`}</span></td><td className="p-3">Mean {display(object.temp_mean, ' K')}<span className="block text-[10px] text-text-secondary">Max {display(object.temp_max, ' K')}</span></td><td className="p-3 font-mono">{object.latitude.toFixed(4)}, {object.longitude.toFixed(4)}</td></tr>)}</tbody></table></div>}
        <div className="flex items-center justify-between border-t-2 border-text-primary p-3"><button type="button" disabled={filters.objectOffset === 0} onClick={() => filters.setObjectOffset(Math.max(0, filters.objectOffset - filters.objectLimit))} className="inline-flex items-center gap-1 border-2 border-black px-3 py-1.5 text-xs font-black uppercase disabled:opacity-40"><ChevronLeft size={14} /> Previous</button><span className="font-mono text-xs font-bold">Offset {filters.objectOffset}</span><button type="button" disabled={!canNext} onClick={() => filters.setObjectOffset(filters.objectOffset + filters.objectLimit)} className="inline-flex items-center gap-1 border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white disabled:opacity-40">Next <ChevronRight size={14} /></button></div>
      </section>
    </div>
  )
}
