import type { StateDetectionCount } from '../../types/dashboard'

export type StateSortOption = 'name-asc' | 'count-desc' | 'count-asc'

export function sortStateDetections(states: StateDetectionCount[], sortOption: StateSortOption) {
  return states.slice().sort((a, b) => {
    if (sortOption === 'count-desc') {
      return b.total_detection_count - a.total_detection_count
    }
    if (sortOption === 'count-asc') {
      return a.total_detection_count - b.total_detection_count
    }
    return a.state_name.localeCompare(b.state_name)
  })
}
