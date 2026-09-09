import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
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

type ThermalMapProps = {
  objects: ThermalObject[]
  detections: RecentFirmsDetection[]
  vnfDetections: VnfMapDetection[]
  datasetMode: MapDatasetMode
  isLoading: boolean
  error: boolean
  onRetry: () => void
}

export function ThermalMap({
  objects,
  detections,
  vnfDetections,
  datasetMode,
  isLoading,
  error,
  onRetry,
}: ThermalMapProps) {
  const [mapMode, setMapMode] = useState<MapMode>('carto')
  const tileUrl = mapMode === 'satellite' ? satelliteUrl : mapMode === 'osm' ? osmUrl : cartoLightUrl

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-surface" aria-label="Thermal objects map">
      <div className="relative">
        <MapContainer center={mapCenter} zoom={6} scrollWheelZoom preferCanvas className="h-[38rem] w-full" aria-label="Interactive thermal source map">
          <TileLayer key={tileUrl} url={tileUrl} attribution={mapMode === 'satellite' ? 'Tiles &copy; Esri' : mapMode === 'osm' ? '&copy; OpenStreetMap contributors' : '&copy; CARTO'} />
          {!isLoading && !error && <ClusteredMarkers objects={objects} detections={detections} vnfDetections={vnfDetections} />}
        </MapContainer>

        <div className="absolute right-3 top-3 z-[1000] flex rounded-lg border border-border bg-text-primary p-0.5" aria-label="Base map style">
        {(['carto', 'osm', 'satellite'] as MapMode[]).map((mode) => (
          <button key={mode} type="button" onClick={() => setMapMode(mode)} aria-pressed={mapMode === mode} className={`px-3 py-1 text-[10px] font-semibold ${mapMode === mode ? 'bg-accent text-text-primary' : 'text-white hover:bg-zinc-800'}`}>{mode}</button>
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
