import type { ActivityPoint, AnomalyPoint, ThermalFingerprint } from '../types/source'

function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return Math.abs(hash)
}

const INDUSTRIES = ['Steel Plant Smelter', 'Refinery Flare Unit', 'Coal Washery Kiln', 'Biomass Thermal Source', 'Cement Processing Plant']

export function generateMockHistory(sourceId: string): ActivityPoint[] {
  const seed = hashStr(sourceId)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((m, idx) => ({
    month: m,
    detections: 10 + ((seed + idx * 7) % 35),
    avgTempK: 340 + ((seed * 3 + idx * 19) % 130),
  }))
}

export interface BackendObjectDetail {
  classification?: { label?: string; confidence?: number }
  temperature?: { min?: number; max?: number; mean?: number }
  temporal?: { detection_count?: number; active_months?: number }
  activity?: {
    detection_count?: number
    active_months?: number
    persistence_ratio?: number
    source_persistence_ratio?: number
    mean_temperature?: number
    maximum_temperature?: number
  }
  monthly_detection_history?: {
    month_count?: number
    total_detections?: number
    months?: Array<{
      month?: string
      detection_count?: number
      average_temperature?: number
      minimum_temperature?: number
      maximum_temperature?: number
    }>
  }
  thermal_fingerprint?: Record<string, number> | null
  recent_firms?: Array<{ acq_date?: string; bright_ti4?: number; confidence?: number }>
  recent_vnf?: Array<{ mscan_date?: string; temp_primary?: number }>
  anomaly_history?: Array<{ date?: string; baseline?: number; current?: number }>
}

export function generateMockFingerprint(sourceId: string, industrySubtype?: string | null): ThermalFingerprint {
  const seed = hashStr(sourceId)
  const industry = industrySubtype && industrySubtype !== 'Thermal Object' ? industrySubtype : INDUSTRIES[seed % INDUSTRIES.length]
  const score = 70 + (seed % 28)
  const baseTemp = 310 + (seed % 160)
  const step = 35 + (seed % 25)

  const shapeType = seed % 5
  let rawFreqs: number[]
  if (shapeType === 0) {
    rawFreqs = [95 - (seed % 10), 65 + (seed % 15), 35 + (seed % 10), 20 + (seed % 5), 10 + (seed % 5)]
  } else if (shapeType === 1) {
    rawFreqs = [15 + (seed % 10), 30 + (seed % 15), 55 + (seed % 15), 90 - (seed % 10), 40 + (seed % 15)]
  } else if (shapeType === 2) {
    rawFreqs = [80 - (seed % 15), 35 + (seed % 10), 90 - (seed % 10), 50 + (seed % 15), 25 + (seed % 10)]
  } else if (shapeType === 3) {
    rawFreqs = [60 + (seed % 15), 75 + (seed % 15), 85 - (seed % 10), 70 + (seed % 15), 55 + (seed % 15)]
  } else {
    rawFreqs = [25 + (seed % 10), 55 + (seed % 15), 98 - (seed % 5), 60 + (seed % 10), 20 + (seed % 10)]
  }

  return {
    bestMatchIndustry: industry,
    similarityScore: score,
    bins: rawFreqs.map((freq, idx) => ({ tempK: Math.round(baseTemp + idx * step), normalizedFreq: Math.min(100, Math.max(5, freq)) })),
  }
}

export function parseTemperatureBin(key: string): number | null {
  const exactValue = Number(key)
  if (Number.isFinite(exactValue)) return exactValue
  const values = key.match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) ?? []
  if (values.length === 0) return null
  if (values.length === 1) return values[0]
  return Math.round((values[0] + values[1]) / 2)
}

export function parseBackendFingerprint(d: BackendObjectDetail, subtype?: string | null): ThermalFingerprint | null {
  const cls = d.classification?.label ?? subtype
  const confidence = d.classification?.confidence
  const similarityScore = confidence == null ? 0 : Math.round(confidence * 100)

  if (d.thermal_fingerprint && Object.keys(d.thermal_fingerprint).length > 0) {
    const entries = Object.entries(d.thermal_fingerprint)
    const totalFrequency = entries.reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0)
    const bins = entries
      .map(([key, value]) => ({ tempK: parseTemperatureBin(key), normalizedFreq: totalFrequency > 0 ? Math.round((Math.max(0, Number(value) || 0) / totalFrequency) * 1000) / 10 : 0 }))
      .filter((bin): bin is { tempK: number; normalizedFreq: number } => bin.tempK !== null)
      .sort((a, b) => a.tempK - b.tempK)
    if (bins.length > 0) return { bestMatchIndustry: cls || 'Unclassified', similarityScore, bins }
  }

  const temps = (d.recent_firms ?? []).map((f) => f.bright_ti4).filter((t): t is number => typeof t === 'number' && t > 0)
  if (temps.length >= 3) {
    const minT = Math.min(...temps), maxT = Math.max(...temps), span = Math.max(20, maxT - minT), binWidth = span / 5, counts = [0, 0, 0, 0, 0]
    temps.forEach((t) => counts[Math.min(4, Math.max(0, Math.floor((t - minT) / binWidth)))]++)
    const maxCount = Math.max(...counts, 1)
    return {
      bestMatchIndustry: cls || 'Unclassified',
      similarityScore,
      bins: counts.map((c, i) => ({ tempK: Math.round(minT + i * binWidth + binWidth / 2), normalizedFreq: Math.round((c / maxCount) * 100) })),
    }
  }

  return null
}

export function generateMockAnomaly(sourceId: string): AnomalyPoint[] {
  const seed = hashStr(sourceId)
  const dates = ['09-01', '09-02', '09-03', '09-04', '09-05', '09-06']
  return dates.map((d, idx) => {
    const base = 330 + ((seed + idx * 5) % 40)
    const current = base + ((seed * 2 + idx * 11) % 65) - 15
    return { date: d, baseline: base, current: Math.max(310, current) }
  })
}
