import { Activity, Database, Gauge, Server, ShieldCheck } from 'lucide-react'

const statuses = [
  { label: 'API service', value: 'Illustrative healthy', detail: 'Placeholder only', icon: Server, color: 'text-success' },
  { label: 'Database', value: 'Illustrative healthy', detail: 'Placeholder only', icon: Database, color: 'text-success' },
  { label: 'FIRMS feed', value: 'Illustrative available', detail: 'Not connected', icon: Activity, color: 'text-warning' },
  { label: 'Model pipeline', value: 'Illustrative ready', detail: 'Version v0.1-demo', icon: Gauge, color: 'text-info' },
]

export default function SystemStatusPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Platform</p>
      <h1 className="mt-1 text-2xl font-semibold text-text-primary">System / Model Status</h1>
      <p className="mt-1 text-sm text-text-secondary">Data pipeline and model readiness overview.</p>
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning"><ShieldCheck size={16} aria-hidden="true" /><span><strong>Illustrative status only.</strong> These values are hardcoded demo placeholders and do not indicate live backend connectivity.</span></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {statuses.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-text-secondary">{label}</p><p className={`mt-3 font-medium ${color}`}>{value}</p><p className="mt-1 text-xs text-text-secondary">{detail}</p></div><Icon size={21} className={color} aria-hidden="true" /></div></article>)}
      </div>
      <section className="mt-6 rounded-lg border border-border bg-surface p-5"><h2 className="text-sm font-semibold text-text-primary">Illustrative model performance</h2><div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">{[['Accuracy', '91.4%'], ['Precision', '89.8%'], ['Recall', '87.2%'], ['F1 score', '88.5%']].map(([label, value]) => <div key={label} className="rounded-lg bg-bg p-3"><p className="text-xs text-text-secondary">{label}</p><p className="mt-1 font-mono text-lg font-semibold text-text-primary">{value}</p></div>)}</div><p className="mt-4 text-xs text-text-secondary">Metrics are sample values for the demo and will be replaced by backend-reported evaluation results.</p></section>
    </div>
  )
}
