import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapDatasetMode } from '../../pages/DashboardPage'
import type { RecentFirmsDetection, ThermalObject, VnfMapDetection } from '../../types/dashboard'
import { ClusteredMarkers } from './ClusteredMarkers'

type MapMode = 'carto' | 'osm' | 'satellite'
const mapCenter: [number, number] = [24.15, 87.6]
const cartoKey = import.meta.env.VITE_CARTO_API_KEY || ''
const keyQuery = cartoKey ? `?key=${cartoKey}` : ''
const cartoLightUrl = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${keyQuery}`
const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

function ResizeHandler() {
  const map = useMap()
  useEffect(() => {
    const triggerResize = () => {
      map.invalidateSize({ animate: false })
    }

    triggerResize()
    const timer1 = setTimeout(triggerResize, 100)
    const timer2 = setTimeout(triggerResize, 350)
    const timer3 = setTimeout(triggerResize, 800)

    let observer: ResizeObserver | null = null
    const container = map.getContainer()
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        triggerResize()
      })
      observer.observe(container)
    }

    window.addEventListener('resize', triggerResize)

    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', triggerResize)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [map])
  return null
}

type ThermalMapProps = {
  objects: ThermalObject[]
  detections: RecentFirmsDetection[]
  vnfDetections: VnfMapDetection[]
  datasetMode: MapDatasetMode
  isLoading: boolean
  error: boolean
  onRetry: () => void
  className?: string
  heightClass?: string
}

export function ThermalMap({
  objects,
  detections,
  vnfDetections,
  datasetMode,
  isLoading,
  error,
  onRetry,
  className = '',
  heightClass = 'h-[22rem] sm:h-[24rem]',
}: ThermalMapProps) {
  const [mapMode, setMapMode] = useState<MapMode>('carto')
  const tileUrl = mapMode === 'satellite' ? satelliteUrl : mapMode === 'osm' ? osmUrl : cartoLightUrl

  return (
    <section className={`relative overflow-hidden rounded-lg border border-border bg-surface ${className}`} aria-label="Thermal objects map">
      <div className="relative h-full w-full flex flex-col flex-1 min-h-0">
        <MapContainer
          center={mapCenter}
          zoom={6}
          scrollWheelZoom
          preferCanvas
          style={{ height: '100%', width: '100%', minHeight: '100%' }}
          className={`${heightClass} w-full flex-1 !h-full`}
          aria-label="Interactive thermal source map"
        >
          <ResizeHandler />
          <TileLayer key={tileUrl} url={tileUrl} attribution={mapMode === 'satellite' ? 'Tiles &copy; Esri' : mapMode === 'osm' ? '&copy; OpenStreetMap contributors' : '&copy; CARTO'} />
          {!isLoading && !error && <ClusteredMarkers objects={objects} detections={detections} vnfDetections={vnfDetections} />}
        </MapContainer>

        <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-md" aria-label="Base map style">
          {(['carto', 'osm', 'satellite'] as MapMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapMode(mode)}
              aria-pressed={mapMode === mode}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors rounded-md cursor-pointer ${
                mapMode === mode
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-primary hover:bg-bg hover:text-accent'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="absolute bottom-3 left-3 z-[1000] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface p-2 text-[10px] font-medium text-text-primary">
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-600" />Oil &amp; Gas</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-orange-600" />Metallurgical</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-purple-600" />Mining &amp; Extraction</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />Other Industrial</span>
        {datasetMode === 'firms' && <span><i className="mr-1 inline-block h-2.5 w-2.5 bg-cyan-600" />Persistent FIRMS</span>}
        {datasetMode === 'vnf' && vnfDetections.length > 0 && <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-400" />Transient VNF point</span>}
        </div>

        {isLoading && <div className="absolute inset-0 z-[1001] grid place-items-center bg-surface/75"><p role="status" className="rounded-lg border border-border bg-surface p-4 text-xs font-semibold">Loading thermal objects...</p></div>}
        {error && <div className="absolute inset-0 z-[1001] grid place-items-center bg-surface/85"><div className="rounded-lg border border-border bg-surface p-5 text-center"><p className="text-xs font-bold text-danger">Thermal data could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-border bg-accent px-3 py-1.5 text-xs font-semibold text-text-primary">Retry</button></div></div>}
        {!isLoading && !error && objects.length + detections.length + vnfDetections.length === 0 && <div className="pointer-events-none absolute inset-0 z-[999] grid place-items-center"><p className="rounded-lg border border-border bg-surface p-4 text-xs font-semibold">No records match these filters</p></div>}
      </div>
    </section>
  )
}
