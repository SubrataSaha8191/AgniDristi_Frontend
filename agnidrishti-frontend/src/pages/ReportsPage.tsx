import { useState } from 'react'
import { Download, FileBarChart, FileText, Map, CheckCircle2 } from 'lucide-react'
import { useKPISummary } from '../services/kpiService'
import { useAlerts } from '../services/alertService'
import { useSources } from '../services/sourceService'

export default function ReportsPage() {
  const [downloadMsg, setDownloadMsg] = useState('')
  const { data: summary } = useKPISummary()
  const { data: alertsData } = useAlerts({ limit: 50, offset: 0 })
  const alerts = alertsData?.alerts ?? []
  const { data: sources = [] } = useSources()

  const handleExportCSV = (reportName: string, data: unknown) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName.toLowerCase().replaceAll(' ', '_')}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloadMsg(`Exported intelligence report "${reportName}" directly from live satellite telemetry dataset.`)
  }

  const dynamicReports = [
    {
      title: 'Executive Satellite Thermal Digest',
      type: 'Real-time Telemetry Brief',
      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      description: `Summary payload: ${summary?.thermalObjects ?? 0} thermal objects registered, ${summary?.matchedFirms ?? 0} matched sources, ${summary?.unmatchedFirms ?? 0} unmatched FIRMS detections.`,
      icon: Map,
      payload: summary,
    },
    {
      title: 'Active Alert Stream & Anomaly Log',
      type: 'Alert Intelligence Log',
      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      description: `Actionable alert payload containing ${alertsData?.count ?? 0} records from ${alertsData?.total ?? 0} active location incidents.`,
      icon: FileBarChart,
      payload: alerts,
    },
    {
      title: 'Persistent Thermal Source Proximity Report',
      type: 'Geospatial Investigation File',
      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      description: `Geospatial coordinate payload listing ${sources.length} active thermal sources mapped.`,
      icon: FileText,
      payload: sources,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
         <span className="text-[10px] font-medium text-text-secondary">Intelligence Output</span>
         <h1 className="text-2xl font-semibold text-text-primary">Intelligence Reports</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Export live geospatial and satellite anomaly briefs directly from satellite telemetry feeds.</p>
      </div>

      <div className="space-y-4">
        {dynamicReports.map(({ title, type, date, description, icon: Icon, payload }) => (
           <article key={title} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
               <div className="rounded-lg border border-border bg-accent p-2.5 text-white">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                 <p className="font-mono text-[10px] font-medium text-text-secondary">{type} · {date}</p>
                 <h2 className="mt-1 text-sm font-semibold text-text-primary">{title}</h2>
                <p className="mt-1 text-xs font-semibold text-text-secondary">{description}</p>
              </div>
            </div>
            <button type="button" onClick={() => handleExportCSV(title, payload)}
               className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-accent text-white px-4 py-2 text-xs font-medium hover:opacity-90 transition-colors cursor-pointer">
              <Download size={14} /> EXPORT JSON/CSV
            </button>
          </article>
        ))}
      </div>

      {downloadMsg && (
         <div className="flex items-center gap-2 rounded-lg border border-border bg-accent p-3 text-xs font-medium text-white">
          <CheckCircle2 size={16} /> {downloadMsg}
        </div>
      )}
    </div>
  )
}
