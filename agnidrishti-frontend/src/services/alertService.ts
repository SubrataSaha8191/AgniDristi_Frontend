import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/apiClient'
import type { Alert } from '../types/source'

interface AlertsResponse { count: number; alerts: Alert[] }

export function useAlerts(alertType?: string) {
  return useQuery({
    queryKey: ['dashboard', 'alerts', 100, alertType],
    queryFn: async ({ signal }) => {
      const response = await apiGet<AlertsResponse>('/dashboard/alerts', { params: { limit: 100, alert_type: alertType || undefined }, signal })
      return response.alerts
    },
    refetchInterval: 30_000,
  })
}
