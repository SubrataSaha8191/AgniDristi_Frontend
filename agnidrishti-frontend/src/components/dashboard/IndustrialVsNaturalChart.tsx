import { Link } from 'react-router-dom'
import { useSources } from '../../services/sourceService'
import type { SourceCategory } from '../../types/source'

const categoryDetails: { category: SourceCategory; label: string; color: string }[] = [
  { category: 'industrial', label: 'Industrial', color: '#f97316' },
  { category: 'natural_biomass', label: 'Natural / Biomass', color: '#16a34a' },
  { category: 'persistent', label: 'Persistent', color: '#2563eb' },
  { category: 'abnormal', label: 'Abnormal', color: '#dc2626' },
  { category: 'unknown', label: 'Unknown', color: '#94a3b8' },
  { category: 'gas_flare', label: 'Gas Flare / FIRMS', color: '#9333ea' },
  { category: 'new', label: 'New', color: '#d97706' },
]

export function IndustrialVsNaturalChart() {
  const { data: sources = [], isLoading } = useSources()
  const total = sources.length
  const slices = categoryDetails.map((detail) => ({ ...detail, count: sources.filter((source) => source.category === detail.category).length, percentage: total ? (sources.filter((source) => source.category === detail.category).length / total) * 100 : 0 }))
  const gradient = slices.reduce<{ offset: number; parts: string[] }>((result, slice) => {
    const start = result.offset
    const end = start + slice.percentage
    return { offset: end, parts: [...result.parts, `${slice.color} ${start}% ${end}%`] }
  }, { offset: 0, parts: [] }).parts.join(', ')

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="source-breakdown-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="source-breakdown-heading" className="text-sm font-semibold text-text-primary">Industrial vs Natural</h2>
        <Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View details →</Link>
      </div>
      {isLoading ? <div className="mt-5 h-32 animate-pulse rounded-lg bg-bg" role="status" aria-label="Loading source categories" /> : (
        <div className="mt-5 flex items-center justify-center gap-5">
          <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient || 'var(--color-border) 0 100%'})` }} aria-label={`All ${total} sources by category`} role="img">
            <div className="absolute inset-5 flex items-center justify-center rounded-full bg-surface"><span className="font-mono text-lg font-semibold text-text-primary">{total}</span></div>
          </div>
          <div className="grid gap-2 text-[10px] text-text-secondary">
            {slices.map((slice) => <p key={slice.category}><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />{slice.label} <span className="font-mono">{slice.percentage.toFixed(1)}%</span></p>)}
          </div>
        </div>
      )}
    </section>
  )
}
