export const INDUSTRY_CATEGORIES = [
  { key: 'metallurgy', label: 'Metallurgy' },
  { key: 'oil_gas', label: 'Oil & Gas' },
  { key: 'mining_extraction', label: 'Mining & Extraction' },
  { key: 'other', label: 'Other' },
] as const

export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number]['key']

function searchable(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

export function getIndustryCategory(value: string | null | undefined): IndustryCategory {
  const normalized = searchable(value)

  if (/(metall|steel|iron|smelt|aluminium|aluminum|foundry|furnace)/.test(normalized)) {
    return 'metallurgy'
  }
  if (/(oil|gas|petro|refiner|hydrocarbon|flare|lng)/.test(normalized)) {
    return 'oil_gas'
  }
  if (/(mining|mine|extract|quarry|mineral|coal)/.test(normalized)) {
    return 'mining_extraction'
  }
  return 'other'
}

export function resolveIndustryCategory(value: string | null | undefined): IndustryCategory {
  const normalized = searchable(value)
  const direct = INDUSTRY_CATEGORIES.find(({ key }) => key === normalized)
  return direct?.key ?? getIndustryCategory(value)
}

export function getIndustryLabel(category: IndustryCategory) {
  return INDUSTRY_CATEGORIES.find(({ key }) => key === category)?.label ?? 'Other'
}

export function getIndustryRoute(category: IndustryCategory) {
  return `/industry/${encodeURIComponent(category)}`
}
