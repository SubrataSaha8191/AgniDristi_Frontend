import { useState } from 'react'
import { useFilterStore } from '../../stores/filterStore'

const sourceTypes = [
  ['industrial', 'Industrial'],
  ['persistent', 'Persistent'],
  ['new', 'New'],
  ['abnormal', 'Abnormal'],
  ['natural_biomass', 'Natural / Biomass'],
  ['gas_flare', 'Gas Flare'],
  ['unknown', 'Unknown'],
]

export function FilterPanel() {
  const filters = useFilterStore()
  const [draft, setDraft] = useState({
    sourceId: filters.sourceId,
    location: filters.location,
    facility: filters.facility,
    from: filters.dateRange.from,
    to: filters.dateRange.to,
    sourceType: filters.sourceType,
    industryType: filters.industryType,
    anomalyLevel: filters.anomalyLevel,
    confidenceLevel: filters.confidenceLevel,
    persistenceStatus: filters.persistenceStatus,
  })

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function applyFilters() {
    filters.setSourceId(draft.sourceId)
    filters.setLocation(draft.location)
    filters.setFacility(draft.facility)
    filters.setDateRange({ from: draft.from, to: draft.to })
    filters.setSourceType(draft.sourceType)
    filters.setIndustryType(draft.industryType)
    filters.setAnomalyLevel(draft.anomalyLevel)
    filters.setConfidenceLevel(draft.confidenceLevel)
    filters.setPersistenceStatus(draft.persistenceStatus)
  }

  function resetFilters() {
    filters.reset()
    setDraft({
      sourceId: '',
      location: '',
      facility: '',
      from: '',
      to: '',
      sourceType: '',
      industryType: '',
      anomalyLevel: '',
      confidenceLevel: '',
      persistenceStatus: '',
    })
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" aria-label="Source filters">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Search &amp; filters</h2>
          <p className="mt-1 text-sm text-text-secondary">Narrow the thermal source view</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={resetFilters} className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-bg">
            Reset
          </button>
          <button type="button" onClick={applyFilters} className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90">
            Apply filters
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-text-secondary sm:col-span-2">
          Source ID
          <input value={draft.sourceId} onChange={(event) => updateDraft('sourceId', event.target.value)} placeholder="AGNI-IND-004821" className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          Location
          <input value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} placeholder="District or state" className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          Facility
          <input value={draft.facility} onChange={(event) => updateDraft('facility', event.target.value)} placeholder="Facility name" className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          From
          <input type="date" value={draft.from} onChange={(event) => updateDraft('from', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          To
          <input type="date" value={draft.to} onChange={(event) => updateDraft('to', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          Source type
          <select value={draft.sourceType} onChange={(event) => updateDraft('sourceType', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
            <option value="">All source types</option>
            {sourceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          Industry type
          <input value={draft.industryType} onChange={(event) => updateDraft('industryType', event.target.value)} placeholder="e.g. Steel Plant" className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" />
        </label>
        <label className="text-sm text-text-secondary">
          Anomaly level
          <select value={draft.anomalyLevel} onChange={(event) => updateDraft('anomalyLevel', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
            <option value="">Any anomaly level</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          Confidence: {draft.confidenceLevel ? `${draft.confidenceLevel}% minimum` : 'Any'}
          <input type="range" min="0" max="100" step="1" value={draft.confidenceLevel || '0'} onChange={(event) => updateDraft('confidenceLevel', event.target.value === '0' ? '' : event.target.value)} className="mt-3 w-full accent-accent" />
          <span className="mt-1 flex justify-between text-xs"><span>0%</span><span>100%</span></span>
        </label>
        <label className="text-sm text-text-secondary">
          Persistence
          <select value={draft.persistenceStatus} onChange={(event) => updateDraft('persistenceStatus', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
            <option value="">Any status</option><option value="persistent">Persistent</option><option value="new">New</option><option value="transient">Transient</option>
          </select>
        </label>
      </div>
    </section>
  )
}
