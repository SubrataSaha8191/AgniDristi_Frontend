import { useQuery } from '@tanstack/react-query'
import { apiClient, isApiConfigured } from '../lib/apiClient'
import type { Alert } from '../types/source'
import mockAlerts from '../lib/mockData/alerts.json'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async (): Promise<Alert[]> => {
      if (!isApiConfigured) return mockAlerts as Alert[]
      return apiClient<Alert[]>('/alerts')
    },
    refetchInterval: 30_000,
  })
}
