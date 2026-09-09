import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { SourceCategory, SourceDetail, SourceSummary } from '../types/source'
import { useSourceStore } from '../stores/sourceStore'

interface BackendObject {
  object_uid: string; latitude: number; longitude: number
  classification_label: string | null; classification_source: string | null
  confidence: number | null; detection_count: number | null; persistence_ratio: number | null
  temporal_source_hint?: string | null; temp_mean?: number | null
  gas_flare_likelihood?: string | null; gas_flare_score?: number | null
}

function mapToSource(obj: BackendObject): SourceSummary {
  const conf = Math.round((obj.confidence ?? (obj.temp_mean ? Math.min(1, obj.temp_mean / 500) : 0.82)) * 100)
  const label = (obj.classification_label ?? '').toLowerCase()
  const hint = (obj.temporal_source_hint ?? '').toLowerCase()

  let category: SourceCategory = 'unknown'
  if (label.includes('biomass') || label.includes('natural') || hint.includes('biomass')) category = 'natural_biomass'
  else if (label.includes('industrial') || label.includes('steel') || label.includes('cement') || label.includes('mining') || label.includes('power') || label.includes('flare') || label.includes('gas') || label.includes('oil')) category = 'industrial'
  else if (label.includes('abnormal') || (conf < 50 && label.length > 0)) category = 'abnormal'
  else if ((obj.persistence_ratio ?? 0) > 0.5 || hint.includes('persistent')) category = 'persistent'

  const flareLvl = (obj.gas_flare_likelihood ?? '').toUpperCase()
  const flareScore = obj.gas_flare_score ?? 0
  const anomalyLevel = flareLvl === 'LIKELY' || flareScore >= 0.7 ? 'high' : flareLvl === 'POSSIBLE' || flareScore >= 0.3 ? 'medium' : 'low'

  return {
    id: obj.object_uid, category,
    industrySubtype: obj.classification_label || (category === 'unknown' ? 'Unclassified Object' : obj.temporal_source_hint) || 'Thermal Object',
    confidence: conf, status: (obj.persistence_ratio ?? 0) > 0.5 ? 'persistent' : 'new',
    anomalyLevel, lat: obj.latitude, lon: obj.longitude,
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
      const res = await axiosClient.get<Record<string, unknown>>(`/dashboard/objects/${encodeURIComponent(sourceId)}`)
      const d = res.data
      const loc = d.location as { latitude?: number; longitude?: number; state?: string; district?: string } | undefined
      const cls = d.classification as { label?: string; confidence?: number; temporal_source_hint?: string } | undefined
      const activity = (d.activity ?? d.temporal) as { persistence_ratio?: number; source_persistence_ratio?: number; source_hint?: string } | undefined
      const flare = (d.gas_flare ?? d.gas_flare_assessment) as { likelihood?: string; score?: number } | undefined
      const confidence = Math.round((cls?.confidence ?? 0) * 100)
      const label = cls?.label ?? 'Unclassified thermal source'
      const categoryLabel = label.toLowerCase()
      const temporalHint = cls?.temporal_source_hint ?? activity?.source_hint ?? ''
      const persistence = activity?.source_persistence_ratio ?? activity?.persistence_ratio ?? 0
      const category: SourceCategory = categoryLabel.includes('biomass')
        ? 'natural_biomass'
        : categoryLabel.includes('industrial') || temporalHint.toLowerCase().includes('industrial')
          ? 'industrial'
          : persistence > 0.5
            ? 'persistent'
            : 'unknown'
      const flareLikelihood = (flare?.likelihood ?? '').toUpperCase()
      const anomalyLevel = flareLikelihood === 'LIKELY' ? 'high' : flareLikelihood === 'POSSIBLE' ? 'medium' : 'low'

      return {
        id: String(d.object_uid ?? sourceId),
        category,
        industrySubtype: label,
        confidence,
        status: persistence > 0.5 ? 'persistent' : 'new',
        anomalyLevel,
        lat: loc?.latitude ?? 0,
        lon: loc?.longitude ?? 0,
        state: loc?.state,
        district: loc?.district,
        firstDetected: now,
        lastDetected: now,
      }
    },
  })
}

