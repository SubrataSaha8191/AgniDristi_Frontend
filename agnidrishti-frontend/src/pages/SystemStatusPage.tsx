import { useRef, useState } from 'react'
import { Activity, CheckCircle2, Clock, FolderOpen, Play, Upload, XCircle } from 'lucide-react'
import { useLatestRun, useTriggerMonitoring } from '../services/monitoringRunService'
import { useVNFUpload } from '../services/vnfService'

function formatDt(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  try { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d) } catch { return iso }
}
export default function SystemStatusPage() {
  const { data: latest, isLoading, isError } = useLatestRun()
  const trigger = useTriggerMonitoring()
  const upload = useVNFUpload()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [msg, setMsg] = useState('')

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return setMsg('Select a CSV file first.')
    upload.mutate(file, {
      onSuccess: (r) => setMsg(`Uploaded ${r.filename}: ${r.inserted_detections} inserted, ${r.objects_found} objects found.`),
      onError: (e) => setMsg(`Upload failed: ${(e as Error).message}`),
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">SYSTEM & MODEL TELEMETRY</span>
        <h1 className="text-2xl font-black tracking-tight uppercase text-text-primary">System / Model Status</h1>
        <p className="mt-1 text-xs font-semibold text-text-secondary">Live satellite pipeline connectivity, dataset uploads, and FIRMS sync trigger controls.</p>
      </div>
      <section className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="flex items-center gap-2 pb-3 text-sm font-black tracking-wider uppercase border-b-2 border-text-primary text-text-primary"><Activity size={18} /> Latest Monitoring Run</h2>
        {isLoading && <p className="mt-4 text-xs font-bold uppercase text-text-secondary">Loading pipeline telemetry…</p>}
        {isError && <p className="mt-4 text-xs font-bold uppercase text-danger">Unable to fetch latest monitoring run.</p>}
        {latest && 'run_uid' in latest && (
          <div className="grid gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Status" value={latest.status} icon={latest.status === 'COMPLETED' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />} />
            <Stat label="Trigger" value={latest.trigger_type} />
            <Stat label="Started" value={formatDt(latest.started_at)} icon={<Clock size={14} />} />
            <Stat label="Duration" value={latest.duration_seconds ? `${latest.duration_seconds.toFixed(1)}s` : '—'} />
            <Stat label="Fetched" value={String(latest.fetched)} />
            <Stat label="Inserted" value={String(latest.inserted)} />
            <Stat label="Matched" value={String(latest.matched)} />
            <Stat label="Alerts Created" value={String(latest.alerts_created)} />
          </div>
        )}
      </section>
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-sm font-black tracking-wider uppercase text-text-primary">Trigger FIRMS Monitoring</h2>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Manually start a live FIRMS satellite data sync run.</p>
          <button type="button" disabled={trigger.isPending} onClick={() => trigger.mutate(1, {
            onSuccess: () => setMsg('FIRMS monitoring run triggered successfully.'),
            onError: (e) => setMsg(`Trigger failed: ${(e as Error).message}`),
          })} className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-xs font-black text-white dark:text-black uppercase bg-black dark:bg-[#d8f5a9] border-2 border-black cursor-pointer hover:bg-zinc-800 disabled:opacity-50">
            <Play size={14} />{trigger.isPending ? 'Syncing Pipeline…' : 'Run FIRMS Sync'}
          </button>
        </section>
        <section className="border-2 border-black dark:border-zinc-700 bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-sm font-black tracking-wider uppercase text-text-primary">Upload VNF Dataset</h2>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Upload a VNF CSV dataset file for processing.</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? '')} />
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 border-2 border-black dark:border-zinc-700 bg-surface px-3 py-2 text-xs font-black uppercase text-text-primary hover:bg-black hover:text-white transition-colors cursor-pointer">
              <FolderOpen size={14} /> Choose File
            </button>
            <span className="font-mono text-xs font-bold text-text-secondary truncate max-w-[160px]">{selectedFileName || 'No file chosen'}</span>
            <button type="button" disabled={upload.isPending || !selectedFileName} onClick={handleUpload} className="inline-flex items-center gap-2 border-2 border-black bg-[#d8f5a9] px-4 py-2 text-xs font-black uppercase text-black hover:opacity-90 disabled:opacity-50 cursor-pointer">
              <Upload size={14} />{upload.isPending ? 'Uploading…' : 'Upload CSV'}
            </button>
          </div>
        </section>
      </div>
      {msg && <p role="status" className="border-2 border-black bg-[#d8f5a9] p-3 text-xs font-black uppercase text-black">{msg}</p>}
    </div>
  )
}
function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 shadow-sm">
      <p className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400">{icon}{label}</p>
      <p className="mt-1 font-mono text-xs font-black uppercase text-black dark:text-white">{value}</p>
    </div>
  )
}
