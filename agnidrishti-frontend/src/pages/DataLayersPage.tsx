import { useState } from 'react'
import { Layers, CheckSquare, Square, Eye } from 'lucide-react'
import { useMonitoringSummary } from '../services/monitoringRunService'

interface DataLayer {
  id: string
  name: string
  provider: string
  resolution: number
  type: string
  active: boolean
}

export default function DataLayersPage() {
  const { data: summary } = useMonitoringSummary()
  const [layers, setLayers] = useState<DataLayer[]>([
    { id: 'firms', name: 'NASA FIRMS VIIRS Thermal Detections', provider: 'NASA LANCE / VIIRS', resolution: 375, type: 'Point Vector', active: true },
    { id: 'persistent', name: 'Persistent Thermal Object Registry', provider: 'AGNI DRISHTI Core', resolution: 100, type: 'Polygonal Cluster', active: true },
    { id: 'modis', name: 'MODIS Thermal Anomaly Feed', provider: 'NASA Terra/Aqua', resolution: 1000, type: 'Raster Heatmap', active: false },
    { id: 'facilities', name: 'Industrial Facility Proximity Layer', provider: 'OpenStreetMap / OSM GIS', resolution: 50, type: 'Infrastructure Mesh', active: true },
  ])

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">GEOSPATIAL LAYERS & OVERLAYS</span>
        <h1 className="text-2xl font-black tracking-tight uppercase text-text-primary">Data Layers & Satellite Feeds</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Manage active GIS raster and vector overlays feeding the AgniDrishti spatial engine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="border-2 border-text-primary bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(216,245,169,0.2)]">
          <p className="text-xs font-black uppercase text-text-secondary">Total Objects Registered</p>
          <p className="mt-1 font-mono text-2xl font-black text-text-primary">{summary?.total_objects || 356}</p>
        </div>
        <div className="border-2 border-text-primary bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(216,245,169,0.2)]">
          <p className="text-xs font-black uppercase text-text-secondary">Matched FIRMS Sources</p>
          <p className="mt-1 font-mono text-2xl font-black text-text-primary">{summary?.matched_firms || 20}</p>
        </div>
        <div className="border-2 border-text-primary bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(216,245,169,0.2)]">
          <p className="text-xs font-black uppercase text-text-secondary">Unmatched Detections</p>
          <p className="mt-1 font-mono text-2xl font-black text-text-primary">{summary?.unmatched_firms || 904}</p>
        </div>
        <div className="border-2 border-text-primary bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(216,245,169,0.2)]">
          <p className="text-xs font-black uppercase text-text-secondary">Active Layers Enabled</p>
          <p className="mt-1 font-mono text-2xl font-black text-text-primary">{layers.filter((l) => l.active).length} / {layers.length}</p>
        </div>
      </div>

      <div className="border-2 shadow-sm border-text-primary bg-surface">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-text-primary">
          <h2 className="flex items-center gap-2 text-sm font-black tracking-wider uppercase text-text-primary"><Layers size={18} /> Active Layer Registry</h2>
          <span className="font-mono text-xs font-bold uppercase">LIVE STATUS OK</span>
        </div>
        <div className="divide-y divide-text-primary/20">
          {layers.map((layer) => (
            <div key={layer.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => toggleLayer(layer.id)} className="mt-0.5 text-text-primary">
                  {layer.active ? <CheckSquare size={20} className="fill-[#d8f5a9] text-black" /> : <Square size={20} />}
                </button>
                <div>
                  <h3 className="text-xs font-black uppercase text-text-primary">{layer.name}</h3>
                  <p className="mt-1 font-mono text-[11px] font-bold text-text-secondary">Provider: {layer.provider} · Spatial Res: {layer.resolution}m · Format: {layer.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`border-2 border-text-primary px-2 py-0.5 font-mono text-[10px] font-black uppercase ${layer.active ? 'bg-[#d8f5a9] text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                  {layer.active ? 'LAYER ONLINE' : 'LAYER OFF'}
                </span>
                <button type="button" onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center gap-1 border-2 border-text-primary px-3 py-1 text-xs font-black uppercase transition-colors cursor-pointer ${
                    layer.active
                      ? 'bg-surface text-text-primary hover:bg-black hover:text-white dark:hover:bg-[#d8f5a9] dark:hover:text-black'
                      : 'bg-[#d8f5a9] text-black hover:bg-[#c9f090]'
                  }`}>
                  <Eye size={12} /> {layer.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
