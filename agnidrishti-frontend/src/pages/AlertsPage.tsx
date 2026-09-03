import { AlertsList } from '../components/alerts/AlertsList'

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Operations</p>
      <h1 className="mt-1 text-2xl font-semibold text-text-primary">Alerts Center</h1>
      <p className="mt-1 text-sm text-text-secondary">Monitor high-priority thermal-source events and investigate them in context.</p>
      <AlertsList />
    </div>
  )
}
