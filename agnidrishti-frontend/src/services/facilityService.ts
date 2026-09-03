import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type { NearbyFacility } from '../lib/mockGenerators'
import type { SourceSummary } from '../types/source'
import mockSources from '../lib/mockData/sources.json'
import { generateNearbyFacilities } from '../lib/mockGenerators'

function findMockSource(sourceId: string): SourceSummary {
  const source = (mockSources as SourceSummary[]).find((item) => item.id === sourceId)
  if (!source) throw new Error(`Mock source not found: ${sourceId}`)
  return source
}

export function useNearbyFacilities(sourceId?: string | null) {
  return useQuery({
    queryKey: ['nearby-facilities', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<NearbyFacility[]> => {
      if (!sourceId) throw new Error('A source ID is required')
      if (isApiConfigured) return apiClient<NearbyFacility[]>(`/sources/${encodeURIComponent(sourceId)}/facilities`)
      return generateNearbyFacilities(findMockSource(sourceId))
    },
  })
}
