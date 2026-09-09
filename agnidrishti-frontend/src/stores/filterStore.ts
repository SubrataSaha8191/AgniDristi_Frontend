import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { GasFlareLikelihood } from '../types/dashboard'

export type DateRange = {
  from: string
  to: string
}

export type FilterState = {
  sourceId: string
  location: string
  facility: string
  dateRange: DateRange
  sourceType: string
  industryType: string
  anomalyLevel: string
  confidenceLevel: string
  persistenceStatus: string
  classification: string
  temporalSource: string
  gasFlareLikelihood: GasFlareLikelihood | ''
  likelyFlaresOnly: boolean
  objectLimit: number
  objectOffset: number
  setSourceId: (sourceId: string) => void
  setLocation: (location: string) => void
  setFacility: (facility: string) => void
  setDateRange: (dateRange: DateRange) => void
  setSourceType: (sourceType: string) => void
  setIndustryType: (industryType: string) => void
  setAnomalyLevel: (anomalyLevel: string) => void
  setConfidenceLevel: (confidenceLevel: string) => void
  setPersistenceStatus: (persistenceStatus: string) => void
  setClassification: (classification: string) => void
  setTemporalSource: (temporalSource: string) => void
  setGasFlareLikelihood: (gasFlareLikelihood: GasFlareLikelihood | '') => void
  setLikelyFlaresOnly: (likelyFlaresOnly: boolean) => void
  setObjectLimit: (objectLimit: number) => void
  setObjectOffset: (objectOffset: number) => void
  reset: () => void
}

const initialFilters = {
  sourceId: '',
  location: '',
  facility: '',
  dateRange: { from: '', to: '' },
  sourceType: '',
  industryType: '',
  anomalyLevel: '',
  confidenceLevel: '',
  persistenceStatus: '',
  classification: '',
  temporalSource: '',
  gasFlareLikelihood: '' as GasFlareLikelihood | '',
  likelyFlaresOnly: false,
  objectLimit: 10,
  objectOffset: 0,
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialFilters,
      setSourceId: (sourceId) => set({ sourceId }),
      setLocation: (location) => set({ location }),
      setFacility: (facility) => set({ facility }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSourceType: (sourceType) => set({ sourceType }),
      setIndustryType: (industryType) => set({ industryType }),
      setAnomalyLevel: (anomalyLevel) => set({ anomalyLevel }),
      setConfidenceLevel: (confidenceLevel) => set({ confidenceLevel }),
      setPersistenceStatus: (persistenceStatus) => set({ persistenceStatus }),
      setClassification: (classification) => set({ classification }),
      setTemporalSource: (temporalSource) => set({ temporalSource }),
      setGasFlareLikelihood: (gasFlareLikelihood) => set({ gasFlareLikelihood }),
      setLikelyFlaresOnly: (likelyFlaresOnly) => set({ likelyFlaresOnly }),
      setObjectLimit: (objectLimit) => set({ objectLimit }),
      setObjectOffset: (objectOffset) => set({ objectOffset }),
      reset: () => set(initialFilters),
    }),
    {
      name: 'agnidrishti-filter-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
