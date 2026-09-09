import { MAP_CATEGORY_COLORS, MAP_CATEGORY_LABELS, getMapCategory } from '../../lib/mapColors'
import type { SourceDetail } from '../../types/source'

export function DetailField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-border py-2.5 last:border-b-0">
      <dt className="text-[10px] font-semibold text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-xs font-mono font-bold text-text-primary">{value}</dd>
    </div>
  )
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[10px] font-mono font-semibold text-text-primary">
      <span className="h-2 w-2 border border-border shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  )
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 80) return '#22C55E'
  if (confidence >= 50) return '#F59E0B'
  return '#EF4444'
}

const PERSISTENCE_COLORS = { persistent: '#A855F7', new: '#3B82F6', transient: '#64748B' } as const
const ANOMALY_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' } as const

export function SourceStatusSummary({ source }: { source: SourceDetail }) {
  const mapCategory = getMapCategory(source.category)
  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Source status summary">
      <StatusBadge label={MAP_CATEGORY_LABELS[mapCategory]} color={MAP_CATEGORY_COLORS[mapCategory]} />
      <StatusBadge label={source.status} color={PERSISTENCE_COLORS[source.status]} />
      <StatusBadge label={`${source.confidence}% confidence`} color={getConfidenceColor(source.confidence)} />
      <StatusBadge label={`${source.anomalyLevel} anomaly`} color={ANOMALY_COLORS[source.anomalyLevel]} />
    </div>
  )
}
