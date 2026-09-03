import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useSourceStore } from '../../stores/sourceStore'
import { useFilterStore } from '../../stores/filterStore'
import { useSources } from '../../services/sourceService'
import type { SourceSummary } from '../../types/source'
import {
  getMapCategory,
  getShapeClipPath,
  MAP_CATEGORY_COLORS,
  MAP_CATEGORY_SHAPES,
} from '../../lib/mapColors'
import { MapLegend } from './MapLegend'

const mapCenter: [number, number] = [24.15, 87.6]
const mapTileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

function createMarkerIcon(source: SourceSummary) {
  const category = getMapCategory(source.category)
  const color = MAP_CATEGORY_COLORS[category]
  const shape = MAP_CATEGORY_SHAPES[category]

  return L.divIcon({
    className: 'thermal-marker',
    html: `<span style="display:block;width:16px;height:16px;background:${color};clip-path:${getShapeClipPath(shape)};border:2px solid white;box-shadow:0 1px 4px rgba(15,23,42,.45)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function ClusteredMarkers({ sources }: { sources: SourceSummary[] }) {
  const map = useMap()
  const openPanel = useSourceStore((state) => state.openPanel)

  useEffect(() => {
    const clusterGroup = (L as unknown as { markerClusterGroup: () => L.LayerGroup }).markerClusterGroup()

    sources.forEach((source) => {
      const marker = L.marker([source.lat, source.lon], {
        icon: createMarkerIcon(source),
        title: source.id,
        alt: `${source.id}, ${source.category}`,
      })
       marker.bindTooltip(`${source.id} · ${source.industrySubtype ?? source.category} · ${source.confidence}% confidence · ${source.anomalyLevel} anomaly`, { direction: 'top' })
      marker.on('click', () => openPanel(source.id))
      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)
    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [map, openPanel, sources])

  return null
}

export function ThermalMap() {
  const [isSatellite, setIsSatellite] = useState(false)
  const sourceId = useFilterStore((state) => state.sourceId)
  const location = useFilterStore((state) => state.location)
  const facility = useFilterStore((state) => state.facility)
  const dateRange = useFilterStore((state) => state.dateRange)
  const sourceType = useFilterStore((state) => state.sourceType)
  const industryType = useFilterStore((state) => state.industryType)
  const anomalyLevel = useFilterStore((state) => state.anomalyLevel)
  const confidenceLevel = useFilterStore((state) => state.confidenceLevel)
  const persistenceStatus = useFilterStore((state) => state.persistenceStatus)
  const resetFilters = useFilterStore((state) => state.reset)
  const filters = { sourceId, location, facility, from: dateRange.from, to: dateRange.to, sourceType, industryType, anomalyLevel, confidenceLevel, persistenceStatus }
  const { data: sources = [], isLoading, isError } = useSources(filters)
  const tileUrl = isSatellite ? satelliteTileUrl : mapTileUrl

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm" aria-label="Thermal source map">
      <MapContainer center={mapCenter} zoom={6} scrollWheelZoom className="h-[32rem] w-full">
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          attribution={isSatellite ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap contributors'}
        />
       {!isLoading && !isError && sources.length > 0 && <ClusteredMarkers sources={sources} />}
      </MapContainer>
      <div className="absolute right-4 top-4 z-[1000] flex overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <button
          type="button"
          onClick={() => setIsSatellite(false)}
          aria-pressed={!isSatellite}
          className={`px-3 py-2 text-xs font-medium ${!isSatellite ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg'}`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setIsSatellite(true)}
          aria-pressed={isSatellite}
          className={`px-3 py-2 text-xs font-medium ${isSatellite ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg'}`}
        >
          Satellite
        </button>
      </div>
      <MapLegend />
       {isLoading && <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-surface/65 backdrop-blur-[1px]"><div className="w-56 rounded-lg border border-border bg-surface p-4 shadow-sm" role="status" aria-label="Loading sources"><div className="h-3 w-28 animate-pulse rounded bg-border" /><div className="mt-3 h-2 w-full animate-pulse rounded bg-border" /><div className="mt-2 h-2 w-4/5 animate-pulse rounded bg-border" /></div></div>}
       {isError && <p className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 rounded bg-surface px-3 py-2 text-sm text-danger shadow">Unable to load sources.</p>}
       {!isLoading && !isError && sources.length === 0 && <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-surface/80 p-6 text-center"><div className="rounded-lg border border-border bg-surface p-5 shadow-sm"><p className="text-sm font-medium text-text-primary">No thermal sources found</p><p className="mt-1 text-xs text-text-secondary">Try broadening the current filters.</p><button type="button" onClick={resetFilters} className="mt-3 rounded-md bg-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90">Reset filters</button></div></div>}
    </section>
  )
}
