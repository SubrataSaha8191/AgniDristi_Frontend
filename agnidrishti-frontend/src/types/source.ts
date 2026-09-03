export type SourceCategory =
  | 'industrial'
  | 'persistent'
  | 'new'
  | 'abnormal'
  | 'natural_biomass'
  | 'gas_flare'
  | 'unknown'

export interface SourceSummary {
  id: string
  category: SourceCategory
  industrySubtype: string | null
  confidence: number
  status: 'persistent' | 'new' | 'transient'
  anomalyLevel: 'low' | 'medium' | 'high'
  lat: number
  lon: number
}

export interface SourceDetail extends SourceSummary {
  firstDetected: string
  lastDetected: string
  district: string
  state: string
}

export interface KPISummary {
  totalSources: number
  persistentSources: number
  newSources: number
  abnormalSources: number
  industrialSources: number
  highRiskAlerts: number
  totalSourcesDeltaPct: number
}

export interface ActivityPoint {
  month: string
  detections: number
  avgTempK: number
}

export interface ThermalFingerprint {
  bins: { tempK: number; normalizedFreq: number }[]
  bestMatchIndustry: string
  similarityScore: number
}

export interface AnomalyPoint {
  date: string
  baseline: number
  current: number
}

export interface Alert {
  id: string
  sourceId: string
  type: 'high_anomaly' | 'new_persistent' | 'unusual_pattern' | 'new_industrial' | 'low_confidence'
  severity: 'low' | 'medium' | 'high'
  timestamp: string
}
