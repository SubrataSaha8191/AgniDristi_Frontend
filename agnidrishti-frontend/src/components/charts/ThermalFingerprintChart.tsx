import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSourceFingerprint } from '../../services/sourceService'

export function ThermalFingerprintChart({ sourceId }: { sourceId: string }) {
  const { data, isLoading, isError } = useSourceFingerprint(sourceId)

  return (
    <section aria-label="Thermal fingerprint">
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h3 className="text-xs font-semibold text-text-primary">Thermal Fingerprint</h3>
        {data && <span className="font-mono text-[10px] font-bold text-text-secondary">Match: <strong className="text-text-primary">{data.similarityScore}%</strong></span>}
      </div>
      {data && <p className="mt-1 text-[11px] font-mono font-bold text-text-secondary truncate">Subtype: <span className="text-text-primary">{data.bestMatchIndustry}</span></p>}
      {isLoading && <div className="mt-3 h-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" role="status" aria-label="Loading fingerprint" />}
      {isError && <p className="mt-3 text-xs font-bold text-danger">Unable to load fingerprint.</p>}
      {!isLoading && !isError && !data && <p className="mt-3 grid h-36 place-items-center text-center text-xs font-bold text-text-secondary">A thermal distribution was not supplied for this object.</p>}
      {data && !isError && (
        <div className="mt-2 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.bins} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="#71717a" strokeDasharray="2 2" strokeOpacity={0.3} />
              <XAxis dataKey="tempK" interval="preserveStartEnd" minTickGap={20} tickFormatter={(value: number) => `${Math.round(value)}`} tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'currentColor' }} tickLine={false} />
              <Tooltip cursor={{ fill: 'var(--color-bg)' }} contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', fontSize: '11px', borderRadius: '8px' }} />
              <Bar dataKey="normalizedFreq" name="Norm. Frequency %" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
