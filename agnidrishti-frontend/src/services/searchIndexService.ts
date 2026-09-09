import { backendApi } from './backendApi'
import { INDUSTRY_CATEGORIES, getIndustryRoute } from '../lib/industryCategories'

export type SearchEntityType = 'factory' | 'district' | 'state' | 'industry'

export interface SearchIndexItem {
  id: string
  name: string
  type: SearchEntityType
  subtitle?: string
  state?: string
  district?: string
  industryType?: string
  keywords?: string[]
  targetRoute: string
}

// Master Known Entities List
const PREDEFINED_INDEX: SearchIndexItem[] = [
  // Major Factories & Thermal Facilities
  {
    id: 'fac-ioc-haldia',
    name: 'Indian Oil Corporation (Haldia Refinery)',
    type: 'factory',
    subtitle: 'Oil & Gas Refinery • Haldia, West Bengal',
    state: 'West Bengal',
    district: 'Haldia',
    industryType: 'Refinery',
    targetRoute: '/factory/Indian Oil Corporation (Haldia Refinery)',
  },
  {
    id: 'fac-jamnagar-refinery',
    name: 'Reliance Jamnagar Refinery Complex',
    type: 'factory',
    subtitle: 'Petrochemical & Flare • Jamnagar, Gujarat',
    state: 'Gujarat',
    district: 'Jamnagar',
    industryType: 'Refinery',
    targetRoute: '/factory/Reliance Jamnagar Refinery Complex',
  },
  {
    id: 'fac-tata-steel-jamshedpur',
    name: 'Tata Steel Jamshedpur Works',
    type: 'factory',
    subtitle: 'Integrated Steel Plant • East Singhbhum, Jharkhand',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    industryType: 'Steel Plant',
    targetRoute: '/factory/Tata Steel Jamshedpur Works',
  },
  {
    id: 'fac-ntpc-ramagundam',
    name: 'NTPC Ramagundam Super Thermal Power Station',
    type: 'factory',
    subtitle: 'Thermal Power Station • Peddapalli, Telangana',
    state: 'Telangana',
    district: 'Peddapalli',
    industryType: 'Thermal Power Plant',
    targetRoute: '/factory/NTPC Ramagundam STPS',
  },
  {
    id: 'fac-vedanta-jharsuguda',
    name: 'Vedanta Aluminium & Thermal Complex',
    type: 'factory',
    subtitle: 'Smelter & Power • Jharsuguda, Odisha',
    state: 'Odisha',
    district: 'Jharsuguda',
    industryType: 'Smelter & Power',
    targetRoute: '/factory/Vedanta Jharsuguda',
  },

  // States
  {
    id: 'state-west-bengal',
    name: 'West Bengal',
    type: 'state',
    subtitle: 'State • Eastern Region • Industrial Thermal Zone',
    targetRoute: '/state/West Bengal',
  },
  {
    id: 'state-gujarat',
    name: 'Gujarat',
    type: 'state',
    subtitle: 'State • Western Coast • Refinery & Petrochemical Zone',
    targetRoute: '/state/Gujarat',
  },
  {
    id: 'state-odisha',
    name: 'Odisha',
    type: 'state',
    subtitle: 'State • Eastern Belt • Mineral & Metallurgical Zone',
    targetRoute: '/state/Odisha',
  },
  {
    id: 'state-jharkhand',
    name: 'Jharkhand',
    type: 'state',
    subtitle: 'State • Eastern Belt • Mining & Steel Zone',
    targetRoute: '/state/Jharkhand',
  },
  {
    id: 'state-telangana',
    name: 'Telangana',
    type: 'state',
    subtitle: 'State • Southern Region • Power Generation Hub',
    targetRoute: '/state/Telangana',
  },
  {
    id: 'state-maharashtra',
    name: 'Maharashtra',
    type: 'state',
    subtitle: 'State • Western Region • Multi-industrial Belt',
    targetRoute: '/state/Maharashtra',
  },
  {
    id: 'state-assam',
    name: 'Assam',
    type: 'state',
    subtitle: 'State • North Eastern • Upstream Oil & Gas Flares',
    targetRoute: '/state/Assam',
  },

  // Districts
  {
    id: 'dist-haldia',
    name: 'Haldia',
    type: 'district',
    subtitle: 'District / Industrial Hub • West Bengal',
    state: 'West Bengal',
    targetRoute: '/district/Haldia',
  },
  {
    id: 'dist-jamnagar',
    name: 'Jamnagar',
    type: 'district',
    subtitle: 'District • Gujarat',
    state: 'Gujarat',
    targetRoute: '/district/Jamnagar',
  },
  {
    id: 'dist-jharsuguda',
    name: 'Jharsuguda',
    type: 'district',
    subtitle: 'District • Odisha',
    state: 'Odisha',
    targetRoute: '/district/Jharsuguda',
  },
  {
    id: 'dist-dhanbad',
    name: 'Dhanbad',
    type: 'district',
    subtitle: 'District • Jharkhand',
    state: 'Jharkhand',
    targetRoute: '/district/Dhanbad',
  },

  // Industry Types
  {
    id: 'ind-refinery',
    name: 'Refinery & Petrochemical',
    type: 'industry',
    subtitle: 'Industry Category • Continuous High FRP Thermal Objects',
    targetRoute: '/industry/Refinery',
  },
  {
    id: 'ind-power-plant',
    name: 'Thermal Power Plant',
    type: 'industry',
    subtitle: 'Industry Category • Coal & Gas Thermal Generators',
    targetRoute: '/industry/Thermal Power Plant',
  },
  {
    id: 'ind-steel',
    name: 'Steel & Metallurgical Plant',
    type: 'industry',
    subtitle: 'Industry Category • Blast Furnace & Coke Oven Flares',
    targetRoute: '/industry/Steel Plant',
  },
  {
    id: 'ind-chemical',
    name: 'Chemical & Fertilizer',
    type: 'industry',
    subtitle: 'Industry Category • Process Heating & Vents',
    targetRoute: '/industry/Chemical',
  },
  {
    id: 'ind-gas-flare',
    name: 'Upstream Gas Flare',
    type: 'industry',
    subtitle: 'Industry Category • Offshore & Onshore Flare Stacks',
    targetRoute: '/industry/Gas Flare',
  },
]

