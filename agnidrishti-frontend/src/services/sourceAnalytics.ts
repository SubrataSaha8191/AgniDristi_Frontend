import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { ActivityPoint, AnomalyPoint, ThermalFingerprint } from '../types/source'
import { parseBackendFingerprint } from './sourceMockAnalytics'
import type { BackendObjectDetail } from './sourceMockAnalytics'
import { useSourceDetail } from './sourceQuery'

const validNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function buildActivitySeries(detail: BackendObjectDetail): ActivityPoint[] {
  const completeHistory = (detail.monthly_detection_history?.months ?? []).flatMap((entry) => {
    if (!entry.month || !validNumber(entry.detection_count)) return []
    return [{
      month: entry.month.slice(0, 7),
      detections: entry.detection_count,
      avgTempK: validNumber(entry.average_temperature) ? entry.average_temperature : null,
      minTempK: validNumber(entry.minimum_temperature) ? entry.minimum_temperature : null,
      maxTempK: validNumber(entry.maximum_temperature) ? entry.maximum_temperature : null,
      scope: 'complete' as const,
    }]
  })
  if (completeHistory.length > 0) return completeHistory.sort((left, right) => left.month.localeCompare(right.month))

  const monthly = new Map<string, { count: number; temperatureTotal: number; temperatureCount: number }>()
  for (const detection of detail.recent_vnf ?? []) {
    if (!detection.mscan_date) continue
    const month = detection.mscan_date.slice(0, 7)
    const current = monthly.get(month) ?? { count: 0, temperatureTotal: 0, temperatureCount: 0 }
    current.count += 1
    if (validNumber(detection.temp_primary)) {
      current.temperatureTotal += detection.temp_primary
      current.temperatureCount += 1
    }
    monthly.set(month, current)
  }

  if (monthly.size === 0) {
    for (const detection of detail.recent_firms ?? []) {
      if (!detection.acq_date) continue
      const month = detection.acq_date.slice(0, 7)
      const current = monthly.get(month) ?? { count: 0, temperatureTotal: 0, temperatureCount: 0 }
      current.count += 1
      if (validNumber(detection.bright_ti4)) {
        current.temperatureTotal += detection.bright_ti4
        current.temperatureCount += 1
      }
      monthly.set(month, current)
    }
  }

  return [...monthly.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, values]) => ({
      month,
      detections: values.count,
      avgTempK: values.temperatureCount > 0 ? values.temperatureTotal / values.temperatureCount : null,
      scope: 'sample',
    }))
}

export function buildAnomalySeries(detail: BackendObjectDetail): AnomalyPoint[] {
  const supplied = (detail.anomaly_history ?? []).flatMap((point) => (
    point.date && validNumber(point.baseline) && validNumber(point.current)
      ? [{ date: point.date, baseline: point.baseline, current: point.current }]
      : []
  ))
  if (supplied.length > 0) return supplied

  const daily = new Map<string, { total: number; count: number }>()
  for (const detection of detail.recent_vnf ?? []) {
    if (!detection.mscan_date || !validNumber(detection.temp_primary)) continue
    const current = daily.get(detection.mscan_date) ?? { total: 0, count: 0 }
    current.total += detection.temp_primary
    current.count += 1
    daily.set(detection.mscan_date, current)
  }
  if (daily.size === 0) {
    for (const detection of detail.recent_firms ?? []) {
      if (!detection.acq_date || !validNumber(detection.bright_ti4)) continue
      const current = daily.get(detection.acq_date) ?? { total: 0, count: 0 }
      current.total += detection.bright_ti4
      current.count += 1
      daily.set(detection.acq_date, current)
    }
  }
  if (daily.size < 2) return []

  const currentByDate = [...daily.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, values]) => ({ date, current: values.total / values.count }))
  const baseline = currentByDate.reduce((sum, point) => sum + point.current, 0) / currentByDate.length
  return currentByDate.map((point) => ({ ...point, baseline }))
}

export function useSourceHistory(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-history', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async ({ signal }): Promise<ActivityPoint[]> => {
      if (!sourceId) return []
      const response = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`, { signal })
      return buildActivitySeries(response.data)
    },
  })
}

export function useSourceFingerprint(sourceId?: string | null) {
  const { data: detail } = useSourceDetail(sourceId)
  const subtype = detail?.industrySubtype
  return useQuery({
    queryKey: ['source-fingerprint', sourceId, subtype],
    enabled: Boolean(sourceId),
    queryFn: async ({ signal }): Promise<ThermalFingerprint | null> => {
      if (!sourceId) return null
      const response = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`, { signal })
      return parseBackendFingerprint(response.data, subtype)
    },
  })
}

export function useSourceAnomaly(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-anomaly', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async ({ signal }): Promise<AnomalyPoint[]> => {
      if (!sourceId) return []
      const response = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`, { signal })
      return buildAnomalySeries(response.data)
    },
  })
}
