import { describe, expect, it } from 'vitest'
import { normalizeAlertType, parseAlertsResponse, parseAlertTypesResponse } from '../src/services/alertService'

describe('alert API parsing', () => {
  it('handles zero actionable alerts', () => {
    const result = parseAlertsResponse({ count: 0, total: 0, limit: 50, offset: 0, has_more: false, alerts: [] })

    expect(result.alerts).toEqual([])
    expect(result.total).toBe(0)
    expect(result.count).toBe(0)
    expect(result.has_more).toBe(false)
  })

  it('preserves server pagination metadata when total exceeds the page size', () => {
    const result = parseAlertsResponse({ count: 50, total: 120, limit: 50, offset: 50, has_more: true, alerts: [] })

    expect(result).toMatchObject({ count: 50, total: 120, limit: 50, offset: 50, has_more: true })
  })

  it('accepts only the two actionable alert filters', () => {
    expect(normalizeAlertType(' repeated_unmatched ')).toBe('REPEATED_UNMATCHED')
    expect(normalizeAlertType('ABNORMAL_KNOWN_SOURCE')).toBe('ABNORMAL_KNOWN_SOURCE')
    expect(normalizeAlertType('UNMATCHED_ANOMALY')).toBeNull()
  })

  it('handles an empty alert-types response and removes unsupported types', () => {
    expect(parseAlertTypesResponse({ alert_types: [] })).toEqual([])
    expect(parseAlertTypesResponse({ types: ['REPEATED_UNMATCHED', 'UNMATCHED_ANOMALY', 'ABNORMAL_KNOWN_SOURCE'] })).toEqual([
      'REPEATED_UNMATCHED',
      'ABNORMAL_KNOWN_SOURCE',
    ])
  })

  it('drops retired alert records and safely parses missing optional identifiers', () => {
    const result = parseAlertsResponse({
      count: 2,
      total: 2,
      alerts: [
        { id: 1, alert_type: 'UNMATCHED_ANOMALY', firms_uid: 'legacy' },
        { id: 2, alert_type: 'REPEATED_UNMATCHED', latitude: 22.5, longitude: 88.3, created_at: '2026-09-09T04:50:33Z' },
      ],
    })

    expect(result.alerts).toHaveLength(1)
    expect(result.alerts[0]).toMatchObject({ id: 2, firms_uid: null, object_uid: null, latitude: 22.5, longitude: 88.3 })
  })
})
