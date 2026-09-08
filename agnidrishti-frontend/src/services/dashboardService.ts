import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, uploadFile } from '../lib/apiClient'
import { LONG_OPERATION_TIMEOUT_MS } from '../lib/axiosClient'
import type {
  AlertsResponse, ClassDistribution, DashboardSummary, GasFlareLikelihood, LatestRunResponse,
  MonitoringRunsResponse, MonitoringState, RecentFirmsResponse, ThermalObjectDetail,
  ThermalObjectsResponse, VnfUploadResult,
} from '../types/dashboard'

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  classes: ['dashboard', 'classes'] as const,
  objects: ['dashboard', 'objects'] as const,
  detail: (id: string | null) => ['dashboard', 'object', id] as const,
  firms: ['dashboard', 'firms'] as const,
  alerts: ['dashboard', 'alerts'] as const,
  monitoring: ['dashboard', 'monitoring'] as const,
  runs: ['monitoring', 'runs'] as const,
}

export interface ObjectQuery {
  limit: number
  offset: number
  classification?: string
  source_hint?: string
  gas_flare_likelihood?: GasFlareLikelihood | ''
  likely_only?: boolean
}

export function useDashboardSummary() {
  return useQuery({ queryKey: dashboardKeys.summary, queryFn: ({ signal }) => apiGet<DashboardSummary>('/dashboard/summary', { signal }) })
}

export function useClassDistribution() {
  return useQuery({ queryKey: dashboardKeys.classes, queryFn: ({ signal }) => apiGet<ClassDistribution>('/dashboard/classes', { signal }) })
}

export function useThermalObjects(query: ObjectQuery) {
  const { gas_flare_likelihood, likely_only, ...serverParams } = query
  return useQuery<ThermalObjectsResponse>({
    queryKey: [...dashboardKeys.objects, query],
    placeholderData: (previous: ThermalObjectsResponse | undefined) => previous,
    queryFn: async ({ signal }): Promise<ThermalObjectsResponse> => {
      const requested = likely_only ? 'LIKELY' : gas_flare_likelihood
      const response = await apiGet<ThermalObjectsResponse>('/dashboard/objects', {
        params: requested ? { ...serverParams, limit: 5000, offset: 0 } : serverParams,
        signal,
      })
      if (!requested) return response
      const matching = response.objects.filter((object) => object.gas_flare_likelihood === requested)
      return { total: matching.length, limit: query.limit, offset: query.offset, objects: matching.slice(query.offset, query.offset + query.limit) }
    },
  })
}

export function useThermalObjectDetail(objectUid: string | null) {
  return useQuery({
    queryKey: dashboardKeys.detail(objectUid), enabled: Boolean(objectUid),
    queryFn: ({ signal }) => apiGet<ThermalObjectDetail>(`/dashboard/objects/${encodeURIComponent(objectUid!)}`, { signal }),
  })
}

export function useRecentFirms(limit = 500, matchedOnly?: boolean) {
  return useQuery({
    queryKey: [...dashboardKeys.firms, limit, matchedOnly],
    queryFn: ({ signal }) => apiGet<RecentFirmsResponse>('/dashboard/firms/recent', { params: { limit, matched_only: matchedOnly }, signal }),
  })
}

export function useDashboardAlerts(limit = 100, alertType?: string) {
  return useQuery({
    queryKey: [...dashboardKeys.alerts, limit, alertType],
    queryFn: ({ signal }) => apiGet<AlertsResponse>('/dashboard/alerts', { params: { limit, alert_type: alertType || undefined }, signal }),
    refetchInterval: 30_000,
  })
}

export function useMonitoringState() {
  return useQuery({ queryKey: dashboardKeys.monitoring, queryFn: ({ signal }) => apiGet<MonitoringState>('/dashboard/monitoring', { signal }), refetchInterval: 30_000 })
}

export function useLatestMonitoringRun() {
  return useQuery({ queryKey: [...dashboardKeys.runs, 'latest'], queryFn: ({ signal }) => apiGet<LatestRunResponse>('/monitoring/runs/latest', { signal }), refetchInterval: 30_000 })
}

export function useMonitoringRunHistory(limit = 20) {
  return useQuery({ queryKey: [...dashboardKeys.runs, 'history', limit], queryFn: ({ signal }) => apiGet<MonitoringRunsResponse>('/monitoring/runs', { params: { limit }, signal }) })
}

export function useTriggerMonitoringRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dayRange: number) => apiPost<MonitoringState['latest']>('/monitoring/runs/trigger', undefined, {
      params: { day_range: Math.min(10, Math.max(1, dayRange)) },
      timeout: LONG_OPERATION_TIMEOUT_MS,
    }),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.monitoring }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.firms }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.runs }),
    ]),
  })
}

export function useVnfCsvUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) => uploadFile<VnfUploadResult>('/vnf/upload', file, (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.classes }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.objects }),
    ]),
  })
}
