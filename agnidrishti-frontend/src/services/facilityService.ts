import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type { SourceSummary } from '../types/source'
import mockSources from '../lib/mockData/sources.json'

export function useNearbyFacilities(sourceId?: string | null) {
  return useQuery({
    queryKey: ['nearby-facilities', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<SourceSummary[]> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (!isApiConfigured) return (mockSources as SourceSummary[]).slice(0, 6)
      return apiClient<SourceSummary[]>(`/sources/${encodeURIComponent(sourceId)}/facilities`)
    },
  })
}
