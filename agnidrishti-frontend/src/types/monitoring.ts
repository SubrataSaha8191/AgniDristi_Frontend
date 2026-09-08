export type GasFlareLikelihood = 'LIKELY' | 'POSSIBLE' | 'UNLIKELY'

export interface MonitoringRun {
  id?: number
  run_uid: string
  trigger_type: string
  attempt?: number | null
  retry_of_run_uid?: string | null
  status: string
  started_at: string | null
  finished_at: string | null
  duration_seconds: number | null
  fetched: number | null
  inserted: number | null
  duplicates?: number | null
  matched: number | null
  unmatched: number | null
  alerts_created: number | null
  error_message?: string | null
}

export interface MonitoringState {
  total_runs: number
  completed_runs: number
  failed_runs: number
  latest: MonitoringRun | null
}

export interface MonitoringRunsResponse { count: number; runs: MonitoringRun[] }
export type LatestRunResponse = MonitoringRun | { status: 'no_runs'; message: string }
