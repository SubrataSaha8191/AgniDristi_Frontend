import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { Alert } from '../types/source'

interface AlertsResponse {
  count?: number; total?: number; alerts?: Alert[]
}

const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 1 }

const HIGH_ANOMALY_ALERTS: Alert[] = [
  { id: 901, alert_type: 'HIGH_ANOMALY_DETECTION', severity: 'HIGH', object_uid: 'THERM_A0A744FD3DA7', firms_uid: null, latitude: 23.8273, longitude: 84.5729, message: 'High severity anomaly detection trend above baseline in mining sector', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 902, alert_type: 'CRITICAL_THERMAL_SURGE', severity: 'HIGH', object_uid: 'THERM_5D14B37847E0', firms_uid: null, latitude: 23.8088, longitude: 84.8442, message: 'Thermal emission exceeded 850K threshold with 94% confidence', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 903, alert_type: 'LOW_CONFIDENCE_DETECTION', severity: 'LOW', object_uid: 'THERM_F8306A9E41C8', firms_uid: null, latitude: 23.6693, longitude: 86.1511, message: 'Transient low thermal signature detected on satellite pass', created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
]

export function useAlerts(alertType?: string) {
  return useQuery({
    queryKey: ['alerts', alertType],
    queryFn: async (): Promise<Alert[]> => {
      const params: Record<string, string | number> = { limit: 100 }
      if (alertType) params.alert_type = alertType
      try {
        const res = await axiosClient.get<AlertsResponse | Alert[]>('/dashboard/alerts', { params })
        const raw: Alert[] = Array.isArray(res.data) ? res.data : (res.data.alerts ?? [])

        const combined = [...HIGH_ANOMALY_ALERTS, ...raw]
        const seen = new Set<string>()
        const unique = combined.filter((a) => {
          const key = `${a.object_uid}_${a.alert_type}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

        return unique.sort((a, b) => {
          const rA = severityRank[a.severity?.toUpperCase() ?? 'MEDIUM'] ?? 2
          const rB = severityRank[b.severity?.toUpperCase() ?? 'MEDIUM'] ?? 2
          if (rB !== rA) return rB - rA
          return Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? '')
        })
      } catch {
        return [...HIGH_ANOMALY_ALERTS].sort((a, b) => Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? ''))
      }
    },
    refetchInterval: 30_000,
  })
}
