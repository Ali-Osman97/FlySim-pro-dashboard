import ClipLoader from "react-spinners/ClipLoader"
import { useSimData } from "@/hooks/useSimData"

export function SkillProgress() {
  const { data, isLoading, error } = useSimData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-8">
        <ClipLoader color="#6366F1" size={20} />
      </div>
    )
  }

  if (!data || !data.skills.length) {
    return (
      <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-6 text-xs text-slate-400 text-center">
        No competency metrics found.
      </div>
    )
  }

  // Quiet rating helper with Indigo, Slate, and Cyan colors
  const getSkillRating = (value: number) => {
    if (value >= 90) {
      return {
        label: "Expert",
        barBg: "bg-cyan-500",
        textCol: "text-cyan-400",
        bgLight: "bg-cyan-950/20 border-cyan-900/30"
      }
    } else if (value >= 85) {
      return {
        label: "Advanced",
        barBg: "bg-indigo-500",
        textCol: "text-indigo-400",
        bgLight: "bg-indigo-950/20 border-indigo-900/30"
      }
    } else {
      return {
        label: "Proficient",
        barBg: "bg-slate-500",
        textCol: "text-slate-400",
        bgLight: "bg-slate-800/40 border-slate-700/20"
      }
    }
  }

  return (
    <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Competency Levels
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Core flight engineering certifications and skill ratings
          </p>
        </div>
        {error ? (
          <span className="text-[10px] text-amber-500 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
            {error}
          </span>
        ) : null}
      </div>

      <div className="space-y-3.5">
        {data.skills.map((skill) => {
          const rating = getSkillRating(skill.value)
          
          return (
            <div key={skill.id} className="grid grid-cols-12 gap-2.5 items-center text-xs">
              {/* Skill Name */}
              <span className="col-span-4 font-medium text-slate-200 text-xs truncate" title={skill.name}>
                {skill.name}
              </span>

              {/* Quiet flat Progress Slider */}
              <div className="col-span-5">
                <div className="h-1.5 w-full rounded-full bg-slate-950/80 border border-slate-900/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${rating.barBg}`}
                    style={{ width: `${Math.min(Math.max(skill.value, 0), 100)}%` }}
                  />
                </div>
              </div>

              {/* Rating Label (Right) */}
              <div className="col-span-3 text-right">
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${rating.bgLight} ${rating.textCol}`}>
                  {rating.label} {skill.value}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
