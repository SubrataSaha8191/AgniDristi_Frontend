// src/lib/mockGenerators.ts
// Deterministic per-source mock data generators.
// Same sourceId always produces the same "random" data (seeded), so it feels
// realistic and stable across re-renders, without needing 32 hand-written JSON files.

import type { ActivityPoint, AnomalyPoint, SourceSummary, ThermalFingerprint } from '../types/source'

// Simple deterministic hash -> seed, so each source ID maps to a stable number
function seedFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Simple seeded pseudo-random generator (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MONTHS = ['2025-05', '2025-07', '2025-09', '2025-11', '2026-01', '2026-03']

export function generateActivityHistory(source: SourceSummary): ActivityPoint[] {
  const rand = mulberry32(seedFromString(source.id))
  // Persistent/industrial sources trend upward and steady; transient/natural sources are choppier
  const baseline = source.status === 'persistent' ? 15 : 6
  const growth = source.status === 'persistent' ? 1.4 : 0.3

  return MONTHS.map((month, i) => ({
    month,
    detections: Math.round(baseline + growth * i + rand() * 4),
    avgTempK: Math.round(320 + source.confidence * 0.3 + rand() * 15),
  }))
}

const TEMP_BINS = [300, 310, 320, 330, 340, 350, 360]

// Rough industry "shape" templates — unimodal vs bimodal peak position, purely for visual variety
const INDUSTRY_TEMPLATES: Record<string, number[]> = {
  'Steel Plant': [0.03, 0.08, 0.16, 0.22, 0.28, 0.14, 0.06],
  'Cement Works': [0.05, 0.14, 0.24, 0.26, 0.16, 0.09, 0.04],
  'Thermal Power Station': [0.08, 0.2, 0.28, 0.2, 0.12, 0.08, 0.04],
  'Refinery': [0.1, 0.22, 0.24, 0.18, 0.12, 0.09, 0.05],
  default: [0.06, 0.12, 0.2, 0.24, 0.18, 0.12, 0.06],
}

export function generateThermalFingerprint(source: SourceSummary): ThermalFingerprint {
  const rand = mulberry32(seedFromString(source.id + 'fp'))

  // Natural/biomass/unknown sources have no meaningful industry "best match" —
  // classification should not fabricate an industrial identity for them.
  const isIndustrial = source.category === 'industrial' || source.category === 'persistent' || source.category === 'gas_flare'

  const templateKey = source.industrySubtype && INDUSTRY_TEMPLATES[source.industrySubtype]
    ? source.industrySubtype
    : 'default'
  const template = INDUSTRY_TEMPLATES[templateKey]

  const bins = TEMP_BINS.map((tempK, i) => ({
    tempK,
    normalizedFreq: Math.max(0.01, template[i] + (rand() - 0.5) * 0.03),
  }))

  return {
    bins,
    bestMatchIndustry: isIndustrial ? (source.industrySubtype ?? 'Unclassified Industrial') : 'No industrial match',
    similarityScore: isIndustrial ? Math.round(78 + rand() * 18) : Math.round(20 + rand() * 25),
  }
}

const ANOMALY_DATES = ['2025-04-15', '2025-06-15', '2025-08-15', '2025-10-15', '2025-12-15', '2026-03-05']

export interface NearbyFacility {
  name: string
  type: string
  industry: string
  distanceKm: number
  direction: string
  nearbyInfrastructure: string
}

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const INFRASTRUCTURE = ['Rail siding', 'High-voltage substation', 'National highway', 'Port access road', 'None identified', 'Water pipeline']
const FACILITY_NAME_PREFIXES = ['East Ridge', 'Dhanbad', 'Kandra', 'North Basin', 'Riverside', 'Ganga Belt', 'Hill View', 'Central', 'Sundarban', 'Bardhaman']
const FACILITY_TYPES: { type: string; industry: string }[] = [
  { type: 'Industrial plant', industry: 'Steel manufacturing' },
  { type: 'Power station', industry: 'Thermal power' },
  { type: 'Storage terminal', industry: 'Petroleum storage' },
  { type: 'Industrial plant', industry: 'Brick production' },
  { type: 'Processing unit', industry: 'Cement manufacturing' },
  { type: 'Refinery', industry: 'Oil & gas' },
  { type: 'Foundry', industry: 'Metal casting' },
  { type: 'Mill', industry: 'Paper & pulp' },
]

export function generateNearbyFacilities(source: SourceSummary, count = 4): NearbyFacility[] {
  const rand = mulberry32(seedFromString(source.id + 'facilities'))
  const facilities: NearbyFacility[] = []
  const usedNames = new Set<string>()

  for (let i = 0; i < count; i++) {
    let prefix = FACILITY_NAME_PREFIXES[Math.floor(rand() * FACILITY_NAME_PREFIXES.length)]
    while (usedNames.has(prefix)) {
      prefix = FACILITY_NAME_PREFIXES[Math.floor(rand() * FACILITY_NAME_PREFIXES.length)]
    }
    usedNames.add(prefix)

    const typeInfo = FACILITY_TYPES[Math.floor(rand() * FACILITY_TYPES.length)]
    const distanceKm = Math.round((1.5 + rand() * 13) * 10) / 10
    const direction = DIRECTIONS[Math.floor(rand() * DIRECTIONS.length)]
    const nearbyInfrastructure = INFRASTRUCTURE[Math.floor(rand() * INFRASTRUCTURE.length)]
    const suffix = typeInfo.type === 'Storage terminal' ? 'Depot'
      : typeInfo.type === 'Power station' ? 'Thermal Station'
      : typeInfo.type === 'Refinery' ? 'Refinery'
      : typeInfo.type === 'Mill' ? 'Mill'
      : typeInfo.type === 'Foundry' ? 'Foundry'
      : 'Works'

    facilities.push({
      name: `${prefix} ${suffix}`,
      type: typeInfo.type,
      industry: typeInfo.industry,
      distanceKm,
      direction,
      nearbyInfrastructure,
    })
  }

  return facilities.sort((a, b) => a.distanceKm - b.distanceKm)
}

export function generateAnomalyTrend(source: SourceSummary): AnomalyPoint[] {
  const rand = mulberry32(seedFromString(source.id + 'anomaly'))
  const isHigh = source.anomalyLevel === 'high'
  const isMedium = source.anomalyLevel === 'medium'

  let baseline = 8
  let current = 8

  return ANOMALY_DATES.map(() => {
    baseline += rand() * 2
    const drift = isHigh ? 2.2 : isMedium ? 1.1 : 0.4
    current += drift + (rand() - 0.4) * 1.5
    return {
      date: ANOMALY_DATES[0], // overwritten below; placeholder to satisfy type during map
      baseline: Math.round(baseline * 10) / 10,
      current: Math.round(current * 10) / 10,
    }
  }).map((point, i) => ({ ...point, date: ANOMALY_DATES[i] }))
}
