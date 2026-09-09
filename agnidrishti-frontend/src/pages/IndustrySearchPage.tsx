import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, ChevronRight, Factory, MapPin } from 'lucide-react'
import { backendApi } from '../services/backendApi'
import { useSourceStore } from '../stores/sourceStore'

export default function IndustrySearchPage() {
  const { industryType } = useParams<{ industryType: string }>()
  const decodedIndustry = industryType ? decodeURIComponent(industryType) : 'Refinery'

  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const openPanel = useSourceStore((s) => s.openPanel)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    backendApi.getObjects()
      .then((res) => {
        if (!isMounted) return
        const raw = Array.isArray(res.data) ? res.data : res.data?.items ?? []
        const matched = raw.filter((s: any) =>
          (s.classification_name || '').toLowerCase().includes(decodedIndustry.toLowerCase())
        )
        setSources(matched.length > 0 ? matched : raw.slice(0, 8))
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [decodedIndustry])

  const handleInvestigate = (sourceId: string) => {
    openPanel(sourceId)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/dashboard" className="hover:text-accent flex items-center gap-1">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-text-primary uppercase">Industry Category</span>
        <span>/</span>
        <span className="font-bold text-accent">{decodedIndustry}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-violet-400 text-white shadow-lg">
            <Building2 size={30} />
          </div>
          <div>
            <span className="rounded bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
              INDUSTRY CATEGORY
            </span>
            <h1 className="text-2xl font-bold text-text-primary mt-1 font-samarkan tracking-wide">
              {decodedIndustry} Facilities
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Thermal source objects classified under the {decodedIndustry} industrial category across India.
            </p>
          </div>
        </div>
      </div>

      {/* Facilities list */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
          <Factory size={16} className="text-accent" />
          {decodedIndustry} Facilities ({sources.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-text-secondary bg-surface rounded-xl border border-border">
            Loading industry thermal data...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((src) => (
              <div
                key={src.source_id || src.id}
                className="rounded-xl border border-border bg-surface p-4 hover:border-accent transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="rounded bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    {src.classification_name || decodedIndustry}
                  </span>
                  <h3 className="font-bold text-sm text-text-primary mt-2">
                    {src.matched_facility_name || src.name || `Facility ${src.source_id || src.id}`}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                    <MapPin size={12} className="text-accent shrink-0" />
                    <span>{src.district_name || 'District'}, {src.state_name || 'State'}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-secondary">
                    ID: {src.source_id || src.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInvestigate(src.source_id || src.id)}
                    className="flex items-center gap-1 rounded-lg border border-accent bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
                  >
                    <span>Source Investigation</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
