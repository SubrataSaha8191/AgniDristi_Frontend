import { useState } from 'react'
import { useMap } from 'react-leaflet'
import { Search } from 'lucide-react'

const KNOWN_LOCATIONS: Record<string, [number, number]> = {
  jamshedpur: [22.8046, 86.2029],
  dhanbad: [23.7957, 86.4304],
  bokaro: [23.6693, 86.1511],
  kolkata: [22.5726, 88.3639],
  ranchi: [23.3441, 85.3096],
  patna: [25.5941, 85.1376],
  bhubaneswar: [20.2961, 85.8245],
  durgapur: [23.5204, 87.3119],
  asansol: [23.6889, 86.9661],
  tinsukia: [27.4922, 95.3558],
  singrauli: [24.1992, 82.6645],
}

export function MapSearchControl({ position = 'left' }: { position?: 'left' | 'right' }) {
  const map = useMap()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const coordsMatch = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/)
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1])
      const lon = parseFloat(coordsMatch[3])
      if (!isNaN(lat) && !isNaN(lon)) {
        map.flyTo([lat, lon], 12, { duration: 1.5 })
        return
      }
    }

    const key = trimmed.toLowerCase()
    const matchedKey = Object.keys(KNOWN_LOCATIONS).find((k) => k.includes(key))
    if (matchedKey) {
      map.flyTo(KNOWN_LOCATIONS[matchedKey], 11, { duration: 1.5 })
    }
  }

  const posClass = position === 'right' ? 'right-4 top-3' : 'left-4 top-4'

  return (
    <div className={`absolute ${posClass} z-[1000] flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-md`}>
      <form onSubmit={handleSearch} className="flex items-center gap-1">
        <Search size={14} className="ml-1 text-text-secondary" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search place or lat, lon..."
          className="w-44 bg-transparent px-2 py-1 text-xs font-semibold text-text-primary outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-accent px-2.5 py-1 text-xs font-semibold text-text-primary hover:bg-accent/80"
        >
          Go
        </button>
      </form>
    </div>
  )
}
