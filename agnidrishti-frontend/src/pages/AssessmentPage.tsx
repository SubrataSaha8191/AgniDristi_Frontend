import { IndustrialVsNaturalChart } from '../components/dashboard/IndustrialVsNaturalChart'
import { RegionalSourcesChart } from '../components/dashboard/RegionalSourcesChart'
import { SectionHeading } from '../components/common/SectionHeading'
import { useMonitoringUnmatched } from '../services/monitoringRunService'
import { useKPISummary } from '../services/kpiService'

export default function AssessmentPage() {
  const { data: summary } = useKPISummary()
  const { data: unmatchedData } = useMonitoringUnmatched(10)
  const unmatchedList = Array.isArray(unmatchedData) ? unmatchedData : (unmatchedData?.detections ?? unmatchedData?.unmatched ?? [])

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <header className="border-b-2 border-text-primary pb-6">
        <h1 className="text-3xl font-black uppercase tracking-[0.14em] text-text-primary">
          EVENT ASSESSMENT &amp; MONITORING DATA
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
          REAL-TIME SATELLITE MATCHING SUMMARY &amp; UNMATCHED FIRMS DETECTIONS
        </p>
      </header>

      <section aria-label="Monitoring Assessment Overview">
        <SectionHeading num="01" title="SATELLITE MONITORING OVERVIEW" subtitle="Automated satellite telemetry and matching overview" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-2 border-black bg-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">TOTAL DETECTIONS</p>
            <p className="mt-2 font-mono text-2xl font-black">{summary?.firmsDetections ?? 0}</p>
          </div>
          <div className="border-2 border-black bg-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">MATCHED TO SOURCES</p>
            <p className="mt-2 font-mono text-2xl font-black text-emerald-700">{summary?.matchedFirms ?? 0}</p>
          </div>
          <div className="border-2 border-black bg-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">UNMATCHED DETECTIONS</p>
            <p className="mt-2 font-mono text-2xl font-black text-red-600">{summary?.unmatchedFirms ?? 0}</p>
          </div>
        </div>
      </section>

      <section aria-label="Regional Distribution">
        <SectionHeading num="02" title="REGIONAL DISTRIBUTION ASSESSMENT" subtitle="Regional thermal source density breakdown" />
        <div className="grid gap-6 lg:grid-cols-2">
          <RegionalSourcesChart expanded showDetailsLink={false} />
          <IndustrialVsNaturalChart expanded showDetailsLink={false} />
        </div>
      </section>

      <section aria-label="Unmatched Detections">
        <SectionHeading num="03" title="UNMATCHED SATELLITE DETECTIONS" subtitle="Recent FIRMS satellite observations requiring ground verification" />
        <div className="border-2 border-black bg-surface p-4">
          <ul className="divide-y divide-black/20 text-xs">
            {unmatchedList.slice(0, 10).map((u: Record<string, unknown>, idx: number) => (
              <li key={idx} className="py-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-bold text-text-primary">
                <span className="border border-black dark:border-zinc-700 bg-black dark:bg-[#d8f5a9] px-2.5 py-0.5 font-mono text-xs font-black text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">FIRMS #{String(u.firms_uid ?? u.id ?? `DET_${idx + 1}`)}</span>
                <span>LAT: {Number(u.latitude ?? u.lat ?? 23.45).toFixed(4)}° | LON: {Number(u.longitude ?? u.lon ?? 85.67).toFixed(4)}°</span>
                <span className="text-text-secondary">{String(u.acq_date ?? 'RECENT')} {String(u.acq_time ?? '')}</span>
              </li>
            ))}
            {unmatchedList.length === 0 && (
              <p className="py-2 text-text-secondary font-bold">No unmatched detections logged.</p>
            )}
          </ul>
        </div>
      </section>
    </div>
  )
}

