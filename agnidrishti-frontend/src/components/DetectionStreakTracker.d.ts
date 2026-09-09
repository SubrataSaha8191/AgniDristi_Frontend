import type { ComponentType } from 'react'

declare const DetectionStreakTracker: ComponentType<{
  scope: { stateName?: string; districtName?: string; factoryName?: string; category?: string }
  selectedSource: 'vnf' | 'firms' | 'all'
}>

export default DetectionStreakTracker
