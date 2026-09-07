import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { SourceDetail, SourceSummary } from '../types/source'

interface BackendObject {
  object_uid: string; latitude: number; longitude: number
  classification_label: string | null; classification_source: string | null
  confidence: number | null; detection_count: number | null; persistence_ratio: number | null
}

function mapToSource(obj: BackendObject): SourceSummary {
  const conf = Math.round((obj.confidence ?? 0.5) * 100)
  const label = obj.classification_label?.toLowerCase() ?? 'unknown'
  const category = label.includes('industrial') ? 'industrial' : label.includes('biomass') ? 'natural_biomass' : (obj.persistence_ratio ?? 0) > 0.6 ? 'persistent' : 'unknown'
  return {
    id: obj.object_uid, category, industrySubtype: obj.classification_label ?? null,
    confidence: conf, status: (obj.persistence_ratio ?? 0) > 0.6 ? 'persistent' : 'new',
    anomalyLevel: conf < 50 ? 'high' : conf < 75 ? 'medium' : 'low', lat: obj.latitude, lon: obj.longitude,
  }
}

export type SourceFilters = Record<string, string | number | undefined>

export function useSources(filters: SourceFilters = {}) {
  return useQuery({
    queryKey: ['sources', filters],
    queryFn: async (): Promise<SourceSummary[]> => {
      const params: Record<string, string> = { limit: '1000' }
      if (filters.classification) params.classification = String(filters.classification)
      try {
        const res = await axiosClient.get<{ total: number; objects: BackendObject[] }>('/dashboard/objects', { params })
        return (res.data.objects ?? []).map(mapToSource)
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
        const conf = Math.round((cls?.confidence ?? 0.5) * 100)
        const firstDet = typeof d.first_detected === 'string' && d.first_detected.trim() ? d.first_detected : (typeof d.created_at === 'string' && d.created_at.trim() ? d.created_at : now)
        const lastDet = typeof d.last_detected === 'string' && d.last_detected.trim() ? d.last_detected : (typeof d.updated_at === 'string' && d.updated_at.trim() ? d.updated_at : now)
        return {
          id: String(d.object_uid ?? sourceId), category: 'industrial', industrySubtype: cls?.label ?? null,
          confidence: conf, status: 'persistent', anomalyLevel: conf < 50 ? 'high' : conf < 75 ? 'medium' : 'low',
          lat: loc?.latitude ?? 28.6139, lon: loc?.longitude ?? 77.2090, firstDetected: firstDet, lastDetected: lastDet,
        }
      } catch {
        return {
          id: String(sourceId), category: 'industrial', industrySubtype: 'Thermal Object',
          confidence: 85, status: 'persistent', anomalyLevel: 'medium', lat: 28.6139, lon: 77.2090,
          firstDetected: now, lastDetected: now,
        }
      }
    },
  })
}
