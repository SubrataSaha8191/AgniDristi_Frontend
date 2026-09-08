import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'

export interface MonitoringRun {
  id: number; run_uid: string; trigger_type: string; status: string
  started_at: string; finished_at: string | null; duration_seconds: number | null
  fetched: number; inserted: number; matched: number; unmatched: number; alerts_created: number
}

export function useMonitoringRuns(limit = 20) {
  return useQuery({
    queryKey: ['monitoring-runs', limit],
    queryFn: async () => (await axiosClient.get<{ count: number; runs: MonitoringRun[] }>('/monitoring/runs', { params: { limit } })).data,
  })
}

export function useLatestRun() {
  return useQuery({
    queryKey: ['monitoring-runs-latest'],
    queryFn: async () => (await axiosClient.get<MonitoringRun>('/monitoring/runs/latest')).data,
    refetchInterval: 30_000,
  })
}

export function useTriggerMonitoring() {
  return useMutation({
    mutationFn: async (dayRange: number = 1) => (await axiosClient.post('/monitoring/runs/trigger', null, { params: { day_range: dayRange } })).data,
  })
}

export async function triggerMonitoringRun(dayRange = 1) {
  return (await axiosClient.post('/monitoring/runs/trigger', null, { params: { day_range: dayRange } })).data
}

export function useMonitoringSummary() {
  return useQuery({
    queryKey: ['monitoring-summary'],
    queryFn: async () => (await axiosClient.get('/monitoring/summary')).data,
  })
}

export function useMonitoringRecent(limit = 10) {
  return useQuery({
    queryKey: ['monitoring-recent', limit],
    queryFn: async () => (await axiosClient.get('/monitoring/recent', { params: { limit } })).data,
  })
}

export function useMonitoringUnmatched(limit = 10) {
  return useQuery({
    queryKey: ['monitoring-unmatched', limit],
    queryFn: async () => {
      try {
        const res = await axiosClient.get('/monitoring/unmatched', { params: { limit } })
        const raw = Array.isArray(res.data) ? res.data : (res.data?.unmatched ?? res.data?.detections ?? [])
        if (raw.length > 0) return raw
        const recentRes = await axiosClient.get<{ detections: Array<Record<string, unknown>> }>('/dashboard/firms/recent', { params: { limit } })
        const detections = recentRes.data?.detections ?? []
        return detections.filter((d) => !d.known_source && !d.is_known_persistent_source)
      } catch {
        return []
      }
    },
  })
}



