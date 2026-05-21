"use client"

import { useMemo, useState } from "react"
import { z } from "zod"
import ClipLoader from "react-spinners/ClipLoader"

type SubmitHandoffRequest = {
  scenario_title: string
  user_documentation: string
}

const SubmitHandoffResponseSchema = z.object({
  status: z.string().optional(),
  scenario: z.string().optional(),
  ai_feedback: z.string().optional(),
  detail: z.unknown().optional(),
})

type SubmitHandoffResponse = z.infer<typeof SubmitHandoffResponseSchema>

const API_ROUTE = "/api/submit-hand-off"

export function SimulationWorkspace() {
  const [scenarioTitle, setScenarioTitle] = useState("Demo Scenario")
  const [userDocumentation, setUserDocumentation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitHandoffResponse | null>(null)

  const canSubmit = useMemo(() => {
    return scenarioTitle.trim().length > 0 && userDocumentation.trim().length > 0
  }, [scenarioTitle, userDocumentation])

  async function onSubmit() {
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const payload: SubmitHandoffRequest = {
        scenario_title: scenarioTitle.trim(),
        user_documentation: userDocumentation.trim(),
      }

      const res = await fetch(API_ROUTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const rawData = await res.json()
      const data = SubmitHandoffResponseSchema.parse(rawData)

      if (!res.ok) {
        setResult(data)
        setError(`Request failed (${res.status})`)
        return
      }

      setResult(data)
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(`Validation error: ${e.issues[0]?.message ?? e.message}`)
      } else {
        setError(e instanceof Error ? e.message : "Unknown error")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-5 md:px-6">
      <div className="rounded-lg border border-slate-800/50 bg-[#0C101D] p-5 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Simulation Mission Control</h2>
            <span className="rounded bg-indigo-950/30 border border-indigo-900/30 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
              Handoff Workspace
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Submits engineering handoffs to the FlySim orchestration engine via{" "}
            <span className="font-mono text-slate-400 bg-slate-900/60 px-1 py-0.5 rounded border border-slate-800/40">
              {API_ROUTE}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Form Side */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Scenario Title
              </label>
              <input
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-850 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="e.g. Conveyor Retrofit Safety Review"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                User Documentation & Flight Logs
              </label>
              <textarea
                value={userDocumentation}
                onChange={(e) => setUserDocumentation(e.target.value)}
                className="mt-1.5 h-64 w-full resize-none rounded-md border border-slate-850 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none font-sans leading-relaxed"
                placeholder="Paste telemetry logs, cockpit transcripts, or scenario descriptions here…"
              />
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
                className={[
                  "rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 select-none",
                  !canSubmit || isSubmitting
                    ? "bg-slate-800/40 text-slate-500 border border-slate-700/20 cursor-not-allowed"
                    : "bg-indigo-600 text-white border border-indigo-500/20 hover:bg-indigo-500 cursor-pointer active:scale-[0.98]",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <ClipLoader color="#ffffff" size={10} /> Submitting...
                  </span>
                ) : (
                  "Submit Handoff"
                )}
              </button>

              {error ? (
                <div className="rounded bg-rose-950/20 border border-rose-900/30 px-3 py-1 text-xs text-rose-400">
                  Failed: {error}
                </div>
              ) : null}
            </div>
          </div>

          {/* Response/Result Side */}
          <div className="rounded-md border border-slate-850 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Response Log Output
                </span>
                {result ? (
                  <span className="text-[9px] bg-cyan-950/30 border border-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-400 font-bold uppercase">
                    Success 200 OK
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-900/40 border border-slate-800/80 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                    Awaiting submit
                  </span>
                )}
              </div>
              <pre className="mt-1.5 max-h-[380px] overflow-auto text-xs font-mono leading-relaxed text-cyan-400">
                {result ? JSON.stringify(result, null, 2) : "// Run Handoff to fetch telemetry metrics from the orchestration engine..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
