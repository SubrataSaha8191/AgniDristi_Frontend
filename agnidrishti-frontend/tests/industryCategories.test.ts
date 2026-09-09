import { describe, expect, it } from 'vitest'
import { getIndustryCategory, resolveIndustryCategory } from '../src/lib/industryCategories'
import { matchSearchQuery, type SearchIndexItem } from '../src/services/searchIndexService'

describe('industry category mapping', () => {
  it('maps backend labels into the four search categories', () => {
    expect(getIndustryCategory('Steel and metallurgical plant')).toBe('metallurgy')
    expect(getIndustryCategory('Oil & Gas Refinery')).toBe('oil_gas')
    expect(getIndustryCategory('Coal Mining / Extraction')).toBe('mining_extraction')
    expect(getIndustryCategory('Cement manufacturing')).toBe('other')
  })

  it('resolves category route values and friendly labels', () => {
    expect(resolveIndustryCategory('oil_gas')).toBe('oil_gas')
    expect(resolveIndustryCategory('Refinery')).toBe('oil_gas')
  })
})

describe('master search matching', () => {
  const index: SearchIndexItem[] = [
    { id: 'state-odisha', name: 'Odisha', type: 'state', targetRoute: '/state/Odisha' },
    { id: 'industry-metallurgy', name: 'Metallurgy', type: 'industry', keywords: ['metullergy'], targetRoute: '/industry/metallurgy' },
    { id: 'industry-oil-gas', name: 'Oil & Gas', type: 'industry', industryType: 'oil_gas', targetRoute: '/industry/oil_gas' },
  ]

  it('matches state names and technical industry labels', () => {
    expect(matchSearchQuery('Odi', index)[0]?.targetRoute).toBe('/state/Odisha')
    expect(matchSearchQuery('oil_gas', index)[0]?.targetRoute).toBe('/industry/oil_gas')
    expect(matchSearchQuery('metullergy', index)[0]?.targetRoute).toBe('/industry/metallurgy')
  })
})
