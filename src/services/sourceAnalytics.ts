import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import type { ActivityPoint, AnomalyPoint, ThermalFingerprint } from '../types/source'
import { generateMockAnomaly, generateMockFingerprint, generateMockHistory } from './sourceMockAnalytics'
import { useSourceDetail } from './sourceQuery'

interface BackendObjectDetail {
  classification?: { label?: string; confidence?: number }
  temperature?: { min?: number; max?: number; mean?: number }
  temporal?: { detection_count?: number }
  recent_firms?: Array<{ acq_date?: string; bright_ti4?: number; confidence?: number }>
}

export function useSourceHistory(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-history', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<ActivityPoint[]> => {
      if (!sourceId) return []
      try {
        const res = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`)
        const firms = res.data.recent_firms ?? []
        if (firms.length > 0) {
          const map = new Map<string, { count: number; sumTemp: number }>()
          firms.forEach((f) => {
            const m = (f.acq_date ?? '2026-09').slice(5, 7)
            const cur = map.get(m) ?? { count: 0, sumTemp: 0 }
            map.set(m, { count: cur.count + 1, sumTemp: cur.sumTemp + (f.bright_ti4 ?? 350) })
          })
          return Array.from(map.entries()).map(([month, val]) => ({ month, detections: val.count, avgTempK: Math.round(val.sumTemp / val.count) }))
        }
        return generateMockHistory(sourceId)
      } catch {
        return generateMockHistory(sourceId)
      }
    },
  })
}

export function useSourceFingerprint(sourceId?: string | null) {
  const { data: detail } = useSourceDetail(sourceId)
  const subtype = detail?.industrySubtype
  return useQuery({
    queryKey: ['source-fingerprint', sourceId, subtype],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<ThermalFingerprint> => {
      if (!sourceId) return generateMockFingerprint('THERM_DEFAULT', subtype)
      try {
        const res = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`)
        const d = res.data
        const cls = d.classification?.label ?? subtype
        const conf = Math.round((d.classification?.confidence ?? 0.85) * 100)
        const tMean = d.temperature?.mean ?? 400
        const mock = generateMockFingerprint(sourceId, cls)
        return {
          bestMatchIndustry: cls || mock.bestMatchIndustry,
          similarityScore: conf > 0 ? conf : mock.similarityScore,
          bins: [
            { tempK: Math.round(tMean * 0.8), normalizedFreq: 25 },
            { tempK: Math.round(tMean * 0.9), normalizedFreq: 55 },
            { tempK: Math.round(tMean), normalizedFreq: 95 },
            { tempK: Math.round(tMean * 1.1), normalizedFreq: 60 },
            { tempK: Math.round(tMean * 1.2), normalizedFreq: 30 },
          ],
        }
      } catch {
        return generateMockFingerprint(sourceId, subtype)
      }
    },
  })
}

export function useSourceAnomaly(sourceId?: string | null) {
  return useQuery({
    queryKey: ['source-anomaly', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<AnomalyPoint[]> => {
      if (!sourceId) return []
      try {
        const res = await axiosClient.get<BackendObjectDetail>(`/dashboard/objects/${encodeURIComponent(sourceId)}`)
        const firms = res.data.recent_firms ?? []
        const baseTemp = res.data.temperature?.mean ?? 330
        if (firms.length > 0) {
          return firms.slice(0, 6).map((f, i) => ({
            date: (f.acq_date ?? `09-0${i + 1}`).slice(5, 10),
            baseline: Math.round(baseTemp),
            current: Math.round(f.bright_ti4 ?? baseTemp + 20),
          }))
        }
        return generateMockAnomaly(sourceId)
      } catch {
        return generateMockAnomaly(sourceId)
      }
    },
  })
}
