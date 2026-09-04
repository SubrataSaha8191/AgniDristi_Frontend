import { Link } from 'react-router-dom'
import { useSources } from '../../services/sourceService'
import type { SourceCategory } from '../../types/source'

const trendRows: { label: string; category: SourceCategory; change: string; positive: boolean }[] = [
  { label: 'Industrial', category: 'industrial', change: '+7.1%', positive: true },
  { label: 'Natural / Biomass', category: 'natural_biomass', change: '+5.3%', positive: true },
  { label: 'Persistent', category: 'persistent', change: '+6.7%', positive: true },
  { label: 'Abnormal', category: 'abnormal', change: '+18.5%', positive: true },
  { label: 'Unknown', category: 'unknown', change: '-2.1%', positive: false },
  { label: 'Gas Flare / FIRMS detections', category: 'gas_flare', change: '+9.8%', positive: true },
  { label: 'New', category: 'new', change: '+12.4%', positive: true },
]

export function SourceTrendTable() {
  const { data: sources = [], isLoading } = useSources()

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="source-trend-heading">
      <div className="flex items-center justify-between gap-3"><h2 id="source-trend-heading" className="text-sm font-semibold text-text-primary">Source Trend (30 Days)</h2><Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View All</Link></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] uppercase tracking-wide text-text-secondary"><tr><th className="pb-2 font-medium">Source type</th><th className="pb-2 text-right font-medium">Count</th><th className="pb-2 text-right font-medium">Change</th></tr></thead><tbody className="divide-y divide-border">{trendRows.map((row) => <tr key={row.category}><td className="py-2 text-text-primary">{row.label}</td><td className="py-2 text-right font-mono text-text-secondary">{isLoading ? '...' : sources.filter((source) => source.category === row.category).length}</td><td className={`py-2 text-right font-mono ${row.positive ? 'text-success' : 'text-danger'}`}>{row.change}</td></tr>)}</tbody></table></div>
    </section>
  )
}
