import { RegionalAnalytics } from '../components/analytics/RegionalAnalytics'

export default function RegionalAnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Analysis</p>
      <h1 className="mt-1 text-2xl font-semibold text-text-primary">Regional Analytics</h1>
      <div className="mt-8"><RegionalAnalytics /></div>
    </div>
  )
}
