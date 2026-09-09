import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/apiClient'
import type { Alert, AlertType } from '../types/source'

export const ALERT_TYPES: readonly AlertType[] = ['REPEATED_UNMATCHED', 'ABNORMAL_KNOWN_SOURCE']

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  REPEATED_UNMATCHED: 'Repeated Unknown Activity',
  ABNORMAL_KNOWN_SOURCE: 'Abnormal Known Source',
}

export const GLOBAL_ALERTS_EMPTY_MESSAGE = 'No actionable alerts currently. New unmatched detections remain visible on the monitoring map and become alerts only when repeated activity is confirmed.'
export const FILTERED_ALERTS_EMPTY_MESSAGE = 'No alerts match the selected type.'

export interface AlertsResponse {
  count: number
  total: number
  limit: number
  offset: number
  has_more: boolean
  filters: {
    alert_type: string | null
    matched_alert_types: AlertType[]
  }
  alerts: Alert[]
}

export interface AlertQuery {
  alertTypes?: AlertType[]
  limit?: number
  offset?: number
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const finiteNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null
const optionalString = (value: unknown): string | null => typeof value === 'string' && value.length > 0 ? value : null

export function isAlertType(value: unknown): value is AlertType {
  return typeof value === 'string' && ALERT_TYPES.includes(value.trim().toUpperCase() as AlertType)
}

export function normalizeAlertType(value: string): AlertType | null {
  const normalized = value.trim().toUpperCase()
  return isAlertType(normalized) ? normalized : null
}

export function parseAlert(value: unknown): Alert | null {
  if (!isRecord(value) || !isAlertType(value.alert_type)) return null
  const id = finiteNumber(value.id)
  if (id === null) return null

  return {
    id,
    alert_type: value.alert_type.trim().toUpperCase() as AlertType,
    firms_uid: optionalString(value.firms_uid),
    object_uid: optionalString(value.object_uid),
    latitude: finiteNumber(value.latitude),
    longitude: finiteNumber(value.longitude),
    severity: optionalString(value.severity),
    message: optionalString(value.message),
    resolved: value.resolved === true,
    created_at: optionalString(value.created_at),
  }
}

export function parseAlertsResponse(value: unknown, requestedLimit = 50, requestedOffset = 0): AlertsResponse {
  const payload = isRecord(value) ? value : {}
  const rawAlerts = Array.isArray(payload.alerts) ? payload.alerts : []
  const alerts = rawAlerts.map(parseAlert).filter((alert): alert is Alert => alert !== null)
  const responseLimit = finiteNumber(payload.limit)
  const responseOffset = finiteNumber(payload.offset)
  const responseTotal = finiteNumber(payload.total)
  const responseCount = finiteNumber(payload.count)
  const limit = Math.min(1000, Math.max(1, responseLimit ?? requestedLimit))
  const offset = Math.max(0, responseOffset ?? requestedOffset)
  const count = Math.max(0, responseCount ?? alerts.length)
  const total = Math.max(count, responseTotal ?? count)
  const filters = isRecord(payload.filters) ? payload.filters : {}
  const matchedAlertTypes = Array.isArray(filters.matched_alert_types)
    ? filters.matched_alert_types.filter(isAlertType).map((type) => type.trim().toUpperCase() as AlertType)
    : []

  return {
    count,
    total,
    limit,
    offset,
    has_more: typeof payload.has_more === 'boolean' ? payload.has_more : offset + count < total,
    filters: {
      alert_type: optionalString(filters.alert_type),
      matched_alert_types: matchedAlertTypes,
    },
    alerts,
  }
}

export function parseAlertTypesResponse(value: unknown): AlertType[] {
  const payload = isRecord(value) ? value : null
  const candidates = Array.isArray(value)
    ? value
    : Array.isArray(payload?.alert_types)
      ? payload.alert_types
      : Array.isArray(payload?.types)
        ? payload.types
        : []

  return [...new Set(candidates.map((candidate) => isRecord(candidate) ? candidate.alert_type : candidate).filter(isAlertType).map((type) => type.trim().toUpperCase() as AlertType))]
}

export function useAlertTypes() {
  return useQuery({
    queryKey: ['dashboard', 'alerts', 'types'],
    queryFn: async ({ signal }) => parseAlertTypesResponse(await apiGet<unknown>('/dashboard/alerts/types', { signal })),
    staleTime: 30_000,
  })
}

export function useAlerts({ alertTypes = [], limit = 50, offset = 0 }: AlertQuery = {}) {
  const safeLimit = Math.min(1000, Math.max(1, Math.trunc(limit)))
  const safeOffset = Math.max(0, Math.trunc(offset))
  const normalizedTypes = alertTypes.filter(isAlertType)
  const alertType = normalizedTypes.length > 0 ? normalizedTypes.join(',') : undefined

  return useQuery({
    queryKey: ['dashboard', 'alerts', { alertType, limit: safeLimit, offset: safeOffset }],
    queryFn: async ({ signal }) => parseAlertsResponse(
      await apiGet<unknown>('/dashboard/alerts', {
        params: { limit: safeLimit, offset: safeOffset, ...(alertType ? { alert_type: alertType } : {}) },
        signal,
      }),
      safeLimit,
      safeOffset,
    ),
    refetchInterval: 30_000,
  })
}
