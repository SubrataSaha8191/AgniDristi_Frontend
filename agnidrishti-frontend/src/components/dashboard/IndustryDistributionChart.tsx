import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useClassDistribution } from '../../services/dashboardService'

function readableLabel(label: string): string {
  return label.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

export function IndustryDistributionChart() {
  const query = useClassDistribution()
  const classes = query.data?.classes
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  return (
    <section className="flex h-full min-h-[25rem] flex-col rounded-lg border border-border/50 bg-surface p-4" aria-labelledby="industry-distribution-heading">
      <div className="border-b border-border/50 pb-3"><h2 id="industry-distribution-heading" className="text-sm font-semibold">Industry distribution</h2><p className="mt-1 text-xs text-text-secondary">Spatial classification labels, {query.data?.count ?? '…'} classes</p></div>
      {query.isLoading && <div className="mt-5 h-64 animate-pulse bg-text-primary/10" role="status"><span className="sr-only">Loading industry distribution</span></div>}
      {query.isError && <div className="grid h-64 place-items-center text-center"><div><p className="text-xs font-bold text-danger">Class distribution could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 rounded-lg border border-border px-3 py-1 text-xs font-semibold">Retry</button></div></div>}
      {query.data?.classes.length === 0 && <div className="grid h-64 place-items-center text-xs font-bold text-text-secondary">No classifications have been reported.</div>}
      {classes && classes.length > 0 && <div className="mt-3 min-h-[16rem] flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={classes} layout="vertical" margin={{ top: 2, right: 30, bottom: 2, left: 0 }} barCategoryGap="36%"><CartesianGrid horizontal={false} vertical stroke="currentColor" strokeOpacity={0.1} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} padding={{ left: 0, right: 8 }} /><YAxis type="category" dataKey="label" width={128} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} tickFormatter={(label: string) => { const readable = readableLabel(label); return readable.length > 20 ? `${readable.slice(0, 19)}…` : readable }} /><Tooltip cursor={{ fill: 'var(--color-accent)', fillOpacity: 0.06 }} contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 0, fontSize: 12 }} itemStyle={{ color: 'var(--color-accent)', fontWeight: 'bold' }} labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold', marginBottom: '4px' }} labelFormatter={(label) => readableLabel(String(label))} /><Bar dataKey="count" fill="var(--color-accent)" radius={[0, 2, 2, 0]}><LabelList dataKey="count" position="right" fill="var(--color-text-primary)" fontSize={11} fontWeight={600} /></Bar></BarChart></ResponsiveContainer></div>}
    </section>
  )
}

