import type { Alert } from '../types/source'

export function formatAlertTimestamp(timestamp?: string | null) {
  if (!timestamp) return 'Not available'
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? timestamp : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function alertMapHref(alert: Pick<Alert, 'latitude' | 'longitude'>) {
  if (alert.latitude === null || alert.longitude === null) return null
  const latitude = encodeURIComponent(String(alert.latitude))
  const longitude = encodeURIComponent(String(alert.longitude))
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`
}
