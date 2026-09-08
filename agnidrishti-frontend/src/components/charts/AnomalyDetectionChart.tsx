import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSourceAnomaly, useSourceDetail } from '../../services/sourceService'

function getSeverityStyle(level: string) {
  const norm = level.toLowerCase()
  if (norm === 'high') return { label: 'High', className: 'border border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' }
  if (norm === 'medium') return { label: 'Medium', className: 'border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' }
  return { label: 'Low', className: 'border border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' }
}

export function AnomalyDetectionChart({ sourceId, anomalyLevel }: { sourceId: string; anomalyLevel?: string }) {
  const { data = [], isLoading, isError } = useSourceAnomaly(sourceId)
  const { data: detail } = useSourceDetail(sourceId)
  const activeLevel = anomalyLevel ?? detail?.anomalyLevel ?? 'low'
  const severity = getSeverityStyle(activeLevel)
  const isElevated = activeLevel === 'high' || activeLevel === 'medium'
  const trend = data.length > 0 && isElevated ? 'Above Baseline' : 'Normal Baseline'

  return (
    <section aria-label="Anomaly detection">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-zinc-800 pb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">Anomaly Detection</h3>
        {!isLoading && !isError && <span className={`rounded-none px-2 py-0.5 text-[10px] font-black uppercase ${severity.className}`}>{severity.label} Severity</span>}
      </div>
      {!isLoading && !isError && <p className="mt-1 text-[11px] font-mono font-bold text-text-secondary uppercase">Trend: <span className="text-text-primary">{trend}</span></p>}
      {isLoading && <div className="mt-3 h-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" role="status" aria-label="Loading anomaly data" />}
      {isError && <p className="mt-3 text-xs font-bold text-danger">Unable to load anomaly data.</p>}
      {!isLoading && !isError && (
        <div className="mt-2 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="#71717a" strokeDasharray="2 2" strokeOpacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', fontSize: '11px', borderRadius: '0px' }} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#71717a" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="current" name="Current" stroke={activeLevel === 'high' ? '#ef4444' : activeLevel === 'medium' ? '#f59e0b' : '#22c55e'} strokeWidth={2.5} dot={{ r: 3, fill: activeLevel === 'high' ? '#ef4444' : activeLevel === 'medium' ? '#f59e0b' : '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
