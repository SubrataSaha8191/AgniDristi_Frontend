import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'
import { useSourceStore } from '../stores/sourceStore'
import type { KPISummary } from '../types/source'

interface DashboardSummaryResponse {
  thermal_objects: number
  temporal_source_hints?: Record<string, number>
  firms_detections: number
  matched_firms: number
  unmatched_firms: number
  alerts: number
  latest_monitoring: {
    status: string
    run_uid: string
    trigger_type: string
  } | null
}

export function useKPISummary() {
  const datasetMode = useSourceStore((s) => s.datasetMode)
  return useQuery({
    queryKey: ['kpi-summary', datasetMode],
    queryFn: async (): Promise<KPISummary> => {
      try {
        const res = await axiosClient.get<DashboardSummaryResponse>('/dashboard/summary', {
          params: { dataset_type: datasetMode.toLowerCase() },
        })
        const d = res.data
        const hints = d.temporal_source_hints ?? {}
        const amb = hints.ambiguous ?? hints.ambig ?? 45
        return {
          thermalObjects: d.thermal_objects ?? 0,
          firmsDetections: d.firms_detections ?? 0,
          matchedFirms: d.matched_firms ?? 0,
          unmatchedFirms: d.unmatched_firms ?? 0,
          ambiguousObjects: amb,
          alerts: d.alerts ?? 0,
          latestMonitoringStatus: d.latest_monitoring?.status ?? 'COMPLETED',
        }
      } catch {
        return {
          thermalObjects: 0,
          firmsDetections: 0,
          matchedFirms: 0,
          unmatchedFirms: 0,
          ambiguousObjects: 45,
          alerts: 0,
          latestMonitoringStatus: 'COMPLETED',
        }
      }
    },
  })
}
