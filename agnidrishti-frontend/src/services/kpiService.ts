import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type { KPISummary } from '../types/source'
import mockKpis from '../lib/mockData/kpi-summary.json'

export function useKPISummary() {
  return useQuery({
    queryKey: ['kpi-summary'],
    queryFn: async (): Promise<KPISummary> => {
      if (!isApiConfigured) return mockKpis as KPISummary
      return apiClient<KPISummary>('/kpis/summary')
    },
  })
}
