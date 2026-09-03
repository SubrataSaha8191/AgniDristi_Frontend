import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type {
  ActivityPoint,
  AnomalyPoint,
  SourceDetail,
  SourceSummary,
  ThermalFingerprint,
} from '../types/source'
import mockAnomaly from '../lib/mockData/source-anomaly.json'
import mockDetail from '../lib/mockData/source-detail.json'
import mockFingerprint from '../lib/mockData/source-fingerprint.json'
import mockHistory from '../lib/mockData/source-history.json'
import mockSources from '../lib/mockData/sources.json'

export type SourceFilters = Record<string, string | number | undefined>

export function useSources(filters: SourceFilters = {}) {
  return useQuery({
    queryKey: ['sources', filters],
    queryFn: async (): Promise<SourceSummary[]> => {
      if (!isApiConfigured) return mockSources as SourceSummary[]

      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '') params.set(key, String(value))
      }
      const query = params.toString()
      return apiClient<SourceSummary[]>(`/sources${query ? `?${query}` : ''}`)
    },
  })
}

export function useSourceDetail(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<SourceDetail> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (isApiConfigured) return apiClient<SourceDetail>(`/sources/${encodeURIComponent(sourceId)}`)

      const summary = (mockSources as SourceSummary[]).find((source) => source.id === sourceId)
      if (!summary) throw new Error(`Mock source not found: ${sourceId}`)
      if (summary.id === mockDetail.id) return mockDetail as SourceDetail
      return {
        ...summary,
        firstDetected: mockDetail.firstDetected,
        lastDetected: mockDetail.lastDetected,
        district: 'Ranchi',
        state: 'Jharkhand',
      }
    },
  })
}

export function useSourceHistory(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-history', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<ActivityPoint[]> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (!isApiConfigured) return mockHistory as ActivityPoint[]
      return apiClient<ActivityPoint[]>(`/sources/${encodeURIComponent(sourceId)}/history`)
    },
  })
}

export function useSourceFingerprint(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-fingerprint', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<ThermalFingerprint> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (!isApiConfigured) return mockFingerprint as ThermalFingerprint
      return apiClient<ThermalFingerprint>(`/sources/${encodeURIComponent(sourceId)}/fingerprint`)
    },
  })
}

export function useSourceAnomaly(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-anomaly', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<AnomalyPoint[]> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (!isApiConfigured) return mockAnomaly as AnomalyPoint[]
      return apiClient<AnomalyPoint[]>(`/sources/${encodeURIComponent(sourceId)}/anomaly`)
    },
  })
}
