import ClipLoader from "react-spinners/ClipLoader"
import { useSimData } from "@/hooks/useSimData"

export function RecentSessions() {
  const { data, isLoading, error } = useSimData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-8">
        <ClipLoader color="#6366F1" size={20} />
      </div>
    )
  }

  if (!data || !data.recentSessions.length) {
    return (
      <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-6 text-xs text-slate-400 text-center">
        No recent sessions found.
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Recent Simulation Sessions
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Log of completed assessment runs and dynamic outcome metrics
          </p>
        </div>
        {error ? (
          <span className="rounded bg-amber-950/20 border border-amber-900/30 px-1.5 py-0.5 text-[10px] text-amber-400">
            Offline: {error}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800/80 px-1.5 py-0.5 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Live Synced
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-550">
              <th className="pb-2 pl-1">Session</th>
              <th className="pb-2">Scenario</th>
              <th className="pb-2">Type</th>
              <th className="pb-2 text-center">Score</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2 pr-1 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {data.recentSessions.map((session) => {
              // Flat badges based on session type (Slate, Indigo, Cyan, Rose)
              let typeBadgeClass = "bg-slate-800/50 text-slate-400 border border-slate-700/30"
              if (session.type === "Emergency") {
                typeBadgeClass = "bg-rose-950/20 text-rose-400 border border-rose-900/30"
              } else if (session.type === "Navigation") {
                typeBadgeClass = "bg-cyan-950/20 text-cyan-400 border border-cyan-900/30"
              } else if (session.type === "Systems") {
                typeBadgeClass = "bg-indigo-950/20 text-indigo-400 border border-indigo-900/30"
              }

              // Subtle text styling for outcomes
              let scoreColorClass = "text-slate-300"
              if (session.score >= 90) {
                scoreColorClass = "text-cyan-400 font-semibold"
              } else if (session.score >= 80) {
                scoreColorClass = "text-indigo-400 font-semibold"
              } else {
                scoreColorClass = "text-slate-400"
              }

              return (
                <tr
                  key={session.id}
                  className="hover:bg-slate-900/20 transition-colors duration-100"
                >
                  <td className="py-2.5 pl-1 font-mono text-[11px] font-semibold text-white tracking-wider">
                    {session.id}
                  </td>
                  <td className="py-2.5 text-xs text-slate-200">
                    {session.scenario}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${typeBadgeClass}`}>
                      {session.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={scoreColorClass}>{session.score}%</span>
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {session.duration}
                  </td>
                  <td className="py-2.5 pr-1 text-right text-[11px] text-slate-500">
                    {session.date}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
