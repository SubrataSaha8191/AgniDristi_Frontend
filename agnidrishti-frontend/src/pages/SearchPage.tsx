import { useState } from 'react'
import { ArrowRight, Filter, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSources } from '../services/sourceService'
import { useSourceStore } from '../stores/sourceStore'

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [classification, setClassification] = useState('')
  const { data: sources = [], isLoading, isError } = useSources({ classification: classification || undefined })
  const openPanel = useSourceStore((s) => s.openPanel)

  const filtered = sources.filter((s) =>
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.industrySubtype ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
         <span className="text-[10px] font-medium text-text-secondary">Explorer & Discovery</span>
         <h1 className="text-2xl font-semibold text-text-primary">Search & Discovery</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Search thermal objects dynamically across satellite pipeline records.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" placeholder="Search by Source UID or Classification..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-xs font-medium placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-secondary" />
          <select value={classification} onChange={(e) => setClassification(e.target.value)}
             className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="">All Classifications</option>
            <option value="industrial">Industrial</option>
            <option value="biomass">Biomass / Natural</option>
            <option value="persistent">Persistent Thermal</option>
          </select>
        </div>
      </div>

       {isLoading && <p className="py-8 text-center text-xs font-medium text-text-secondary">Fetching thermal objects from satellite catalog...</p>}
       {isError && <p className="py-8 text-center text-xs font-medium text-danger">Unable to load search index.</p>}

      {!isLoading && !isError && (
        <div className="space-y-4">
           <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
            <span>Query Results ({filtered.length})</span>
            <span className="text-text-secondary">Thermal Source Index</span>
          </div>
          {filtered.length === 0 ? (
             <div className="rounded-lg border border-border bg-surface p-8 text-center text-xs font-medium text-text-secondary">No matching thermal sources found.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                 <div key={s.id} className="rounded-lg border border-border bg-surface p-4 transition-transform hover:-translate-y-0.5">
                   <div className="flex items-center justify-between border-b border-border pb-2">
                     <span className="font-mono text-xs font-semibold text-text-primary">{s.id}</span>
                     <span className="rounded-lg border border-border bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-white">{s.confidence}% CONF</span>
                  </div>
                   <div className="mt-3 space-y-1 text-xs font-medium text-text-secondary">
                     <p className="text-text-primary">{s.industrySubtype ?? 'Unclassified Thermal Source'}</p>
                    <p className="font-mono text-[11px] text-text-primary">{s.lat.toFixed(4)}° N, {s.lon.toFixed(4)}° E</p>
                     <p className="text-[10px] font-semibold text-text-secondary">Status: <span className="text-text-primary font-medium">{s.status}</span> · Anomaly: <span className="text-text-primary font-medium">{s.anomalyLevel}</span></p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={() => openPanel(s.id)}
                       className="flex-1 rounded-lg border border-border bg-surface py-1.5 text-center text-xs font-medium text-text-primary hover:bg-accent hover:text-white transition-colors">
                      Quick Snapshot
                    </button>
                    <Link to={`/investigation/${encodeURIComponent(s.id)}`}
                       className="flex items-center justify-center gap-1 rounded-lg border border-border bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-colors">
                      View <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
