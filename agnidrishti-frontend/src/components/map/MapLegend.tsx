import { useState } from 'react'
import { ChevronDown, ChevronUp, FilterX } from 'lucide-react'
import { getMapCategory, getShapeClipPath, MAP_CATEGORY_COLORS, MAP_CATEGORY_LABELS, MAP_CATEGORY_SHAPES, type MapCategory } from '../../lib/mapColors'
import { useFilterStore } from '../../stores/filterStore'
import type { SourceSummary } from '../../types/source'

export function MapLegend({ sources = [] }: { sources?: SourceSummary[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const activeSourceType = useFilterStore((s) => s.sourceType)
  const setSourceType = useFilterStore((s) => s.setSourceType)

  const counts: Record<MapCategory, number> = {
    industrial: 0, natural_biomass: 0, persistent: 0, abnormal: 0, unknown: 0,
  }
  sources.forEach((s) => {
    const cat = getMapCategory(s.category)
    counts[cat] = (counts[cat] || 0) + 1
  })

  function handleCategoryClick(cat: MapCategory) {
    if (activeSourceType === cat) {
      setSourceType('')
    } else {
      setSourceType(cat)
    }
  }

  if (isCollapsed) {
    return (
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-surface px-3 py-1.5">
        <button type="button" onClick={() => setIsCollapsed(false)} className="flex items-center gap-2 text-xs font-semibold text-text-primary hover:text-accent">
          <span>Categories ({sources.length})</span>
          <ChevronUp size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-semibold text-text-primary">Categories ({sources.length})</span>
        <div className="flex items-center gap-1">
          {activeSourceType && (
            <button type="button" onClick={() => setSourceType('')} title="Clear category filter" className="p-1 text-xs font-bold text-danger hover:underline flex items-center gap-0.5">
              <FilterX size={12} /> Clear
            </button>
          )}
          <button type="button" onClick={() => setIsCollapsed(true)} className="rounded-lg p-1 text-text-primary hover:bg-accent hover:text-text-primary transition-colors" aria-label="Minimize categories">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {(Object.keys(MAP_CATEGORY_COLORS) as MapCategory[]).map((cat) => {
          const isActive = activeSourceType === cat
          return (
            <li key={cat}>
              <button type="button" onClick={() => handleCategoryClick(cat)}
                className={`group w-full flex items-center justify-between rounded-lg px-2 py-1 text-xs font-mono transition-colors cursor-pointer border border-border ${isActive ? 'bg-accent text-text-primary font-semibold' : 'text-text-primary hover:bg-accent hover:text-text-primary'}`}>
                <div className="flex items-center gap-2 truncate">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0" style={{ backgroundColor: MAP_CATEGORY_COLORS[cat], clipPath: getShapeClipPath(MAP_CATEGORY_SHAPES[cat]) }} />
                  <span className="truncate">{MAP_CATEGORY_LABELS[cat]}</span>
                </div>
                <span className={`rounded-lg border border-border px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-accent text-text-primary' : 'bg-bg text-text-primary'}`}>
                  {counts[cat]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-center text-[9px] font-mono text-text-secondary">Click category to filter map</p>
    </div>
  )
}
