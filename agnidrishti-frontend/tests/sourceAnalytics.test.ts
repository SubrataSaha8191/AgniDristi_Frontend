import { describe, expect, it } from 'vitest'
import { buildActivitySeries, buildAnomalySeries } from '../src/services/sourceAnalytics'
import { parseBackendFingerprint, parseTemperatureBin } from '../src/services/sourceMockAnalytics'

const suppliedObject = {
  classification: { label: 'Metallurgical', confidence: 0.6408 },
  activity: {
    detection_count: 782,
    active_months: 9,
    persistence_ratio: 1,
    source_persistence_ratio: 1,
    mean_temperature: 1135.36,
    maximum_temperature: 2084.32,
  },
}

describe('source analytics adapters', () => {
  it('uses the complete backend monthly history before the limited recent sample', () => {
    expect(buildActivitySeries({
      ...suppliedObject,
      monthly_detection_history: {
        month_count: 2,
        total_detections: 554,
        months: [
          { month: '2025-12-01', detection_count: 237, average_temperature: 823.46, minimum_temperature: 594.26, maximum_temperature: 1415.01 },
          { month: '2026-01-01', detection_count: 317, average_temperature: 839.51, minimum_temperature: 405.33, maximum_temperature: 1778.46 },
        ],
      },
      recent_vnf: [{ mscan_date: '2026-01-20', temp_primary: 700 }],
    })).toEqual([
      { month: '2025-12', detections: 237, avgTempK: 823.46, minTempK: 594.26, maxTempK: 1415.01, scope: 'complete' },
      { month: '2026-01', detections: 317, avgTempK: 839.51, minTempK: 405.33, maxTempK: 1778.46, scope: 'complete' },
    ])
  })

  it('groups real VNF detections by month with their monthly mean temperature', () => {
    expect(buildActivitySeries({
      ...suppliedObject,
      recent_vnf: [
        { mscan_date: '2026-05-09', temp_primary: 1000 },
        { mscan_date: '2026-05-21', temp_primary: 1200 },
        { mscan_date: '2026-06-02', temp_primary: 1500 },
      ],
    })).toEqual([
      { month: '2026-05', detections: 2, avgTempK: 1100, scope: 'sample' },
      { month: '2026-06', detections: 1, avgTempK: 1500, scope: 'sample' },
    ])
  })

  it('converts temperature ranges to their midpoint instead of concatenating digits', () => {
    expect(parseTemperatureBin('450-500')).toBe(475)
    expect(parseTemperatureBin('800_850 K')).toBe(825)
  })

  it('preserves the classification confidence and normalizes real fingerprint bins', () => {
    expect(parseBackendFingerprint({
      ...suppliedObject,
      thermal_fingerprint: { '450-500': 4, '500-550': 8 },
    })).toEqual({
      bestMatchIndustry: 'Metallurgical',
      similarityScore: 64,
      bins: [
        { tempK: 475, normalizedFreq: 33.3 },
        { tempK: 525, normalizedFreq: 66.7 },
      ],
    })
  })

  it('does not invent a fingerprint or anomaly series when the payload lacks them', () => {
    expect(parseBackendFingerprint(suppliedObject)).toBeNull()
    expect(buildAnomalySeries(suppliedObject)).toEqual([])
  })

  it('calculates an anomaly baseline from the same dated temperature series', () => {
    expect(buildAnomalySeries({
      recent_firms: [
        { acq_date: '2026-09-07', bright_ti4: 300 },
        { acq_date: '2026-09-08', bright_ti4: 360 },
      ],
    })).toEqual([
      { date: '2026-09-07', current: 300, baseline: 330 },
      { date: '2026-09-08', current: 360, baseline: 330 },
    ])
  })
})
