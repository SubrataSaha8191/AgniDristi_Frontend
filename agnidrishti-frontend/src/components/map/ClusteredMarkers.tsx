import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import { useSourceStore } from '../../stores/sourceStore'
import type { GasFlareLikelihood, RecentFirmsDetection, ThermalObject } from '../../types/dashboard'

const flareColors: Record<GasFlareLikelihood, string> = { LIKELY: '#dc2626', POSSIBLE: '#d97706', UNLIKELY: '#2563eb' }
const objectColor = (object: ThermalObject) => object.gas_flare_likelihood ? flareColors[object.gas_flare_likelihood] : '#64748b'

function objectIcon(object: ThermalObject) {
  const likely = object.gas_flare_likelihood === 'LIKELY'
  const color = objectColor(object)
  const size = likely ? 30 : 22
  return L.divIcon({
    className: 'thermal-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border:2px solid #111827;border-radius:50%;background:${color};box-shadow:${likely ? '0 0 0 6px rgba(220,38,38,.24),3px 3px 0 #111827' : '2px 2px 0 #111827'}"></span>`,
  })
}

const value = (input: string | number | null | undefined) => input == null || input === '' ? 'Not available' : String(input)

export function ClusteredMarkers({ objects, detections }: { objects: ThermalObject[]; detections: RecentFirmsDetection[] }) {
  const map = useMap()
  const openPanel = useSourceStore((state) => state.openPanel)

  useEffect(() => {
    const clusters = (L as unknown as { markerClusterGroup: (options?: unknown) => L.LayerGroup }).markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: { getChildCount: () => number }) => L.divIcon({
        className: 'custom-cluster-icon', iconSize: [34, 34],
        html: `<span style="display:flex;width:34px;height:34px;align-items:center;justify-content:center;border:2px solid #111827;border-radius:50%;background:#d8f5a9;color:#111827;font:800 11px monospace;box-shadow:3px 3px 0 #111827">${cluster.getChildCount()}</span>`,
      }),
    })

    objects.forEach((object) => {
      const marker = L.marker([object.latitude, object.longitude], { icon: objectIcon(object), title: `Thermal object ${object.object_uid}`, zIndexOffset: object.gas_flare_likelihood === 'LIKELY' ? 1000 : 0 })
      const score = object.gas_flare_score == null ? 'Not available' : `${Math.round(object.gas_flare_score * 100)}%`
      marker.bindTooltip(`<strong>${object.object_uid}</strong><br>${value(object.classification_label)}<br>Flare likelihood: ${value(object.gas_flare_likelihood)}<br>Flare score: ${score}`, { className: 'thermal-tooltip' })
      marker.on('click', () => openPanel(object.object_uid))
      clusters.addLayer(marker)
    })

    const firmsLayer = L.layerGroup()
    detections.forEach((detection) => {
      const matched = detection.known_source === true
      const marker = L.circleMarker([detection.latitude, detection.longitude], { radius: matched ? 5 : 6, color: '#111827', weight: 1.5, fillColor: matched ? '#16a34a' : '#a855f7', fillOpacity: 0.82 })
      marker.bindTooltip(`<strong>FIRMS ${detection.firms_uid}</strong><br>${matched ? 'Matched detection' : 'Unmatched detection'}<br>FRP: ${value(detection.frp)}`, { className: 'thermal-tooltip' })
      if (detection.matched_object_uid) marker.on('click', () => openPanel(detection.matched_object_uid!))
      firmsLayer.addLayer(marker)
    })

    map.addLayer(clusters); map.addLayer(firmsLayer)
    return () => { map.removeLayer(clusters); map.removeLayer(firmsLayer) }
  }, [detections, map, objects, openPanel])
  return null
}
