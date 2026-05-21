import ClipLoader from "react-spinners/ClipLoader"
import { useSimData } from "@/hooks/useSimData"
import { Activity, Clock, Target, TrendingUp } from "lucide-react"

export function StatsCards() {
  const { data, isLoading, error } = useSimData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-28 items-center justify-center rounded-xl bg-[#12141C] border border-zinc-800/40 px-4 py-8">
            <ClipLoader color="#10B981" size={24} />
          </div>
        ))}
      </div>
    )
  }

  if (!data || !data.stats || !data.stats.length) {
    return (
      <div className="rounded-xl bg-[#12141C] border border-zinc-800/40 px-4 py-6 text-sm text-zinc-400">
        No statistics available.
      </div>
    )
  }

  // Helper to resolve specific icons per KPI
  const getIcon = (id: string) => {
    switch (id) {
      case "overall-score":
        return <Target className="h-5 w-5" />
      case "flight-hours":
        return <Clock className="h-5 w-5" />
      case "active-scenarios":
        return <Activity className="h-5 w-5" />
      case "skill-growth":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.stats.map((stat) => {
        const isWarning = stat.changeType === "warning"
        
        return (
          <div
            key={stat.id}
            className="relative overflow-hidden rounded-xl bg-[#12141C] border border-zinc-800/45 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:border-zinc-700/60 hover:shadow-black/20 group"
          >
            {/* Top row: Icon and Trend change */}
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                {getIcon(stat.id)}
              </div>
              
              {stat.change ? (
                <span
                  className={[
                    "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 select-none",
                    isWarning
                      ? "bg-amber-500/10 text-[#F59E0B] border border-amber-500/10"
                      : "bg-emerald-500/10 text-[#10B981] border border-emerald-500/10",
                  ].join(" ")}
                >
                  {!isWarning && "↗ "}
                  {stat.change}
                </span>
              ) : null}
            </div>

            {/* Middle: Huge Value */}
            <div className="mt-4 text-3xl font-bold tracking-tight text-white font-mono">
              {stat.value}
            </div>

            {/* Bottom: Label */}
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {stat.label}
            </div>

            {error ? (
              <div className="mt-2 text-[10px] text-amber-500/80">{error}</div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}


