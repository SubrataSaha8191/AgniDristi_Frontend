import { AlertsList } from '../components/alerts/AlertsList'
import { SectionHeading } from '../components/common/SectionHeading'

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="border-b-2 border-text-primary pb-6">
        <h1 className="text-3xl font-black uppercase tracking-[0.14em] text-text-primary">
          ALERTS OPERATIONS CENTER
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
          MONITOR ACTIONABLE LOCATION-BASED THERMAL INCIDENTS
        </p>
      </header>

      <section aria-label="System Alerts Stream">
        <SectionHeading num="01" title="ACTIONABLE ALERTS STREAM" subtitle="Confirmed repeated unknown activity and abnormal known sources" />
        <AlertsList />
      </section>
    </div>
  )
}

