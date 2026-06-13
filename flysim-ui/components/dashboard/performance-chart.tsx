import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ClipLoader from "react-spinners/ClipLoader"
import { useSimData } from "@/hooks/useSimData"

export function PerformanceChart() {
  const { data, isLoading, error } = useSimData()

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-[#12141C] border border-zinc-800/40">
        <ClipLoader color="#10B981" size={28} />
      </div>
    )
  }

  if (!data || !data.performance.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-[#12141C] border border-zinc-800/40 text-sm text-zinc-400">
        No performance data available.
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[#12141C] border border-zinc-800/40 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:border-zinc-700/60">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Performance Trend</h3>
          <p className="text-xs text-zinc-400">
            Score progression vs. target threshold
          </p>
        </div>
        {error ? <span className="text-xs text-amber-500">{error}</span> : null}
      </div>
      
      <div className="h-[230px] min-w-0 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          initialDimension={{ width: 600, height: 230 }}
        >
          <LineChart data={data.performance} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="#71717a"
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              fontSize={10}
              dy={10}
            />
            <YAxis
              stroke="#71717a"
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              fontSize={10}
              domain={[60, 100]}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0C10",
                borderColor: "#27272a",
                borderRadius: 12,
              }}
              labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
            />
            {/* Target Threshold (Dashed Orange Line) */}
            <Line
              type="monotone"
              name="Target"
              dataKey="altitudeStability"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
            {/* Score (Solid Emerald Line) */}
            <Line
              type="monotone"
              name="Score"
              dataKey="engineTempC"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: "#10B981", fill: "#0B0C10" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
