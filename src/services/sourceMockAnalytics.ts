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

export function generateMockFingerprint(sourceId: string, industrySubtype?: string | null): ThermalFingerprint {
  const seed = hashStr(sourceId)
  const industry = industrySubtype && industrySubtype !== 'Thermal Object' ? industrySubtype : INDUSTRIES[seed % INDUSTRIES.length]
  const score = 82 + (seed % 17)
  const baseFreq = 20 + (seed % 30)
  return {
    bestMatchIndustry: industry,
    similarityScore: score,
    bins: [
      { tempK: 320, normalizedFreq: Math.min(100, baseFreq) },
      { tempK: 370, normalizedFreq: Math.min(100, baseFreq + 25) },
      { tempK: 420, normalizedFreq: Math.min(100, baseFreq + 45) },
      { tempK: 470, normalizedFreq: Math.min(100, baseFreq + 30) },
      { tempK: 520, normalizedFreq: Math.min(100, baseFreq + 10) },
    ],
  }
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
