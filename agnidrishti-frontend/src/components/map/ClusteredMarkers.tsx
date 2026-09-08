import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useSourceStore } from '../../stores/sourceStore'
import type { SourceSummary } from '../../types/source'
import { getMapCategory, getShapeClipPath, MAP_CATEGORY_COLORS, MAP_CATEGORY_LABELS, MAP_CATEGORY_SHAPES } from '../../lib/mapColors'

const CATEGORY_SVGS: Record<string, string> = {
  industrial: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/></svg>`,
  natural_biomass: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><path d="M12 22v-9"/><path d="M12 13c-4-2-7-6-7-10a7 7 0 0 1 14 0c0 4-3 8-7 10Z"/></svg>`,
  persistent: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>`,
  abnormal: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  unknown: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  firms_detection: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="m12 2 1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z"/></svg>`,
}

const PIN_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:-1px;margin-right:3px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
const SHIELD_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:-1px;margin-right:3px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`

function createMarkerIcon(source: SourceSummary) {
  const cat = getMapCategory(source.category)
  const color = MAP_CATEGORY_COLORS[cat]
  const shape = MAP_CATEGORY_SHAPES[cat]
  const svg = CATEGORY_SVGS[cat] || CATEGORY_SVGS.persistent
  const isHighPriority = source.confidence >= 80 || source.status === 'persistent' || source.anomalyLevel === 'high'

  const html = `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center">${isHighPriority ? `<div class="thermal-pulse-ring" style="position:absolute;inset:-6px;border-radius:50%;background:${color}40;border:1.5px solid ${color}"></div>` : ''}<span style="position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:${color};clip-path:${getShapeClipPath(shape)};border:2px solid #000;box-shadow:2px 2px 0px rgba(0,0,0,0.8)">${svg}</span></div>`
  return L.divIcon({ className: 'thermal-marker', html, iconSize: [24, 24], iconAnchor: [12, 12] })
}

export function ClusteredMarkers({ sources }: { sources: SourceSummary[] }) {
  const map = useMap()
  const openPanel = useSourceStore((state) => state.openPanel)

  useEffect(() => {
    const clusterGroup = (L as unknown as { markerClusterGroup: (opts?: unknown) => L.LayerGroup }).markerClusterGroup({
      iconCreateFunction: (cluster: { getChildCount: () => number }) => {
        const count = cluster.getChildCount()
        const bg = count > 50 ? '#ef4444' : count > 15 ? '#f59e0b' : '#22c55e'
        return L.divIcon({
          html: `<div style="background:${bg};color:#000;font-weight:900;font-size:11px;font-family:monospace;width:32px;height:32px;border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;box-shadow:3px 3px 0px #000">${count}</div>`,
          className: 'custom-cluster-icon', iconSize: [32, 32],
        })
      },
    })

    let activeCircle: L.Circle | null = null
    sources.forEach((source) => {
      const cat = getMapCategory(source.category)
      const color = MAP_CATEGORY_COLORS[cat]
      const marker = L.marker([source.lat, source.lon], { icon: createMarkerIcon(source), title: source.id })

      const tooltipContent = `<div style="font-family:sans-serif;font-size:11px;min-width:160px;padding:2px"><div style="display:flex;align-items:center;justify-content:between;gap:6px;border-bottom:1.5px solid #000;padding-bottom:3px;margin-bottom:4px"><span style="font-weight:900;font-family:monospace;text-transform:uppercase;color:var(--color-text-primary)">${source.id}</span><span style="background:${color};color:#000;font-weight:900;font-size:9px;padding:1px 4px;border-radius:2px;text-transform:uppercase">${MAP_CATEGORY_LABELS[cat]}</span></div><div style="font-weight:700;color:var(--color-text-secondary);font-size:10px">${source.industrySubtype ?? 'Thermal Source'}</div><div style="font-family:monospace;font-size:10px;margin-top:3px;color:var(--color-text-secondary)">${PIN_SVG}${source.lat.toFixed(4)}°, ${source.lon.toFixed(4)}° | 550m</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;font-size:10px;font-weight:800"><span style="color:#15803d">${SHIELD_SVG}${source.confidence}% Confidence</span><span style="color:${source.anomalyLevel === 'high' ? '#ef4444' : '#f59e0b'};text-transform:uppercase">${source.anomalyLevel} Anomaly</span></div><div style="margin-top:4px;font-size:9px;color:#71717a;text-transform:uppercase;font-weight:700;text-align:center">Click to open snapshot</div></div>`

      marker.bindTooltip(tooltipContent, { className: 'thermal-tooltip', direction: 'top', opacity: 1 })
      marker.on('mouseover', () => {
        if (activeCircle) map.removeLayer(activeCircle)
        activeCircle = L.circle([source.lat, source.lon], { radius: 550, color, fillColor: color, fillOpacity: 0.25, weight: 2 }).addTo(map)
      })
      marker.on('mouseout', () => { if (activeCircle) { map.removeLayer(activeCircle); activeCircle = null } })
      marker.on('click', () => openPanel(source.id))
      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)
    return () => {
      if (activeCircle) map.removeLayer(activeCircle)
      map.removeLayer(clusterGroup)
    }
  }, [map, openPanel, sources])

  return null
}

