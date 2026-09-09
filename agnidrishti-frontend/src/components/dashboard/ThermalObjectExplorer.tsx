import { type ReactNode, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Database, Flame, Radar, Target, X } from 'lucide-react'
import { useDashboardMap, useThermalObjects } from '../../services/dashboardService'
import { useFilterStore } from '../../stores/filterStore'
import { useSourceStore } from '../../stores/sourceStore'
import type { MapDatasetMode } from '../../pages/DashboardPage'
import { ThermalMap } from '../map/ThermalMap'
import { ActivityTimelineChart } from '../charts/ActivityTimelineChart'
import { ThermalFingerprintChart } from '../charts/ThermalFingerprintChart'
import { AnomalyDetectionChart } from '../charts/AnomalyDetectionChart'

const display = (value: string | number | null | undefined, suffix = '') => value == null || value === '' ? 'Not available' : `${value}${suffix}`
const isLikelyFlare = (object: { gas_flare_likelihood?: string | null }) => object.gas_flare_likelihood === 'LIKELY'

type ThermalObjectExplorerProps = {
  requestedDate: string | null
  selectedDate: string | null
  datasetMode: MapDatasetMode
  onDatasetModeChange: (mode: MapDatasetMode) => void
  mapAside?: ReactNode
  belowMap?: ReactNode
}

