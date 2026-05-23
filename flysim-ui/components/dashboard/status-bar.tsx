import { useSimData } from "@/hooks/useSimData"

export function StatusBar() {
  const { error } = useSimData()

  return (
    <div className="border-t border-zinc-800/60 bg-[#0B0C10]/90 backdrop-blur-sm px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-550 select-none md:px-6">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
        <span className="text-zinc-500 font-semibold">
          FlySim Pro · Engineering & Project Management Dashboard
        </span>
        
        {error ? (
          <span className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sync degradation: {error}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#10B981] font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10b981]" />
            Live Data Link Healthy
          </span>
        )}
      </div>
    </div>
  )
}
