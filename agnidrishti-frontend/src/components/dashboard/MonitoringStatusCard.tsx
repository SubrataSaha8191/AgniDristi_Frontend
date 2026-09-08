import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../../lib/axiosClient'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'

interface MonitoringResponse {
  total_runs: number
  completed_runs: number
  failed_runs: number
  latest: {
    run_uid: string
    trigger_type: string
    status: string
    started_at: string
    finished_at: string | null
    duration_seconds: number | null
    fetched: number
    inserted: number
    matched: number
    unmatched: number
    alerts_created: number
  } | null
}

function useMonitoringDashboard() {
  return useQuery({
    queryKey: ['dashboard-monitoring'],
    queryFn: async () => {
      const res = await axiosClient.get<MonitoringResponse>('/dashboard/monitoring')
      return res.data
    },
    refetchInterval: 60_000,
  })
}

function formatDt(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
  } catch {
    return iso
  }
}

export function MonitoringStatusCard() {
  const { data, isLoading, isError } = useMonitoringDashboard()

  return (
    <section className="rounded-none border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b-2 border-black dark:border-zinc-700 pb-3">
        <Activity size={18} className="text-black dark:text-white" />
        <h2 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">Monitoring Status</h2>
      </div>
      {isLoading && <div className="mt-4 h-24 animate-pulse bg-zinc-200 dark:bg-zinc-800" />}
      {isError && <p className="mt-4 text-xs font-bold text-danger">Unable to load monitoring data.</p>}
      {data && (() => {
        const total = data.total_runs ?? 0
        const failed = data.failed_runs ?? 0
        const completed = Math.max(0, total - failed)
        return (
          <div className="mt-4 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total Runs" value={total} />
              <Stat label="Completed" value={completed} icon={<CheckCircle2 size={14} className="text-success" />} />
              <Stat label="Failed" value={failed} icon={<XCircle size={14} className="text-danger" />} />
            </div>
            {data.latest && (
              <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-1 font-semibold text-black dark:text-white">
                <p className="font-bold uppercase text-black dark:text-white">Latest Status: {data.latest.status}</p>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300">Trigger: {data.latest.trigger_type} · {formatDt(data.latest.started_at)}</p>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300">Fetched {data.latest.fetched} · Inserted {data.latest.inserted} · Matched {data.latest.matched}</p>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300">Unmatched {data.latest.unmatched} · Alerts {data.latest.alerts_created}</p>
                {data.latest.duration_seconds != null && <p className="text-[11px] text-zinc-700 dark:text-zinc-300">Duration: {data.latest.duration_seconds.toFixed(1)}s</p>}
              </div>
            )}
          </div>
        )
      })()}
    </section>
  )
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-center text-black dark:text-white">
      <p className="flex items-center justify-center gap-1 font-bold uppercase text-xs text-black dark:text-white">{icon}{label}</p>
      <p className="mt-1 font-mono text-xl font-black text-black dark:text-white">{value}</p>
    </div>
  )
}

