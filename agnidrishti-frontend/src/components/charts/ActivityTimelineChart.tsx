import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSourceHistory } from '../../services/sourceService'
import type { ActivityPoint } from '../../types/source'

function monthLabel(value: string) {
  const normalized = value.length >= 7 ? value.slice(0, 7) : value
  const date = new Date(`${normalized}-01T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date)
}

function temperature(value?: number | null) {
  return value == null ? 'Not available' : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} K`
}

function ActivityTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: ActivityPoint }> }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-2 text-[11px] text-zinc-50">
      <p className="font-black uppercase">{monthLabel(point.month)}</p>
      <p className="mt-1">Detections: {point.detections.toLocaleString()}</p>
      <p>Average: {temperature(point.avgTempK)}</p>
      {(point.minTempK != null || point.maxTempK != null) && <p>Range: {temperature(point.minTempK)} to {temperature(point.maxTempK)}</p>}
    </div>
  )
}

export function ActivityTimelineChart({ sourceId }: { sourceId: string }) {
  const { data = [], isLoading, isError } = useSourceHistory(sourceId)
  const completeHistory = data.length > 0 && data.every((point) => point.scope === 'complete')
  const totalDetections = data.reduce((sum, point) => sum + point.detections, 0)

  return (
    <section aria-label="Historical activity">
      <div className="flex items-center justify-between border-b border-black/10 pb-2 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">Historical Activity</h3>
        <span className="font-mono text-[10px] font-bold text-text-secondary">{sourceId}</span>
      </div>
      {isLoading && <div className="mt-3 h-44 animate-pulse bg-zinc-200 dark:bg-zinc-800" role="status" aria-label="Loading activity" />}
      {isError && <p className="mt-3 text-xs font-bold text-danger">Unable to load activity.</p>}
      {!isLoading && !isError && data.length === 0 && <p className="mt-3 grid h-44 place-items-center text-center text-xs font-bold text-text-secondary">Month-wise history is unavailable because this object has no dated detections.</p>}
      {!isLoading && !isError && data.length > 0 && (
        <>
          <p className="mt-2 text-[10px] font-bold uppercase text-text-secondary">{completeHistory ? `Complete history: ${data.length} months, ${totalDetections.toLocaleString()} detections` : `Recent sample: ${totalDetections.toLocaleString()} dated detections grouped by month`}</p>
          <div className="mt-3 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#71717a" strokeDasharray="2 2" strokeOpacity={0.3} />
                <XAxis dataKey="month" interval={0} tickFormatter={monthLabel} tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
                <YAxis yAxisId="detections" allowDecimals={false} tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} />
                <YAxis yAxisId="temperature" orientation="right" tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Bar yAxisId="detections" dataKey="detections" name="Detections" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Line yAxisId="temperature" type="monotone" dataKey="avgTempK" name="Avg temp (K)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
