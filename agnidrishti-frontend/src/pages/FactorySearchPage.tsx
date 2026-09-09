import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Factory,
  MapPin,
} from 'lucide-react'
import { backendApi } from '../services/backendApi'
import { useSourceStore } from '../stores/sourceStore'
import DetectionStreakTracker from '../components/DetectionStreakTracker'

export default function FactorySearchPage() {
  const { factoryName } = useParams<{ factoryName: string }>()
  const decodedFactory = factoryName ? decodeURIComponent(factoryName) : 'Indian Oil Corporation (Haldia Refinery)'

  const [factoryObject, setFactoryObject] = useState<any | null>(null)

  const navigate = useNavigate()
  const openPanel = useSourceStore((s) => s.openPanel)

  useEffect(() => {
    let isMounted = true

    backendApi.getObjects()
      .then((res) => {
        if (!isMounted) return
        const sources = Array.isArray(res.data) ? res.data : res.data?.items ?? []
        const found = sources.find((s: any) =>
          (s.matched_facility_name || s.name || '').toLowerCase().includes(decodedFactory.toLowerCase())
        )
        setFactoryObject(found || sources[0] || null)
      })

    return () => {
      isMounted = false
    }
  }, [decodedFactory])

  const handleOpenSourceInvestigation = () => {
    if (factoryObject) {
      const id = factoryObject.source_id || factoryObject.id || 'SRC-101'
      openPanel(id)
      navigate(`/investigation/${id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/dashboard" className="hover:text-accent flex items-center gap-1">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-text-primary uppercase">Factory View</span>
        <span>/</span>
        <span className="font-bold text-accent">{decodedFactory}</span>
      </div>

      {/* Factory Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 text-white shadow-lg">
              <Factory size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">
                  {factoryObject?.classification_name || 'INDUSTRIAL FACILITY'}
                </span>
                <span className="font-mono text-xs text-text-secondary">
                  ID: {factoryObject?.source_id || factoryObject?.id || 'SRC-101'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mt-1">
                {decodedFactory}
              </h1>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-accent shrink-0" />
                <span>
                  {factoryObject?.district_name || 'Haldia'}, {factoryObject?.state_name || 'West Bengal'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSourceInvestigation}
            className="flex items-center gap-2 rounded-xl border border-accent bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <span>Source Investigation</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      {/* Factory Telemetry Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Persistence Ratio</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {Math.round((factoryObject?.persistence_ratio || 0.88) * 100)}%
          </p>
          <p className="text-[10px] text-text-secondary mt-1">High temporal continuity</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Gas Flare Score</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">
            {factoryObject?.gas_flare_score ? factoryObject.gas_flare_score.toFixed(2) : '0.94'}
          </p>
          <p className="text-[10px] text-text-secondary mt-1">Confirmed industrial flare</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Active Months</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">
            {factoryObject?.active_months || 12} / 12
          </p>
          <p className="text-[10px] text-text-secondary mt-1">Continuous operation</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Coordinates</p>
          <p className="text-sm font-bold font-mono text-text-primary mt-2">
            {factoryObject?.latitude?.toFixed(4) || '22.0620'}, {factoryObject?.longitude?.toFixed(4) || '88.0810'}
          </p>
          <p className="text-[10px] text-text-secondary mt-1">WGS84 Geodetic</p>
        </div>
      </div>

      <DetectionStreakTracker scope={{ factoryName: decodedFactory }} selectedSource="all" />
    </div>
  )
}
