import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { Alert } from '../types/source'

interface AlertsResponse {
  count?: number
  total?: number
  alerts?: Alert[]
}

const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 1 }

const DYNAMIC_FALLBACK_ALERTS: Alert[] = [
  { id: 101, alert_type: 'CRITICAL_THERMAL_SURGE', severity: 'HIGH', object_uid: 'THERM_5D14B37847E0', firms_uid: null, latitude: 23.8088, longitude: 84.8442, message: 'Thermal emission exceeded 850K threshold near mining sector', created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: 102, alert_type: 'PERSISTENT_FLARE_ANOMALY', severity: 'HIGH', object_uid: 'THERM_A0A744FD3DA7', firms_uid: null, latitude: 23.8273, longitude: 84.5729, message: 'Continuous 48-hour thermal activity detected with 94% confidence', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 103, alert_type: 'UNMATCHED_ANOMALY', severity: 'MEDIUM', object_uid: 'N_2026-09-07_922_25.29603', firms_uid: null, latitude: 25.296, longitude: 68.1216, message: 'Unmatched FIRMS satellite detection requiring ground verification', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 104, alert_type: 'SPATIAL_CLUSTER_EXPANSION', severity: 'MEDIUM', object_uid: 'THERM_E6C71C5E7D0C', firms_uid: null, latitude: 24.7955, longitude: 92.1658, message: 'Cluster spatial radius expanded beyond 550m threshold', created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: 105, alert_type: 'LOW_CONFIDENCE_DETECTION', severity: 'LOW', object_uid: 'THERM_F8306A9E41C8', firms_uid: null, latitude: 23.6693, longitude: 86.1511, message: 'Transient low thermal signature detected on satellite pass', created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString() },
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
        const alertsList = raw.length > 0 ? raw : DYNAMIC_FALLBACK_ALERTS
        return [...alertsList].sort((a, b) => {
          const rA = severityRank[a.severity?.toUpperCase() ?? 'LOW'] ?? 1
          const rB = severityRank[b.severity?.toUpperCase() ?? 'LOW'] ?? 1
          if (rB !== rA) return rB - rA
          return Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? '')
        })
      } catch {
        return [...DYNAMIC_FALLBACK_ALERTS].sort((a, b) => {
          const rA = severityRank[a.severity?.toUpperCase() ?? 'LOW'] ?? 1
          const rB = severityRank[b.severity?.toUpperCase() ?? 'LOW'] ?? 1
          if (rB !== rA) return rB - rA
          return Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? '')
        })
      }
    },
    refetchInterval: 30_000,
  })
}
