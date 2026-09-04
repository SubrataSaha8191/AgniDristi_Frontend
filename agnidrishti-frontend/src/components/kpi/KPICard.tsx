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
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-text-primary">
            {value}
          </p>
        </div>
        <Icon className="shrink-0 text-accent" size={20} aria-hidden="true" />
      </div>
      <p className="mt-3 whitespace-nowrap text-[11px] text-text-secondary">
        <span className={deltaPct >= 0 ? 'text-success' : 'text-danger'}>{deltaLabel}</span>{' '}
        vs. previous period
      </p>
    </article>
  )
}