export function ThermalObjectExplorer({ requestedDate, selectedDate, datasetMode, onDatasetModeChange, mapAside, belowMap }: ThermalObjectExplorerProps) {
  const filters = useFilterStore()
  const openPanel = useSourceStore((state) => state.openPanel)
  const closePanel = useSourceStore((state) => state.closePanel)
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)
  const mapQuery = useDashboardMap(requestedDate, 'all', 0)
  const persistentObjectsQuery = useThermalObjects({ limit: 5_000, offset: 0, gas_flare_only: filters.likelyFlaresOnly })
  const mapData = mapQuery.data
  const allKnownObjects = useMemo(() => mapData?.objects ?? [], [mapData?.objects])
  const persistentFirms = useMemo(
    () => mapQuery.isPlaceholderData
      ? []
      : (mapData?.firms ?? []).filter((detection) => detection.known_source === true && Boolean(detection.matched_object_uid)),
    [mapData?.firms, mapQuery.isPlaceholderData],
  )
  const associatedObjectUids = useMemo(
    () => new Set(persistentFirms.map((detection) => detection.matched_object_uid)),
    [persistentFirms],
  )
  const vnfObjects = useMemo(
    () => persistentObjectsQuery.isPlaceholderData ? [] : persistentObjectsQuery.data?.objects ?? [],
    [persistentObjectsQuery.data?.objects, persistentObjectsQuery.isPlaceholderData],
  )
  const visibleObjects = useMemo(
    () => {
      const vnfFallbackObjects = vnfObjects.length > 0 ? vnfObjects : allKnownObjects
      const objects = datasetMode === 'firms' ? allKnownObjects.filter((object) => associatedObjectUids.has(object.object_uid)) : vnfFallbackObjects
      if (!filters.likelyFlaresOnly) return objects
      return objects.filter(isLikelyFlare)
    },
    [allKnownObjects, associatedObjectUids, datasetMode, filters.likelyFlaresOnly, vnfObjects],
  )
  const classificationOptions = useMemo(() => {
    const counts = new Map<string, number>()
    visibleObjects.forEach((object) => {
      const label = (object.classification_label || object.industry_name || 'Unknown').trim() || 'Unknown'
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => left.label.localeCompare(right.label))
  }, [visibleObjects])
  const allObjects = useMemo(() => {
    const requestedClassification = filters.classification.trim().toLocaleLowerCase()
    return visibleObjects.filter((object) => {
      if (!requestedClassification) return true
      const objectClassification = (object.classification_label || object.industry_name || 'Unknown').trim().toLocaleLowerCase()
      return objectClassification === requestedClassification
    })
  }, [visibleObjects, filters.classification])
  const objects = useMemo(() => allObjects.slice(filters.objectOffset, filters.objectOffset + filters.objectLimit), [allObjects, filters.objectOffset, filters.objectLimit])
  const filteredObjectUids = useMemo(() => new Set(allObjects.map((object) => object.object_uid)), [allObjects])
  const mapFirms = useMemo(
    () => persistentFirms.filter((detection) => detection.matched_object_uid && filteredObjectUids.has(detection.matched_object_uid)),
    [filteredObjectUids, persistentFirms],
  )
  const total = allObjects.length
  const canNext = filters.objectOffset + filters.objectLimit < total
  const activeLoading = datasetMode === 'vnf' ? persistentObjectsQuery.isLoading && vnfObjects.length === 0 && allKnownObjects.length === 0 : mapQuery.isLoading
  const activeError = datasetMode === 'vnf' ? persistentObjectsQuery.isError : mapQuery.isError
  const reset = () => { filters.reset(); onDatasetModeChange('firms') }

  return (
    <div className="space-y-4">
      <section className="p-4 border rounded-lg border-border bg-surface" aria-label="Thermal object filters">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-[10px] font-semibold text-text-secondary">Industry classification
            <select className="w-full px-3 py-2 mt-1 text-xs font-bold border rounded-lg outline-none border-border bg-surface text-text-primary focus:ring-2 focus:ring-text-primary" value={filters.classification} onChange={(event) => { filters.setClassification(event.target.value); filters.setObjectOffset(0) }}><option value="">All classifications</option>{classificationOptions.map((entry) => <option key={entry.label} value={entry.label}>{entry.label} ({entry.count})</option>)}</select>
          </label>
          <label className="flex items-center justify-center gap-2 px-3 text-xs font-semibold border rounded-lg cursor-pointer min-h-14 border-border bg-surface text-text-primary hover:bg-accent hover:text-text-primary">
            <input
              type="checkbox"
              checked={filters.likelyFlaresOnly}
              onChange={(event) => { filters.setLikelyFlaresOnly(event.target.checked); filters.setObjectOffset(0) }}
              className="w-4 h-4 accent-black"
            />
            <Flame size={15} />
            Likely gas flares only
          </label>
          <button type="button" aria-pressed={datasetMode === 'vnf'} onClick={() => { onDatasetModeChange(datasetMode === 'firms' ? 'vnf' : 'firms'); filters.setObjectOffset(0) }} className="flex items-center justify-center gap-2 px-3 text-xs font-semibold border cursor-pointer rounde-lg min-h-14 border-surface-reverse bg-surface text-text-primary hover:bg-accent hover:text-text-primary">
            {datasetMode === 'firms' ? <Database size={15} /> : <Radar size={15} />}{datasetMode === 'firms' ? 'View VNF data' : `View FIRMS for ${selectedDate ?? 'selected date'}`}</button>
          <button type="button" onClick={reset} className="px-4 text-xs font-semibold transition-colors border rounded-lg cursor-pointer min-h-14 border-border bg-accent text-text-primary hover:bg-accent/80">Reset filters</button>
        </div>
      </section>

      {/* Map and Side Analytics Panel Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 ${selectedSourceId ? 'items-stretch' : 'items-start'}`}>
        {/* Left Side: Map Container */}
        <div className="flex flex-col w-full h-full min-w-0">
          <ThermalMap
            objects={allObjects}
            detections={datasetMode === 'firms' ? mapFirms : []}
            vnfDetections={[]}
            datasetMode={datasetMode}
            isLoading={activeLoading}
            error={activeError}
            className="flex flex-col h-full"
            heightClass={selectedSourceId ? "h-full min-h-[36rem] lg:min-h-[46rem]" : "h-[22rem] sm:h-[24rem]"}
            onRetry={() => { void mapQuery.refetch(); if (datasetMode === 'vnf') void persistentObjectsQuery.refetch() }}
          />
        </div>

        {/* Right Side: Vertically Stacked Analytics Panel */}
        <aside aria-label="Thermal source analytics" className="flex flex-col justify-between w-full min-w-0">
          {selectedSourceId ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm border-border bg-surface shrink-0">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Selected Target Point</span>
                  <span className="block font-mono text-xs font-bold truncate text-text-primary" title={selectedSourceId}>
                    {selectedSourceId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => closePanel()}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 border border-border bg-accent text-white hover:opacity-90 cursor-pointer shrink-0 rounded-lg"
                >
                  <X size={14} /> DESELECT
                </button>
              </div>

              {/* Vertically Stacked Analytics Charts */}
              <div className="flex-1 space-y-4">
                <div className="p-4 border rounded-lg shadow-sm border-border bg-surface">
                  <ActivityTimelineChart sourceId={selectedSourceId} />
                </div>
                <div className="p-4 border rounded-lg shadow-sm border-border bg-surface">
                  <ThermalFingerprintChart sourceId={selectedSourceId} />
                </div>
                <div className="p-4 border rounded-lg shadow-sm border-border bg-surface">
                  <AnomalyDetectionChart sourceId={selectedSourceId} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface h-[24rem]">
              <div className="grid w-12 h-12 mb-3 rounded-full place-items-center bg-accent/15 text-accent">
                <Target size={24} />
              </div>
              <h3 className="text-sm font-bold tracking-wide uppercase text-text-primary">No Point Selected</h3>
              <p className="mt-1.5 text-xs text-text-secondary max-w-xs leading-relaxed">
                Click any thermal object or FIRMS detection marker on the map to inspect its historical activity timeline, thermal fingerprint, and anomaly telemetry.
              </p>
            </div>
          )}
          {mapAside}
        </aside>
      </div>

      {belowMap}

      <section className="overflow-hidden border rounded-lg border-border bg-surface" aria-labelledby="thermal-object-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border"><div><h3 id="thermal-object-list-heading" className="text-sm font-semibold">Thermal object list</h3><p className="text-xs text-text-secondary">Showing {objects.length} on this page, {total} spatial matches</p></div><label className="text-[10px] font-semibold text-text-secondary">Rows<select value={filters.objectLimit} onChange={(event) => { filters.setObjectLimit(Number(event.target.value)); filters.setObjectOffset(0) }} className="p-1 ml-2 text-xs border rounded-lg border-border bg-surface text-text-primary"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label></div>
        {activeLoading && <div className="p-4 space-y-2" role="status"><div className="h-9 animate-pulse bg-text-primary/10" /><div className="h-9 animate-pulse bg-text-primary/10" /><span className="sr-only">Loading thermal objects</span></div>}
        {activeError && <div className="p-6 text-center"><p className="text-sm font-bold text-danger">{datasetMode === 'vnf' ? 'Persistent clusters could not be loaded.' : 'Thermal objects could not be loaded.'}</p><button type="button" onClick={() => { if (datasetMode === 'vnf') void persistentObjectsQuery.refetch(); else void mapQuery.refetch() }} className="mt-3 rounded-lg border border-border bg-accent px-3 py-1.5 text-xs font-semibold text-text-primary">Retry</button></div>}
        {!activeLoading && !activeError && objects.length === 0 && <div className="p-8 text-center"><p className="text-sm font-semibold">No objects match these filters</p><p className="mt-1 text-xs text-text-secondary">Clear one or more filters to broaden the result.</p><button type="button" onClick={reset} className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Clear filters</button></div>}
        {objects.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="text-text-primary bg-accent"><tr><th className="p-3">Object / Facility</th><th className="p-3">Classification</th><th className="p-3">Temporal source</th><th className="p-3">Flare assessment</th><th className="p-3">Temperature</th><th className="p-3">Coordinates</th></tr></thead><tbody className="divide-y divide-text-primary/15">{objects.map((object) => { const objName = object.gem_facility_name || object.gem_industry_exact_type || object.industry_name || (object.classification_label ? `${object.classification_label.replaceAll('_', ' ')} Facility` : null) || object.object_uid; return <tr key={object.object_uid} role="button" tabIndex={0} aria-label={`Open details for ${object.object_uid}`} onClick={() => openPanel(object.object_uid)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPanel(object.object_uid) } }} className="cursor-pointer hover:bg-bg/40 focus:bg-bg/40 focus:outline focus:outline-2 focus:outline-offset-[-2px]"><td className="p-3"><span className="block font-sans font-semibold underline text-text-primary decoration-2 underline-offset-2">{objName}</span><span className="font-mono text-[10px] text-text-secondary font-bold">{object.object_uid}</span></td><td className="p-3">{display(object.classification_label)}<span className="block text-[10px] text-text-secondary">Confidence: {object.confidence == null ? 'Not available' : `${Math.round(object.confidence * 100)}%`}</span></td><td className="p-3">{display(object.temporal_source_hint)}</td><td className="p-3"><span className={`font-semibold ${object.gas_flare_likelihood === 'LIKELY' ? 'text-red-600' : object.gas_flare_likelihood === 'POSSIBLE' ? 'text-warning' : 'text-info'}`}>{display(object.gas_flare_likelihood)}</span><span className="block text-[10px] text-text-secondary">Score: {object.gas_flare_score == null ? 'Not available' : `${Math.round(object.gas_flare_score * 100)}%`}</span></td><td className="p-3">Mean {display(object.temp_mean, ' K')}<span className="block text-[10px] text-text-secondary">Max {display(object.temp_max, ' K')}</span></td><td className="p-3 font-mono">{object.latitude.toFixed(4)}, {object.longitude.toFixed(4)}</td></tr> })}</tbody></table></div>}
        <div className="flex items-center justify-between p-3 border border-border"><button type="button" disabled={filters.objectOffset === 0} onClick={() => filters.setObjectOffset(Math.max(0, filters.objectOffset - filters.objectLimit))} className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary disabled:opacity-40 cursor-pointer transition-colors hover:bg-accent"><ChevronLeft size={14} /> Previous</button><span className="font-mono text-xs font-bold">Page {Math.floor(filters.objectOffset / filters.objectLimit) + 1} of {Math.ceil(total / filters.objectLimit) || 1} ({total === 0 ? 0 : filters.objectOffset + 1}–{Math.min(total, filters.objectOffset + filters.objectLimit)} of {total})</span><button type="button" disabled={!canNext} onClick={() => filters.setObjectOffset(filters.objectOffset + filters.objectLimit)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-accent px-3 py-1.5 text-xs font-semibold text-text-primary disabled:opacity-40 cursor-pointer transition-colors hover:bg-accent/80">Next <ChevronRight size={14} /></button></div>
      </section>
    </div>
  )
}
