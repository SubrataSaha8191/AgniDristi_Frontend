import { IndustrialVsNaturalChart } from '../components/dashboard/IndustrialVsNaturalChart'
import { RegionalSourcesChart } from '../components/dashboard/RegionalSourcesChart'

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Analysis</p>
      <h1 className="mt-1 text-2xl font-semibold text-text-primary">Event Assessment</h1>
      <p className="mt-2 max-w-2xl text-sm text-text-secondary">Aggregate thermal-source distribution across every detected source in the current assessment.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(380px,1fr)]">
        <RegionalSourcesChart expanded showDetailsLink={false} />
        <IndustrialVsNaturalChart expanded showDetailsLink={false} />
      </div>
    </div>
  )
}
