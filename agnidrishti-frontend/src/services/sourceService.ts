import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type {
  ActivityPoint,
  AnomalyPoint,
  SourceDetail,
  SourceSummary,
  ThermalFingerprint,
} from '../types/source'
import {
  generateActivityHistory,
  generateThermalFingerprint,
  generateAnomalyTrend,
} from '../lib/mockGenerators'
import mockSources from '../lib/mockData/sources.json'

export type SourceFilters = Record<string, string | number | undefined>

function filterMockSources(filters: SourceFilters) {
  return (mockSources as SourceSummary[]).filter((source) => {
    const sourceId = String(filters.sourceId ?? '').toLowerCase()
    const industryType = String(filters.industryType ?? '').toLowerCase()
    const confidence = String(filters.confidenceLevel ?? '')
    const confidenceMinimum = confidence ? Number(confidence) : 0

    if (sourceId && !source.id.toLowerCase().includes(sourceId)) return false
    if (filters.sourceType && source.category !== filters.sourceType) return false
    if (industryType && !(source.industrySubtype ?? '').toLowerCase().includes(industryType)) return false
    if (filters.anomalyLevel && source.anomalyLevel !== filters.anomalyLevel) return false
    if (filters.persistenceStatus && source.status !== filters.persistenceStatus) return false
    if (confidenceMinimum > 0 && source.confidence < confidenceMinimum) return false
    if (confidence === 'high' && source.confidence < 80) return false
    if (confidence === 'medium' && (source.confidence < 60 || source.confidence >= 80)) return false
    if (confidence === 'low' && source.confidence >= 60) return false
    return true
  })
}

function findMockSource(sourceId: string): SourceSummary {
  const source = (mockSources as SourceSummary[]).find((s) => s.id === sourceId)
  if (!source) throw new Error(`Mock source not found: ${sourceId}`)
  return source
}

// Deterministic district/state assignment so the same source always shows the
// same location details, without needing a hand-written entry per source.
const REGIONS: { district: string; state: string }[] = [
  { district: 'Ranchi', state: 'Jharkhand' },
  { district: 'Dhanbad', state: 'Jharkhand' },
  { district: 'Patna', state: 'Bihar' },
  { district: 'Gaya', state: 'Bihar' },
  { district: 'Bhagalpur', state: 'Bihar' },
  { district: 'Kolkata', state: 'West Bengal' },
  { district: 'Purulia', state: 'West Bengal' },
  { district: 'Paschim Bardhaman', state: 'West Bengal' },
]

function seedFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function regionForSource(source: SourceSummary) {
  return REGIONS[seedFromString(source.id) % REGIONS.length]
}

function firstDetectedForSource(source: SourceSummary): string {
  // Persistent sources have an older first-detected date; new/transient sources are recent.
  const seed = seedFromString(source.id + 'first')
  const daysAgo = source.status === 'persistent' ? 400 + (seed % 300) : 5 + (seed % 60)
  const date = new Date('2026-09-03T00:00:00Z')
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const LAST_DETECTED = '2026-09-03T04:12:00Z' // matches "today" per project's current date

export function useSources(filters: SourceFilters = {}) {
  return useQuery({
    queryKey: ['sources', filters],
    queryFn: async (): Promise<SourceSummary[]> => {
      if (!isApiConfigured) return filterMockSources(filters)

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

      const summary = findMockSource(sourceId)
      const region = regionForSource(summary)
      return {
        ...summary,
        firstDetected: firstDetectedForSource(summary),
        lastDetected: LAST_DETECTED,
        district: region.district,
        state: region.state,
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
      if (isApiConfigured) return apiClient<ActivityPoint[]>(`/sources/${encodeURIComponent(sourceId)}/history`)

      const source = findMockSource(sourceId)
      return generateActivityHistory(source)
    },
  })
}

export function useSourceFingerprint(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-fingerprint', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<ThermalFingerprint> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (isApiConfigured) return apiClient<ThermalFingerprint>(`/sources/${encodeURIComponent(sourceId)}/fingerprint`)

      const source = findMockSource(sourceId)
      return generateThermalFingerprint(source)
    },
  })
}

export function useSourceAnomaly(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-anomaly', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<AnomalyPoint[]> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (isApiConfigured) return apiClient<AnomalyPoint[]>(`/sources/${encodeURIComponent(sourceId)}/anomaly`)

      const source = findMockSource(sourceId)
      return generateAnomalyTrend(source)
    },
  })
}