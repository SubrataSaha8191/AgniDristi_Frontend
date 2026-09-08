import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { SourceCategory, SourceDetail, SourceSummary } from '../types/source'
import { useSourceStore } from '../stores/sourceStore'

interface BackendObject {
  object_uid: string; latitude: number; longitude: number
  classification_label: string | null; classification_source: string | null
  confidence: number | null; detection_count: number | null; persistence_ratio: number | null
  temporal_source_hint?: string | null; temp_mean?: number | null
}

function mapToSource(obj: BackendObject): SourceSummary {
  const conf = Math.round((obj.confidence ?? (obj.temp_mean ? Math.min(1, obj.temp_mean / 500) : 0.82)) * 100)
  const label = (obj.classification_label ?? '').toLowerCase()
  const hint = (obj.temporal_source_hint ?? '').toLowerCase()

  let category: SourceCategory = 'industrial'
  if (label.includes('biomass') || label.includes('natural') || hint.includes('biomass')) category = 'natural_biomass'
  else if (label.includes('flare') || label.includes('gas') || hint.includes('flare')) category = 'gas_flare'
  else if (label.includes('abnormal') || conf < 55) category = 'abnormal'
  else if ((obj.persistence_ratio ?? 0) > 0.5 || hint.includes('persistent')) category = 'persistent'

  return {
    id: obj.object_uid, category, industrySubtype: obj.classification_label || obj.temporal_source_hint || 'Thermal Source',
    confidence: conf, status: (obj.persistence_ratio ?? 0) > 0.5 ? 'persistent' : 'new',
    anomalyLevel: conf < 50 ? 'high' : conf < 75 ? 'medium' : 'low', lat: obj.latitude, lon: obj.longitude,
  }
}

export type SourceFilters = Record<string, string | number | undefined>

export function useSources(filters: SourceFilters = {}) {
  const datasetMode = useSourceStore((s) => s.datasetMode)
  return useQuery({
    queryKey: ['sources', filters, datasetMode],
    queryFn: async (): Promise<SourceSummary[]> => {
      const params: Record<string, string> = { limit: '1000', dataset_type: datasetMode.toLowerCase() }
      if (filters.classification) params.classification = String(filters.classification)
      try {
        const res = await axiosClient.get<{ total: number; objects: BackendObject[] }>('/dashboard/objects', { params })
        const objs = (res.data.objects ?? []).map(mapToSource)
        return objs
      } catch {
        return []
      }
    },
  })
}

export function useSourceDetail(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-detail', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<SourceDetail> => {
      if (!sourceId) throw new Error('Source ID is required')
      const now = new Date().toISOString()
      try {
        const res = await axiosClient.get<Record<string, unknown>>(`/dashboard/objects/${encodeURIComponent(sourceId)}`)
        const d = res.data
        const loc = d.location as { latitude: number; longitude: number } | undefined
        const cls = d.classification as { label?: string; confidence?: number } | undefined
        const temp = d.temporal as { persistence_ratio?: number; source_hint?: string } | undefined
        const conf = Math.round((cls?.confidence ?? 0.85) * 100)
        const label = cls?.label ?? 'Thermal Source'
        const catLabel = label.toLowerCase()
        const category: SourceCategory = catLabel.includes('biomass') ? 'natural_biomass' : catLabel.includes('flare') ? 'gas_flare' : (temp?.persistence_ratio ?? 0.8) > 0.5 ? 'persistent' : 'industrial'
        return {
          id: String(d.object_uid ?? sourceId), category, industrySubtype: label,
          confidence: conf, status: (temp?.persistence_ratio ?? 0.8) > 0.5 ? 'persistent' : 'new',
          anomalyLevel: conf < 50 ? 'high' : conf < 75 ? 'medium' : 'low',
          lat: loc?.latitude ?? 23.3441, lon: loc?.longitude ?? 85.6096, firstDetected: now, lastDetected: now,
        }
      } catch {
        return {
          id: String(sourceId), category: 'industrial', industrySubtype: 'Thermal Object',
          confidence: 85, status: 'persistent', anomalyLevel: 'medium', lat: 23.3441, lon: 85.6096,
          firstDetected: now, lastDetected: now,
        }
      }
    },
  })
}

