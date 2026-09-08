export function DataSourceBadge() {
  return (
    <div
      className="rounded-none border-2 border-black dark:border-zinc-700 bg-surface px-3 py-2 text-[11px] font-mono text-text-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      title="FIRMS is a live daily monitoring feed with approximately 7-10 hour latency and 375-750m resolution. VNF is training-only data and is not live."
    >
      <span className="font-black uppercase text-black dark:text-[#d8f5a9] bg-[#d8f5a9] dark:bg-black px-1.5 py-0.5 border border-black dark:border-zinc-700">Live: FIRMS</span>
      <span aria-hidden="true" className="mx-2 font-bold text-text-primary">·</span>
      <span className="font-bold uppercase text-text-primary">Trained on: VNF</span>
    </div>
  )
}
