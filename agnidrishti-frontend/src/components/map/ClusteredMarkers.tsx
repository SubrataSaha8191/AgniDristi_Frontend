import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import { useSourceStore } from '../../stores/sourceStore'
import type { RecentFirmsDetection, ThermalObject } from '../../types/dashboard'

export function getIndustryCategory(label: string | null | undefined): string {
  if (!label) return 'Other Industrial'
  const u = label.toUpperCase()
  if (u.includes('OIL') || u.includes('GAS') || u.includes('FLARE')) return 'Oil & Gas'
  if (u.includes('METAL') || u.includes('STEEL')) return 'Metallurgical'
  if (u.includes('MINING') || u.includes('EXTRACT')) return 'Mining & Extraction'
  return 'Other Industrial'
}

const industryColors: Record<string, string> = { 'Oil & Gas': '#dc2626', Metallurgical: '#ea580c', 'Mining & Extraction': '#9333ea', 'Other Industrial': '#2563eb' }
const objectColor = (object: ThermalObject) => industryColors[getIndustryCategory(object.classification_label)] || '#2563eb'
const value = (input: string | number | null | undefined) => input == null || input === '' ? 'Not available' : String(input)

function pointIcon(color: string) {
  return L.divIcon({
    className: 'thermal-marker-dot', iconSize: [12, 12], iconAnchor: [6, 6],
    html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #111827;box-shadow:1.5px 1.5px 0 #111827"></span>`,
  })
}

export function ClusteredMarkers({ objects, detections }: { objects: ThermalObject[]; detections?: RecentFirmsDetection[] }) {
  const map = useMap()
  const openPanel = useSourceStore((state) => state.openPanel)

  useEffect(() => {
    const radialLayer = L.layerGroup()
    const syncRadialVisibility = () => { if (map.getZoom() >= 11) { if (!map.hasLayer(radialLayer)) map.addLayer(radialLayer) } else { if (map.hasLayer(radialLayer)) map.removeLayer(radialLayer) } }
    map.on('zoomend', syncRadialVisibility)

    const clustersGroup = (L as unknown as { markerClusterGroup: (options?: unknown) => L.LayerGroup }).markerClusterGroup({
      showCoverageOnHover: false, disableClusteringAtZoom: 0, zoomToBoundsOnClick: false,
    })

    objects.forEach((object) => {
      const color = objectColor(object)
      radialLayer.addLayer(L.circle([object.latitude, object.longitude], { radius: 1400, color, fillColor: color, fillOpacity: 0.1, weight: 1.5, dashArray: '4,4' }))
      radialLayer.addLayer(L.circle([object.latitude, object.longitude], { radius: 450, color, fillColor: color, fillOpacity: 0.2, weight: 2 }))

      const score = object.gas_flare_score == null ? 'Not available' : `${Math.round(object.gas_flare_score * 100)}%`
      const tooltip = `<strong>${object.object_uid}</strong><br>Category: ${getIndustryCategory(object.classification_label)}<br>Label: ${value(object.classification_label)}<br>Detections: ${value(object.detection_count)}<br>Flare score: ${score}`

      const marker = L.marker([object.latitude, object.longitude], { icon: pointIcon(color), title: `Thermal object ${object.object_uid}`, zIndexOffset: 1000 })
      marker.bindTooltip(tooltip, { className: 'thermal-tooltip' })
      marker.on('click', () => openPanel(object.object_uid))
      clustersGroup.addLayer(marker)
    })

    if (detections?.length) {
      detections.forEach((d) => {
        const marker = L.marker([d.latitude, d.longitude], { icon: pointIcon('#ef4444'), title: `FIRMS detection ${d.firms_uid}` })
        marker.bindTooltip(`<strong>FIRMS ${d.firms_uid}</strong><br>Date: ${value(d.acq_date)}<br>FRP: ${value(d.frp)}`, { className: 'thermal-tooltip' })
        if (d.matched_object_uid) marker.on('click', () => openPanel(d.matched_object_uid!))
        clustersGroup.addLayer(marker)
      })
    }

    map.addLayer(clustersGroup)
    syncRadialVisibility()
    return () => { map.off('zoomend', syncRadialVisibility); if (map.hasLayer(radialLayer)) map.removeLayer(radialLayer); map.removeLayer(clustersGroup) }
  }, [map, objects, detections, openPanel])
  return null
}



