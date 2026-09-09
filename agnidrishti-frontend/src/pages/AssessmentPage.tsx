import { StateDistrictDetectionsWidget } from '../components/dashboard/StateDistrictDetectionsWidget'
import { SectionHeading } from '../components/common/SectionHeading'
import { useVnfMonthlyCounts } from '../services/dashboardService'
import { useKPISummary } from '../services/kpiService'

function monthLabel(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function AssessmentPage() {
  const { data: summary } = useKPISummary()
  const monthlyQuery = useVnfMonthlyCounts()
  const months = [...(monthlyQuery.data?.months ?? [])].sort((a, b) => a.month.localeCompare(b.month))

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold text-text-primary">EVENT ASSESSMENT &amp; MONITORING DATA</h1>
        <p className="mt-2 text-xs font-medium text-text-secondary">REAL-TIME SATELLITE MATCHING SUMMARY &amp; MONTHLY VNF DETECTION VOLUME</p>
      </header>

      <section aria-label="Monitoring Assessment Overview">
        <SectionHeading num="01" title="SATELLITE MONITORING OVERVIEW" subtitle="Automated satellite telemetry and matching overview" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-4"><p className="text-[10px] font-medium text-text-secondary">TOTAL DETECTIONS</p><p className="mt-2 font-mono text-2xl font-semibold">{summary?.firmsDetections ?? 0}</p></div>
          <div className="rounded-lg border border-border bg-surface p-4"><p className="text-[10px] font-medium text-text-secondary">MATCHED TO SOURCES</p><p className="mt-2 font-mono text-2xl font-semibold text-emerald-700">{summary?.matchedFirms ?? 0}</p></div>
          <div className="rounded-lg border border-border bg-surface p-4"><p className="text-[10px] font-medium text-text-secondary">UNMATCHED DETECTIONS</p><p className="mt-2 font-mono text-2xl font-semibold text-red-600">{summary?.unmatchedFirms ?? 0}</p></div>
        </div>
      </section>

      <section aria-label="Regional Distribution">
        <SectionHeading num="02" title="REGIONAL &amp; ADMINISTRATIVE ASSESSMENT" subtitle="Live state and district thermal detection breakdown from database" />
        <div className="grid items-stretch gap-6"><StateDistrictDetectionsWidget /></div>
      </section>

      <section aria-label="Monthly VNF detections">
        <SectionHeading num="03" title="MONTHLY VNF DETECTION VOLUME" subtitle="VNF table records grouped by Mscan calendar month" />
        {monthlyQuery.isLoading && <div className="space-y-2" role="status" aria-label="Loading monthly VNF counts"><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /><div className="h-12 animate-pulse bg-text-primary/10" /></div>}
        {monthlyQuery.isError && <div className="border border-danger/50 bg-danger/5 p-8 text-center text-xs text-danger">Monthly VNF counts could not be loaded.</div>}
        {!monthlyQuery.isLoading && !monthlyQuery.isError && <div className="max-h-[22rem] overflow-y-auto bg-surface px-4">
          {months.length === 0 ? <p className="py-6 text-center text-xs text-text-secondary">No dated VNF detections are available.</p> : <ul className="divide-y divide-border">
            {months.map((month) => <li key={month.month} className="grid gap-3 py-3 text-xs sm:grid-cols-[minmax(10rem,1fr)_auto_auto_auto] sm:items-center">
              <span className="font-semibold text-text-primary">{monthLabel(month.month)}</span>
              <span className="font-mono text-text-secondary">Persistent {month.persistent_detection_count.toLocaleString()}</span>
              <span className="font-mono text-text-secondary">Transient {month.transient_detection_count.toLocaleString()}</span>
              <span className="font-mono text-base font-semibold text-accent">{month.detection_count.toLocaleString()}</span>
            </li>)}
          </ul>}
        </div>}
      </section>
    </div>
  )
}
