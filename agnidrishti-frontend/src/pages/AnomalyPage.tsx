import { useState } from 'react'
import { AlertCircle, ArrowRight, ShieldAlert, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useKPISummary } from '../services/kpiService'
import { useSources } from '../services/sourceService'

export default function AnomalyPage() {
  const [level, setLevel] = useState<string>('ALL')
  const { data: sources = [], isLoading: loadingSources } = useSources()
  const { data: summary } = useKPISummary()

  const highCount = sources.filter((s) => s.anomalyLevel === 'high').length
  const medCount = sources.filter((s) => s.anomalyLevel === 'medium').length
  const alertCount = summary?.alerts ?? 0

  const filteredSources = sources.filter((s) => level === 'ALL' || s.anomalyLevel.toUpperCase() === level)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
         <span className="text-[10px] font-medium text-text-secondary">Change & Anomaly Analysis</span>
         <h1 className="text-2xl font-semibold text-text-primary">Thermal Anomaly Intelligence</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Dynamic thermal output spikes and industrial anomaly detection telemetry.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
         <div className="rounded-lg border border-border bg-surface p-4">
           <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400"><ShieldAlert size={16} /> High Risk Anomalies</p>
           <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{highCount}</p>
        </div>
         <div className="rounded-lg border border-border bg-surface p-4">
           <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"><AlertCircle size={16} /> Moderate Anomalies</p>
           <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{medCount}</p>
        </div>
         <div className="rounded-lg border border-border bg-surface p-4">
           <p className="flex items-center gap-1.5 text-xs font-semibold text-text-primary"><TrendingUp size={16} /> Actionable Alerts</p>
           <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{alertCount}</p>
        </div>
      </div>

       <div className="flex items-center justify-between border-b border-border pb-3">
         <h2 className="text-sm font-semibold text-text-primary">Detected Anomaly Sources ({filteredSources.length})</h2>
        <div className="flex gap-2">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button key={lvl} type="button" onClick={() => setLevel(lvl)}
               className={`rounded-lg border border-border px-3 py-1 text-xs font-medium transition-all ${level === lvl ? 'bg-accent text-white' : 'bg-surface text-text-primary hover:bg-accent hover:text-white'}`}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

       {loadingSources && <p className="py-8 text-center text-xs font-medium text-text-secondary">Loading anomaly data...</p>}

      {!loadingSources && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map((s) => (
             <div key={s.id} className="rounded-lg border border-border bg-surface p-4">
               <div className="flex items-center justify-between border-b border-border pb-2">
                 <span className="font-mono text-xs font-semibold text-text-primary">{s.id}</span>
                 <span className={`rounded-lg border border-border px-2 py-0.5 font-mono text-[10px] font-semibold ${s.anomalyLevel === 'high' ? 'bg-red-600 text-white' : s.anomalyLevel === 'medium' ? 'bg-amber-500 text-text-primary' : 'bg-zinc-200 text-text-primary'}`}>
                  {s.anomalyLevel} risk
                </span>
              </div>
               <div className="mt-3 space-y-1 text-xs font-medium text-text-secondary">
                 <p className="text-text-primary">{s.industrySubtype ?? 'Thermal Source'}</p>
                <p className="font-mono text-[11px] text-text-primary">{s.lat.toFixed(4)}° N, {s.lon.toFixed(4)}° E</p>
                 <p className="text-[10px] font-semibold text-text-secondary">Confidence: <span className="text-text-primary font-medium">{s.confidence}%</span> · Status: <span className="text-text-primary font-medium">{s.status}</span></p>
              </div>
              <Link to={`/investigation/${encodeURIComponent(s.id)}`}
                 className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-accent py-2 text-xs font-medium text-white hover:opacity-90 transition-colors">
                Inspect Anomaly Telemetry <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
