export function DataSourceBadge() {
  return (
    <div
      className="rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-mono text-text-primary"
      title="FIRMS is a live daily monitoring feed with approximately 7-10 hour latency and 375-750m resolution. VNF is training-only data and is not live."
    >
      <span className="rounded-lg border border-border bg-accent px-1.5 py-0.5 font-semibold text-text-primary">Live: FIRMS</span>
      <span aria-hidden="true" className="mx-2 font-bold text-text-primary">·</span>
      <span className="font-semibold text-text-primary">Trained on: VNF</span>
    </div>
  )
}
