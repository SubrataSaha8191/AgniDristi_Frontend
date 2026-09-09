import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, uploadFile } from '../lib/apiClient'
import type {
  ClassDistribution, DashboardMapResponse, DashboardSummary, DetectionActivityCalendarResponse, DetectionsByStateResponse, GasFlareLikelihood, LatestRunResponse,
  IndustryStatsResponse, MapDatesResponse, MapObjectScope, MonitoringRunsResponse, MonitoringState, RecentFirmsResponse, ThermalObjectDetail,
  ThermalObjectsResponse, VnfDetectionsResponse, VnfPersistence, VnfUploadResult,
} from '../types/dashboard'
import type { IndustryCategory } from '../lib/industryCategories'

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  classes: ['dashboard', 'classes'] as const,
  byState: ['dashboard', 'detections', 'byState'] as const,
  activityCalendar: (stateName: string, source: 'vnf' | 'firms' | 'all', year: number) => ['dashboard', 'stateActivity', stateName, source, year] as const,
  scopedActivityCalendar: (scope: ActivityCalendarScope, source: 'vnf' | 'firms' | 'all', year: number) => ['dashboard', 'scopedActivity', scope, source, year] as const,
  objects: ['dashboard', 'objects'] as const,
  detail: (id: string | null) => ['dashboard', 'object', id] as const,
  firms: ['dashboard', 'firms'] as const,
  industryStats: (category: IndustryCategory) => ['dashboard', 'industries', category, 'stats'] as const,
  alerts: ['dashboard', 'alerts'] as const,
  monitoring: ['dashboard', 'monitoring'] as const,
  runs: ['monitoring', 'runs'] as const,
  mapDates: (limit: number) => ['dashboard', 'map', 'dates', limit] as const,
  map: (date: string | null, range: string | null, objectScope: MapObjectScope, vnfLimit: number) => ['dashboard', 'map', date, range, objectScope, vnfLimit] as const,
  vnfDetections: (persistence: VnfPersistence, limit: number, offset: number) => ['dashboard', 'vnf', 'detections', persistence, limit, offset] as const,
  allVnfDetections: (persistence: VnfPersistence) => ['dashboard', 'vnf', 'detections', persistence, 'all'] as const,
}

export interface GeographicCategoryFilters {
  state_name?: string
  district_name?: string
  category?: IndustryCategory
}

export interface ObjectQuery extends GeographicCategoryFilters { limit: number; offset: number; classification?: string; source_hint?: string; gas_flare_likelihood?: GasFlareLikelihood | ''; likely_only?: boolean; gas_flare_only?: boolean }
export interface ActivityCalendarScope { stateName?: string; districtName?: string; factoryName?: string; category?: string }

export function useDashboardSummary() { return useQuery({ queryKey: dashboardKeys.summary, queryFn: ({ signal }) => apiGet<DashboardSummary>('/dashboard/summary', { signal }) }) }
export function useClassDistribution() { return useQuery({ queryKey: dashboardKeys.classes, queryFn: ({ signal }) => apiGet<ClassDistribution>('/dashboard/classes', { signal }) }) }
export function useDetectionsByState() { return useQuery({ queryKey: dashboardKeys.byState, queryFn: ({ signal }) => apiGet<DetectionsByStateResponse>('/dashboard/detections/by-state', { signal }), staleTime: 5 * 60_000 }) }
export function useDetectionActivityCalendar(stateName: string, source: 'vnf' | 'firms' | 'all' = 'all', year = new Date().getFullYear()) {
  return useQuery({
    queryKey: dashboardKeys.activityCalendar(stateName, source, year),
    enabled: Boolean(stateName),
    queryFn: ({ signal }) => apiGet<DetectionActivityCalendarResponse>(`/dashboard/states/${encodeURIComponent(stateName)}/activity-calendar`, { params: { source, year }, signal }),
    staleTime: 5 * 60_000,
  })
}
export function useScopedDetectionActivityCalendar(scope: ActivityCalendarScope, source: 'vnf' | 'firms' | 'all' = 'all', year = new Date().getFullYear()) {
  return useQuery({
    queryKey: dashboardKeys.scopedActivityCalendar(scope, source, year),
    enabled: Boolean(scope.stateName || scope.districtName || scope.category),
    queryFn: ({ signal }) => apiGet<DetectionActivityCalendarResponse>('/dashboard/activity-calendar', {
      params: {
        ...(scope.stateName ? { state_name: scope.stateName } : {}),
        ...(scope.districtName ? { district_name: scope.districtName } : {}),
        ...(scope.factoryName ? { factory_name: scope.factoryName } : {}),
        ...(scope.category ? { category: scope.category } : {}),
        source,
        year,
      },
      signal,
    }),
    staleTime: 5 * 60_000,
  })
}

export function useThermalObjects(query: ObjectQuery, enabled = true) {
  const { gas_flare_likelihood, likely_only, gas_flare_only, ...serverParams } = query
  return useQuery<ThermalObjectsResponse>({
    queryKey: [...dashboardKeys.objects, query],
    enabled,
    placeholderData: (previous: ThermalObjectsResponse | undefined) => previous,
    staleTime: 15 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }): Promise<ThermalObjectsResponse> => {
      const requested = likely_only ? 'LIKELY' : gas_flare_likelihood
      const params = { ...serverParams, ...(likely_only || gas_flare_only ? { gas_flare_only: true } : {}) }
      const response = await apiGet<ThermalObjectsResponse>('/dashboard/objects', { params: requested ? { ...params, limit: 5000, offset: 0 } : params, signal })
      if (!requested) return response
      const matching = response.objects.filter((object) => object.gas_flare_likelihood === requested)
      return { total: matching.length, limit: query.limit, offset: query.offset, objects: matching.slice(query.offset, query.offset + query.limit) }
    },
  })
}