const INDIA_STATES_AND_TERRITORIES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

let cachedDynamicIndex: SearchIndexItem[] = []

export function getInitialSearchIndex(): SearchIndexItem[] {
  const itemsMap = new Map<string, SearchIndexItem>()
  PREDEFINED_INDEX.forEach((item) => itemsMap.set(item.id, item))
  INDIA_STATES_AND_TERRITORIES.forEach((name) => {
    const id = `state-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    itemsMap.set(id, {
      id,
      name,
      type: 'state',
      subtitle: 'State or union territory · VNF and FIRMS detections',
      targetRoute: `/state/${encodeURIComponent(name)}`,
    })
  })
  INDUSTRY_CATEGORIES.forEach(({ key, label }) => {
    itemsMap.set(`industry-${key}`, {
      id: `industry-${key}`,
      name: label,
      type: 'industry',
      subtitle: 'Industry category · Detection statistics by state',
      industryType: key,
      keywords: key === 'metallurgy' ? ['metullergy', 'metalurgy', 'steel'] : [key.replace('_', ' ')],
      targetRoute: getIndustryRoute(key),
    })
  })
  return Array.from(itemsMap.values())
}

export async function getMasterSearchIndex(): Promise<SearchIndexItem[]> {
  if (cachedDynamicIndex.length > 0) {
    return cachedDynamicIndex
  }

  const itemsMap = new Map(getInitialSearchIndex().map((item) => [item.id, item]))

  // 2. Fetch live objects dynamically from backend
  try {
    const [objectsResult, statesResult] = await Promise.allSettled([
      backendApi.getObjects({ limit: '5000', offset: '0' }),
      backendApi.getDetectionsByState(),
    ])
    const objectPayload = objectsResult.status === 'fulfilled' ? objectsResult.value.data : null
    const sources = Array.isArray(objectPayload) ? objectPayload : objectPayload?.objects ?? objectPayload?.items ?? []

    sources.forEach((src: any) => {
      const name = src.matched_facility_name || src.name || `Thermal Object ${src.source_id || src.id}`
      const id = `dynamic-${src.source_id || src.id}`

      itemsMap.set(id, {
        id,
        name,
        type: 'factory',
        subtitle: `${src.classification_name || 'Thermal Object'} • ${src.district_name || ''}, ${src.state_name || ''}`,
        state: src.state_name,
        district: src.district_name,
        industryType: src.classification_name,
        targetRoute: `/factory/${encodeURIComponent(name)}`,
      })

      if (src.state_name && !itemsMap.has(`state-${src.state_name.toLowerCase()}`)) {
        itemsMap.set(`state-${src.state_name.toLowerCase()}`, {
          id: `state-${src.state_name.toLowerCase()}`,
          name: src.state_name,
          type: 'state',
          subtitle: `State • Live Thermal Monitoring`,
          targetRoute: `/state/${encodeURIComponent(src.state_name)}`,
        })
      }

      if (src.district_name && !itemsMap.has(`dist-${src.district_name.toLowerCase()}`)) {
        itemsMap.set(`dist-${src.district_name.toLowerCase()}`, {
          id: `dist-${src.district_name.toLowerCase()}`,
          name: src.district_name,
          type: 'district',
          subtitle: `District • ${src.state_name || 'India'}`,
          state: src.state_name,
          targetRoute: `/district/${encodeURIComponent(src.district_name)}`,
        })
      }
    })

    const statePayload = statesResult.status === 'fulfilled' ? statesResult.value.data : null
    const states = Array.isArray(statePayload) ? statePayload : statePayload?.states ?? []
    states.forEach((state: { state_name?: string; total_detection_count?: number }) => {
      if (!state.state_name) return
      const id = `state-${state.state_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      itemsMap.set(id, {
        id,
        name: state.state_name,
        type: 'state',
        subtitle: `State · ${(state.total_detection_count ?? 0).toLocaleString()} indexed detections`,
        targetRoute: `/state/${encodeURIComponent(state.state_name)}`,
      })
    })
  } catch {
    // Fallback to predefined list if backend is offline
  }

  cachedDynamicIndex = Array.from(itemsMap.values())
  return cachedDynamicIndex
}

export function matchSearchQuery(query: string, index: SearchIndexItem[]): SearchIndexItem[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return []
  const normalized = clean.replace(/[^a-z0-9]+/g, ' ')

  return index.filter((item) => {
    const searchable = [item.name, item.subtitle, item.state, item.district, item.industryType, ...(item.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
    const matchName = searchable.includes(normalized)
    const matchType = item.type.toLowerCase().includes(clean)

    return matchName || matchType
  }).sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aRank = aName === clean ? 0 : aName.startsWith(clean) ? 1 : 2
    const bRank = bName === clean ? 0 : bName.startsWith(clean) ? 1 : 2
    return aRank - bRank || a.name.localeCompare(b.name)
  }).slice(0, 8)
}

export function classifyQueryEntity(query: string, index: SearchIndexItem[]): SearchIndexItem | null {
  const matches = matchSearchQuery(query, index)
  if (matches.length === 0) return null

  // Return exact match if any
  const exact = matches.find((m) => m.name.toLowerCase() === query.trim().toLowerCase())
  return exact || matches[0]
}
