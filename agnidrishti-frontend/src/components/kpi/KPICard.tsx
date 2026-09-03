import type { LucideIcon } from 'lucide-react'

type KPICardProps = {
  label: string
  value: number | string
  deltaPct: number
  icon: LucideIcon
}

export function KPICard({ label, value, deltaPct, icon: Icon }: KPICardProps) {
  const deltaLabel = `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`

  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-text-primary">
            {value}
          </p>
        </div>
        <Icon className="text-accent" size={22} aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs text-text-secondary">
        <span className={deltaPct >= 0 ? 'text-success' : 'text-danger'}>{deltaLabel}</span>{' '}
        vs. previous period
      </p>
    </article>
  )
}
