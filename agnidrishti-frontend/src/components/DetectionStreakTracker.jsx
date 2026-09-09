import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import 'react-activity-calendar/tooltips.css'
import { useScopedDetectionActivityCalendar } from '../services/dashboardService'
import { useThemeStore } from '../stores/themeStore'

const EMPTY_ACTIVITY = []
const LIGHT_THEME = ['#f3f4f6', '#fed7aa', '#fb923c', '#f97316', '#c2410c']
const DARK_THEME = ['#262626', '#7c2d12', '#9a3412', '#c2410c', '#f97316']

function quantile(values, fraction) {
  return values[Math.min(values.length - 1, Math.max(0, Math.ceil(values.length * fraction) - 1))]
}

function getLevel(count, thresholds) {
  if (count === 0 || thresholds.length === 0) return 0
  if (count <= thresholds[0]) return 1
  if (count <= thresholds[1]) return 2
  if (count <= thresholds[2]) return 3
  return 4
}

export default function DetectionStreakTracker({ scope, selectedSource }) {
  const isDarkMode = useThemeStore((state) => state.theme === 'dark')
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [calendarWidth, setCalendarWidth] = useState(0)
  const cardRef = useRef(null)
  const query = useScopedDetectionActivityCalendar(scope, selectedSource, selectedYear)
  const days = query.data?.days ?? EMPTY_ACTIVITY
  const nonZeroCounts = useMemo(() => days.map((day) => day.count).filter((count) => count > 0).sort((a, b) => a - b), [days])
  const thresholds = useMemo(() => nonZeroCounts.length === 0 ? [] : [0.25, 0.5, 0.75].map((fraction) => quantile(nonZeroCounts, fraction)), [nonZeroCounts])
  const activityData = useMemo(() => days.map((day) => ({ ...day, level: getLevel(day.count, thresholds) })), [days, thresholds])
  const showSkeleton = query.isLoading || (!query.isError && activityData.length === 0)
  const minimumCalendarWidth = 53 * (8 + 4) - 4 + 40
  const blockSize = calendarWidth > 0 ? Math.max(8, Math.floor((calendarWidth - 40 - 52 * 4) / 53)) : 12

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return undefined

    const updateWidth = () => setCalendarWidth(card.clientWidth - 32)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={cardRef} className="detection-activity-card border border-border bg-surface p-4" aria-labelledby="detection-activity-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <h2 id="detection-activity-heading" className="text-sm font-bold uppercase tracking-wider text-text-primary">
          <span className="mr-2 font-mono text-accent">03</span>
          Detection activity
        </h2>
        <label className="flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
          Year
          <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="border border-border bg-bg px-2 py-1 font-mono text-[10px] font-semibold text-text-primary outline-none focus:ring-1 focus:ring-accent" aria-label="Detection activity year">
            {[currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map((yearOption) => <option key={yearOption} value={yearOption}>{yearOption}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-1 text-[10px] font-bold text-text-secondary">
        {query.isLoading ? 'Loading activity...' : `${(query.data?.total_detections ?? 0).toLocaleString()} detections in ${selectedYear}`}
      </p>

      {showSkeleton && <div className="mt-4 h-[170px] w-full animate-pulse bg-text-primary/10" style={{ minWidth: `${minimumCalendarWidth}px` }} role="status" aria-label="Loading detection activity" />}
      {query.isError && <div className="py-8 text-center"><p className="text-xs font-bold text-danger">Detection activity could not be loaded.</p><button type="button" onClick={() => void query.refetch()} className="mt-3 border border-border bg-accent px-3 py-1 text-[10px] font-semibold text-white">Retry</button></div>}
      {!showSkeleton && !query.isError && (
        <div className="mt-3 overflow-x-auto pb-1 custom-scrollbar">
          <div className="w-full" style={{ minWidth: `${minimumCalendarWidth}px` }}>
            <ActivityCalendar
              data={activityData}
              theme={{ light: LIGHT_THEME, dark: DARK_THEME }}
              colorScheme={isDarkMode ? 'dark' : 'light'}
              blockSize={blockSize}
              blockMargin={4}
              fontSize={12}
              showWeekdayLabels
              labels={{ totalCount: `{{count}} detections in ${selectedYear}` }}
              tooltips={{ activity: { text: (activity) => `${activity.count} detections on ${activity.date}` } }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
