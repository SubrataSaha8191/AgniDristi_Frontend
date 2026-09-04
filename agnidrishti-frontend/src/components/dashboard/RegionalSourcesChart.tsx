import { Link } from 'react-router-dom'
import { regionForSource, REGIONS, useSources } from '../../services/sourceService'

export function RegionalSourcesChart({ expanded = false, showDetailsLink = true }: { expanded?: boolean; showDetailsLink?: boolean }) {
  const { data: sources = [], isLoading } = useSources()
  const regionalSources = REGIONS.map((region) => ({
    ...region,
    count: sources.filter((source) => {
      const assigned = regionForSource(source)
      return assigned.district === region.district && assigned.state === region.state
    }).length,
  }))
  const maxCount = Math.max(...regionalSources.map((region) => region.count), 1)

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-labelledby="regional-sources-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="regional-sources-heading" className="text-sm font-semibold text-text-primary">Regional thermal sources</h2>
        {showDetailsLink && <Link to="/assessment" className="text-xs font-medium text-accent hover:underline">View details →</Link>}
      </div>
      {isLoading ? <div className="mt-5 h-40 animate-pulse rounded-lg bg-bg" role="status" aria-label="Loading regional sources" /> : (
        <div className={`mt-5 grid grid-cols-2 gap-x-5 ${expanded ? 'gap-y-7 sm:grid-cols-4' : 'gap-y-4 sm:grid-cols-3'}`}>
          {regionalSources.map((region) => (
            <div key={region.district}>
              <div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-medium text-text-primary">{region.district}</span><span className="font-mono text-text-secondary">{region.count}</span></div>
              <p className="mt-0.5 truncate text-[9px] text-text-secondary">{region.state}</p>
              <div className={`${expanded ? 'mt-3 h-3' : 'mt-1.5 h-2'} rounded-full bg-bg`}><div className={`${expanded ? 'h-3' : 'h-2'} rounded-full bg-accent`} style={{ width: `${(region.count / maxCount) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && <p className="mt-4 text-right text-[10px] text-text-secondary">{sources.length} sources across all regions</p>}
    </section>
  )
}
