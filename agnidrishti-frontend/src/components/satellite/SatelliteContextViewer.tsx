import { Layers3, Satellite, Thermometer } from 'lucide-react'
import { useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet'
import { useSourceDetail } from '../../services/sourceService'
import { MapSearchControl } from '../map/MapSearchControl'

const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export function SatelliteContextViewer({ sourceId }: { sourceId?: string }) {
  const [showThermalOverlay, setShowThermalOverlay] = useState(true)
  const { data: source } = useSourceDetail(sourceId ?? null)
  const center: [number, number] = source ? [source.lat, source.lon] : [24.15, 87.6]

  return (
    <section aria-labelledby="satellite-context-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="satellite-context-heading" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Satellite size={16} aria-hidden="true" />
            Satellite Context Imagery
          </h3>
          <p className="mt-1 text-xs font-semibold text-text-secondary">High-resolution satellite view centered on {sourceId ?? 'selected source'}</p>
        </div>
          <span className="rounded-lg border border-border bg-accent px-2 py-0.5 text-[10px] font-semibold text-text-primary">Live Telemetry</span>
      </div>

      <div className="relative mt-4 h-64 w-full overflow-hidden rounded-lg border border-border bg-text-primary">
        <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer url={satelliteTileUrl} attribution="&copy; Esri World Imagery" />
          <MapSearchControl position="right" />
          <Marker position={center} />
          {showThermalOverlay && <Circle center={center} radius={550} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.35, weight: 2 }} />}
        </MapContainer>
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 border border-border bg-text-primary/90 px-2 py-1 font-mono text-[10px] text-white">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          {sourceId ?? 'Thermal Object'}
        </div>
        <div className="absolute bottom-3 left-3 z-[1000] border border-border bg-text-primary/90 px-2 py-1 font-mono text-[10px] text-white">
          {source ? `${source.lat.toFixed(4)}° N, ${source.lon.toFixed(4)}° E · 550m Radius` : 'N ↑ · 500 m'}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 font-mono text-xs text-text-secondary"><Layers3 size={14} aria-hidden="true" /> Sentinel-2 / Landsat-9 Telemetry</p>
        <button
          type="button"
          onClick={() => setShowThermalOverlay((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-accent hover:text-text-primary transition-colors"
        >
          <Thermometer size={14} aria-hidden="true" />
          {showThermalOverlay ? 'Hide Thermal Circle' : 'Show Thermal Circle'}
        </button>
      </div>
    </section>
  )
}
