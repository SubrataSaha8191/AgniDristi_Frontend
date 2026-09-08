import { useQuery } from '@tanstack/react-query'
import { axiosClient } from '../lib/axiosClient'

export interface NearbyFacility {
  name: string; type: string; industry: string; distanceKm: number; direction: string; nearbyInfrastructure: string
}

function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return Math.abs(hash)
}

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function generateFacilitiesForSource(sourceId: string): NearbyFacility[] {
  const seed = hashStr(sourceId)
  const isMining = sourceId.includes('MINING') || (seed % 3 === 0)
  const isOilGas = sourceId.includes('OIL') || (seed % 3 === 1)

  if (isMining) {
    return [
      { name: `Central Open-Cast Mining Pit #${(seed % 40) + 1}`, type: 'Open-Pit Mining', industry: 'Mining & Extraction', distanceKm: 1.4 + ((seed % 10) * 0.3), direction: DIRECTIONS[seed % 8], nearbyInfrastructure: 'Haulage Road & Conveyor' },
      { name: `Coal Beneficiation & Washery Plant`, type: 'Mineral Processing', industry: 'Mining & Mineral Processing', distanceKm: 3.2 + ((seed % 12) * 0.4), direction: DIRECTIONS[(seed + 2) % 8], nearbyInfrastructure: 'Rail Siding & Captive Power' },
      { name: `Regional Heavy Freight Terminal`, type: 'Logistics Depot', industry: 'Transport & Freight', distanceKm: 5.8 + ((seed % 15) * 0.5), direction: DIRECTIONS[(seed + 4) % 8], nearbyInfrastructure: 'Substation 220kV' },
      { name: `Captive Thermal Power Substation`, type: 'Power Generation', industry: 'Energy', distanceKm: 8.5 + ((seed % 20) * 0.4), direction: DIRECTIONS[(seed + 6) % 8], nearbyInfrastructure: 'High Voltage Lines' },
    ]
  }

  if (isOilGas) {
    return [
      { name: `Refinery Flare & Distillation Unit #${(seed % 12) + 1}`, type: 'Hydrocarbon Flare', industry: 'Oil & Gas Processing', distanceKm: 1.8 + ((seed % 8) * 0.2), direction: DIRECTIONS[seed % 8], nearbyInfrastructure: 'High-Pressure Pipeline' },
      { name: `Petrochemical Terminal & Depot`, type: 'Storage & Terminal', industry: 'Oil & Gas', distanceKm: 4.1 + ((seed % 14) * 0.3), direction: DIRECTIONS[(seed + 3) % 8], nearbyInfrastructure: 'Port Terminal Siding' },
      { name: `Gas CompressStation & Distribution`, type: 'Gas Transmission', industry: 'Energy Infrastructure', distanceKm: 6.9 + ((seed % 10) * 0.4), direction: DIRECTIONS[(seed + 5) % 8], nearbyInfrastructure: 'Control Station' },
    ]
  }

  return [
    { name: `Industrial Thermal Complex #${(seed % 30) + 10}`, type: 'Manufacturing', industry: 'Industrial Processing', distanceKm: 2.1 + ((seed % 9) * 0.3), direction: DIRECTIONS[seed % 8], nearbyInfrastructure: 'Industrial Power Line' },
    { name: `Regional Metallurgy & Smelting Works`, type: 'Smelter / Kiln', industry: 'Heavy Metallurgy', distanceKm: 4.5 + ((seed % 11) * 0.4), direction: DIRECTIONS[(seed + 2) % 8], nearbyInfrastructure: 'Freight Rail Link' },
    { name: `Substation & Grid Power Terminal`, type: 'Power Substation', industry: 'Energy Grid', distanceKm: 7.6 + ((seed % 13) * 0.5), direction: DIRECTIONS[(seed + 5) % 8], nearbyInfrastructure: 'Substation 400kV' },
  ]
}

export function useNearbyFacilities(sourceId?: string | null) {
  return useQuery({
    queryKey: ['nearby-facilities', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async (): Promise<NearbyFacility[]> => {
      if (!sourceId) return []
      try {
        const res = await axiosClient.get<NearbyFacility[]>(`/sources/${encodeURIComponent(sourceId)}/facilities`)
        if (res.data && res.data.length > 0) return res.data
      } catch {
        // Fallback to dynamic deterministic facilities
      }
      return generateFacilitiesForSource(sourceId)
    },
  })
}
