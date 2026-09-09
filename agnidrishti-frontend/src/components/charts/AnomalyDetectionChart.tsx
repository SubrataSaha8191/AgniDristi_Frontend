import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSourceAnomaly } from '../../services/sourceService'

function anomalyAssessment(data: Array<{ baseline: number; current: number }>) {
  const latest = data.at(-1)
  if (!latest || latest.baseline === 0) return null
  const deltaRatio = (latest.current - latest.baseline) / Math.abs(latest.baseline)
  const magnitude = Math.abs(deltaRatio)
  const trend = magnitude < 0.02 ? 'Within Baseline' : deltaRatio > 0 ? 'Above Baseline' : 'Below Baseline'
  if (magnitude >= 0.2) return { trend, label: 'High', className: 'border border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400', color: '#ef4444' }
  if (magnitude >= 0.1) return { trend, label: 'Medium', className: 'border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400', color: '#f59e0b' }
  return { trend, label: 'Low', className: 'border border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400', color: '#22c55e' }
}

export function AnomalyDetectionChart({ sourceId }: { sourceId: string }) {
  const { data = [], isLoading, isError } = useSourceAnomaly(sourceId)
  const assessment = anomalyAssessment(data)

  return (
    <section aria-label="Anomaly detection">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-2 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">Anomaly Detection</h3>
        {assessment && <span className={`px-2 py-0.5 text-[10px] font-black uppercase ${assessment.className}`}>{assessment.label} Severity</span>}
      </div>
      {assessment && <p className="mt-1 font-mono text-[11px] font-bold uppercase text-text-secondary">Trend: <span className="text-text-primary">{assessment.trend}</span></p>}
      {isLoading && <div className="mt-3 h-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" role="status" aria-label="Loading anomaly data" />}
      {isError && <p className="mt-3 text-xs font-bold text-danger">Unable to load anomaly data.</p>}
      {!isLoading && !isError && data.length === 0 && <p className="mt-3 grid h-36 place-items-center text-center text-xs font-bold text-text-secondary">At least two dated temperature observations are required for anomaly analysis.</p>}
      {!isLoading && !isError && data.length > 0 && assessment && (
        <div className="mt-2 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="#71717a" strokeDasharray="2 2" strokeOpacity={0.3} />
              <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={18} tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', fontSize: '11px', borderRadius: '0px' }} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#71717a" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="current" name="Current" stroke={assessment.color} strokeWidth={2.5} dot={{ r: 3, fill: assessment.color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
