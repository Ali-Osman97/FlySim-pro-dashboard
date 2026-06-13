import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import ClipLoader from "react-spinners/ClipLoader"
import { useSimData } from "@/hooks/useSimData"

export function SkillsRadar() {
  const { data, isLoading, error } = useSimData()

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-[#12141C] border border-zinc-800/40">
        <ClipLoader color="#10B981" size={28} />
      </div>
    )
  }

  if (!data || !data.skills.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-[#12141C] border border-zinc-800/40 text-sm text-zinc-400">
        No skill data available.
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[#12141C] border border-zinc-800/40 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:border-zinc-700/60">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Competency Matrix</h3>
          <p className="text-xs text-zinc-400">Core skill assessment vs. fleet benchmark</p>
        </div>
        {error ? <span className="text-xs text-amber-500">{error}</span> : null}
      </div>
      
      <div className="h-[230px] min-w-0 w-full flex items-center justify-center">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          initialDimension={{ width: 400, height: 230 }}
        >
          <RadarChart data={data.skills} outerRadius="75%" margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <PolarGrid stroke="#27272a" opacity={0.4} />
            <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: "bold" }} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#71717a", fontSize: 8 }}
              stroke="#27272a"
              opacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0C10",
                borderColor: "#27272a",
                borderRadius: 12,
              }}
              labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
            />
            <Radar
              name="Your Score"
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.25}
              dot={{ r: 3, strokeWidth: 1, stroke: "#10B981", fill: "#0B0C10" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
