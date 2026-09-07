import { useState } from 'react'
import { AlertCircle, ArrowRight, ShieldAlert, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAlerts } from '../services/alertService'
import { useSources } from '../services/sourceService'

export default function AnomalyPage() {
  const [level, setLevel] = useState<string>('ALL')
  const { data: alerts = [], isLoading: loadingAlerts } = useAlerts()
  const { data: sources = [], isLoading: loadingSources } = useSources()

  const highCount = sources.filter((s) => s.anomalyLevel === 'high').length
  const medCount = sources.filter((s) => s.anomalyLevel === 'medium').length

  const filteredSources = sources.filter((s) => level === 'ALL' || s.anomalyLevel.toUpperCase() === level)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">CHANGE & ANOMALY ANALYSIS</span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-text-primary">Thermal Anomaly Intelligence</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Dynamic thermal output spikes and industrial anomaly detection telemetry.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-red-600"><ShieldAlert size={16} /> High Risk Anomalies</p>
          <p className="mt-2 font-mono text-2xl font-black text-black">{highCount}</p>
        </div>
        <div className="border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-600"><AlertCircle size={16} /> Moderate Anomalies</p>
          <p className="mt-2 font-mono text-2xl font-black text-black">{medCount}</p>
        </div>
        <div className="border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-text-primary"><TrendingUp size={16} /> Total Alerts Logged</p>
          <p className="mt-2 font-mono text-2xl font-black text-black">{alerts.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider">Detected Anomaly Sources ({filteredSources.length})</h2>
        <div className="flex gap-2">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button key={lvl} type="button" onClick={() => setLevel(lvl)}
              className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-all ${level === lvl ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-surface text-text-primary hover:bg-zinc-100'}`}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {(loadingAlerts || loadingSources) && <p className="py-8 text-center text-xs font-bold uppercase text-text-secondary">Loading anomaly data...</p>}

      {!loadingSources && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map((s) => (
            <div key={s.id} className="border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b border-black/20 pb-2">
                <span className="font-mono text-xs font-black">{s.id}</span>
                <span className={`border border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase ${s.anomalyLevel === 'high' ? 'bg-red-600 text-white' : s.anomalyLevel === 'medium' ? 'bg-amber-500 text-black' : 'bg-zinc-200 text-black'}`}>
                  {s.anomalyLevel} risk
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs font-bold text-text-secondary">
                <p className="uppercase text-text-primary">{s.industrySubtype ?? 'Thermal Source'}</p>
                <p className="font-mono text-[11px]">{s.lat.toFixed(4)}° N, {s.lon.toFixed(4)}° E</p>
                <p className="text-[10px] uppercase font-semibold">Confidence: <span className="text-black">{s.confidence}%</span> · Status: <span className="text-black">{s.status}</span></p>
              </div>
              <Link to={`/investigation/${encodeURIComponent(s.id)}`}
                className="mt-4 flex items-center justify-center gap-1.5 border-2 border-black bg-black py-2 text-xs font-black uppercase text-white hover:bg-zinc-800">
                Inspect Anomaly Telemetry <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