export function useThermalObjectDetail(objectUid: string | null) {
  return useQuery({ queryKey: dashboardKeys.detail(objectUid), enabled: Boolean(objectUid), queryFn: ({ signal }) => apiGet<ThermalObjectDetail>(`/dashboard/objects/${encodeURIComponent(objectUid!)}`, { signal }) })
}

export function useRecentFirms(limit = 500, matchedOnly?: boolean, filters: GeographicCategoryFilters = {}) {
  return useQuery({ queryKey: [...dashboardKeys.firms, limit, matchedOnly, filters], queryFn: ({ signal }) => apiGet<RecentFirmsResponse>('/dashboard/firms/recent', { params: { limit, matched_only: matchedOnly, ...filters }, signal }) })
}

export function useIndustryStats(category: IndustryCategory) {
  return useQuery({
    queryKey: dashboardKeys.industryStats(category),
    queryFn: ({ signal }) => apiGet<IndustryStatsResponse>(`/dashboard/industries/${encodeURIComponent(category)}/stats`, { signal }),
    staleTime: 5 * 60_000,
  })
}

export function useMapDates(limit = 30) {
  return useQuery({
    queryKey: dashboardKeys.mapDates(limit),
    queryFn: ({ signal }) => apiGet<MapDatesResponse>('/dashboard/map/dates', { params: { limit }, signal }),
    staleTime: 5 * 60_000,
  })
}

export function useDashboardMap(date: string | null, objectScope: MapObjectScope, vnfLimit = 0, range: string | null = null) {
  return useQuery({
    queryKey: dashboardKeys.map(date, range, objectScope, vnfLimit),
    queryFn: ({ signal }) => apiGet<DashboardMapResponse>('/dashboard/map', {
      params: {
        ...(range ? { range } : date ? { date } : {}),
        object_scope: objectScope,
        vnf_limit: vnfLimit,
      },
      signal,
    }),
    placeholderData: (previous) => previous,
    staleTime: 5 * 60_000,
  })
}

export function useVnfDetections(persistence: VnfPersistence, limit = 10_000, offset = 0, enabled = true, filters: GeographicCategoryFilters = {}) {
  return useQuery({
    queryKey: [...dashboardKeys.vnfDetections(persistence, limit, offset), filters],
    enabled,
    queryFn: ({ signal }) => apiGet<VnfDetectionsResponse>('/dashboard/vnf/detections', {
      params: { persistence, limit, offset, ...filters },
      signal,
    }),
    placeholderData: (previous) => previous,
    staleTime: 5 * 60_000,
  })
}

export function useAllVnfDetections(persistence: VnfPersistence = 'both', filters: GeographicCategoryFilters = {}) {
  return useQuery({
    queryKey: [...dashboardKeys.allVnfDetections(persistence), filters],
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }): Promise<VnfDetectionsResponse> => {
      const pageSize = 10_000
      let offset = 0
      let firstPage: VnfDetectionsResponse | null = null
      let lastPage: VnfDetectionsResponse | null = null
      const detections = new Map<number, VnfDetectionsResponse['detections'][number]>()

      do {
        lastPage = await apiGet<VnfDetectionsResponse>('/dashboard/vnf/detections', { params: { persistence, limit: pageSize, offset, ...filters }, signal })
        firstPage ??= lastPage
        const sizeBefore = detections.size
        lastPage.detections.forEach((item) => detections.set(item.id, item))
        const added = detections.size - sizeBefore
        if (added === 0) break
        offset += lastPage.detections.length
      } while (lastPage.detections.length > 0 && detections.size < lastPage.total)

      const base = firstPage!
      const allDetections = Array.from(detections.values())
      return {
        ...base,
        limit: allDetections.length,
        offset: 0,
        detections: allDetections,
        counts: { ...base.counts, returned_detections: allDetections.length },
      }
    },
  })
}

export function useMonitoringState() { return useQuery({ queryKey: dashboardKeys.monitoring, queryFn: ({ signal }) => apiGet<MonitoringState>('/dashboard/monitoring', { signal }), refetchInterval: 30_000 }) }
export function useLatestMonitoringRun() { return useQuery({ queryKey: [...dashboardKeys.runs, 'latest'], queryFn: ({ signal }) => apiGet<LatestRunResponse>('/monitoring/runs/latest', { signal }), refetchInterval: 30_000 }) }
export function useMonitoringRunHistory(limit = 20) { return useQuery({ queryKey: [...dashboardKeys.runs, 'history', limit], queryFn: ({ signal }) => apiGet<MonitoringRunsResponse>('/monitoring/runs', { params: { limit }, signal }) }) }

export function useTriggerMonitoringRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dayRange: number) => apiPost<MonitoringState['latest']>('/monitoring/runs/trigger', undefined, { params: { day_range: Math.min(10, Math.max(1, dayRange)) } }),
    onSuccess: async () => Promise.all([queryClient.invalidateQueries({ queryKey: dashboardKeys.summary }), queryClient.invalidateQueries({ queryKey: dashboardKeys.monitoring }), queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts }), queryClient.invalidateQueries({ queryKey: dashboardKeys.firms }), queryClient.invalidateQueries({ queryKey: dashboardKeys.runs })]),
  })
}

export function useVnfCsvUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) => uploadFile<VnfUploadResult>('/vnf/upload', file, (event) => { if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100)) }),
    onSuccess: async () => Promise.all([queryClient.invalidateQueries({ queryKey: dashboardKeys.summary }), queryClient.invalidateQueries({ queryKey: dashboardKeys.classes }), queryClient.invalidateQueries({ queryKey: dashboardKeys.objects })]),
  })
}
