export function DataSourceBadge() {
  return (
    <div
      className="rounded-none border border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/60 px-3 py-2 text-[11px] font-mono text-text-secondary"
      title="FIRMS is a live daily monitoring feed with approximately 7-10 hour latency and 375-750m resolution. VNF is training-only data and is not live."
    >
      <span className="font-bold text-blue-600 dark:text-blue-400">Live: FIRMS</span>
      <span aria-hidden="true"> · </span>
      <span className="font-semibold text-text-secondary">Trained on: VNF</span>
    </div>
  )
}
