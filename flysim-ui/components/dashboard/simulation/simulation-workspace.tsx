"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePlus2,
  Loader2,
  Target,
  X,
} from "lucide-react"
import {
  evaluationReportSchema,
  evaluationReportsSchema,
  sourceCollectionResultSchema,
  trainingTasksSchema,
  type EvaluationReport,
  type TrainingTask,
} from "@/lib/training-schemas"
import { fallbackTrainingTasks } from "@/lib/training-fallback"

type SourceType = "Project" | "Incident" | "Case Study" | "Design Brief"

type SourceForm = {
  title: string
  summary: string
  domain: string
  sourceType: SourceType
  context: string
  objectives: string
  constraints: string
}

const emptySourceForm: SourceForm = {
  title: "",
  summary: "",
  domain: "",
  sourceType: "Project",
  context: "",
  objectives: "",
  constraints: "",
}

const categoryStyles = {
  "Computer Science": "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  Engineering: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  "Project Management": "border-amber-500/20 bg-amber-500/10 text-amber-300",
} as const

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function SimulationWorkspace() {
  const [tasks, setTasks] = useState<TrainingTask[]>(fallbackTrainingTasks)
  const [selectedTaskId, setSelectedTaskId] = useState(fallbackTrainingTasks[0].id)
  const [solution, setSolution] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)
  const [showSourceForm, setShowSourceForm] = useState(false)
  const [sourceForm, setSourceForm] = useState<SourceForm>(emptySourceForm)
  const [syncStatus, setSyncStatus] = useState<"syncing" | "live" | "offline">("syncing")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTasks() {
      try {
        const response = await fetch("/api/training/tasks", { signal: controller.signal })
        if (!response.ok) throw new Error("Training task service unavailable")

        const parsed = trainingTasksSchema.safeParse(await response.json())
        if (!parsed.success) throw new Error("Invalid training task response")

        setTasks(parsed.data)
        setSelectedTaskId((current) =>
          parsed.data.some((task) => task.id === current) ? current : parsed.data[0].id
        )

        try {
          const reportsResponse = await fetch("/api/training/reports", {
            signal: controller.signal,
          })
          if (reportsResponse.ok) {
            const reportsParsed = evaluationReportsSchema.safeParse(
              await reportsResponse.json()
            )
            const latestReport = reportsParsed.success ? reportsParsed.data[0] : undefined
            if (
              latestReport &&
              parsed.data.some((task) => task.id === latestReport.task_id)
            ) {
              setSelectedTaskId(latestReport.task_id)
              setEvaluation(latestReport)
            }
          }
        } catch {
          // Report history is optional; task practice remains available without it.
        }

        setSyncStatus("live")
      } catch (error) {
        if (controller.signal.aborted) return
        console.warn("Training API offline, using cached task library.", error)
        setSyncStatus("offline")
      }
    }

    loadTasks()
    return () => controller.abort()
  }, [])

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0],
    [selectedTaskId, tasks]
  )

  const canSubmit = solution.trim().length >= 80 && !isSubmitting
  const canCollect =
    sourceForm.title.trim().length >= 5 &&
    sourceForm.summary.trim().length >= 30 &&
    sourceForm.domain.trim().length >= 2 &&
    sourceForm.context.trim().length >= 30 &&
    splitLines(sourceForm.objectives).length > 0

  function selectTask(taskId: string) {
    setSelectedTaskId(taskId)
    setSolution("")
    setEvaluation(null)
    setMessage(null)
  }

  async function submitSolution() {
    if (!selectedTask || !canSubmit) return

    setIsSubmitting(true)
    setEvaluation(null)
    setMessage(null)

    try {
      const response = await fetch(
        `/api/training/tasks/${encodeURIComponent(selectedTask.id)}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solution: solution.trim(), use_ai: true }),
        }
      )
      const raw = await response.json()
      if (!response.ok) {
        throw new Error(
          typeof raw?.message === "string" ? raw.message : "Evaluation request failed"
        )
      }

      const parsed = evaluationReportSchema.safeParse(raw)
      if (!parsed.success) throw new Error("Invalid evaluation response")

      setEvaluation(parsed.data)
      setMessage("Evaluation complete. Skill-gap recommendations are ready.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Evaluation failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function collectSource() {
    if (!canCollect || isCollecting) return

    setIsCollecting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/training/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sourceForm.title.trim(),
          summary: sourceForm.summary.trim(),
          domain: sourceForm.domain.trim(),
          source_type: sourceForm.sourceType,
          context: sourceForm.context.trim(),
          objectives: splitLines(sourceForm.objectives),
          constraints: splitLines(sourceForm.constraints),
        }),
      })
      const raw = await response.json()
      if (!response.ok) {
        throw new Error(
          typeof raw?.message === "string" ? raw.message : "Source collection failed"
        )
      }

      const parsed = sourceCollectionResultSchema.safeParse(raw)
      if (!parsed.success) throw new Error("Invalid generated task response")

      setTasks((current) => [
        parsed.data.task,
        ...current.filter((task) => task.id !== parsed.data.task.id),
      ])
      setSelectedTaskId(parsed.data.task.id)
      setSourceForm(emptySourceForm)
      setShowSourceForm(false)
      setSolution("")
      setEvaluation(null)
      setMessage("Source collected and converted into a structured training task.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Source collection failed")
    } finally {
      setIsCollecting(false)
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-5 md:px-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-800/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Simulation Mission Control</h2>
            <span className="rounded border border-indigo-900/30 bg-indigo-950/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
              Case-to-Competency Engine
            </span>
            <span
              role="status"
              aria-live="polite"
              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                syncStatus === "live"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : syncStatus === "offline"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              {syncStatus === "live"
                ? "Task API Synced"
                : syncStatus === "offline"
                  ? "Cached Task Library"
                  : "Syncing Tasks"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Practice real engineering cases, submit decision briefs, and receive AI-assisted skill-gap analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSourceForm((current) => !current)}
          aria-expanded={showSourceForm}
          aria-controls="source-case-form"
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/15"
        >
          {showSourceForm ? <X className="h-3.5 w-3.5" /> : <FilePlus2 className="h-3.5 w-3.5" />}
          {showSourceForm ? "Close Source Intake" : "Collect Source Case"}
        </button>
      </div>

      {showSourceForm && (
        <div
          id="source-case-form"
          className="mb-5 rounded-xl border border-cyan-500/20 bg-[#0C101D] p-4"
        >
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white">Source Project / Case Intake</h3>
            <p className="mt-0.5 text-[10px] text-slate-400">
              The engine will convert this material into a task, competency map, and weighted rubric.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="source-title" className="text-[10px] font-semibold text-slate-300">
                Source title
              </label>
              <input
                id="source-title"
                value={sourceForm.title}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-1 w-full rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="source-domain" className="text-[10px] font-semibold text-slate-300">
                  Domain
                </label>
                <input
                  id="source-domain"
                  value={sourceForm.domain}
                  onChange={(event) =>
                    setSourceForm((current) => ({ ...current, domain: event.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label htmlFor="source-type" className="text-[10px] font-semibold text-slate-300">
                  Source type
                </label>
                <select
                  id="source-type"
                  value={sourceForm.sourceType}
                  onChange={(event) =>
                    setSourceForm((current) => ({
                      ...current,
                      sourceType: event.target.value as SourceType,
                    }))
                  }
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                >
                  <option>Project</option>
                  <option>Incident</option>
                  <option>Case Study</option>
                  <option>Design Brief</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="source-summary" className="text-[10px] font-semibold text-slate-300">
                Summary
              </label>
              <input
                id="source-summary"
                value={sourceForm.summary}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, summary: event.target.value }))
                }
                placeholder="At least 30 characters describing the source case."
                className="mt-1 w-full rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="source-context" className="text-[10px] font-semibold text-slate-300">
                Case context
              </label>
              <textarea
                id="source-context"
                value={sourceForm.context}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, context: event.target.value }))
                }
                placeholder="Describe the system, business need, incident, available evidence, and desired outcome."
                className="mt-1 h-24 w-full resize-y rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label htmlFor="source-objectives" className="text-[10px] font-semibold text-slate-300">
                Objectives, one per line
              </label>
              <textarea
                id="source-objectives"
                value={sourceForm.objectives}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, objectives: event.target.value }))
                }
                className="mt-1 h-24 w-full resize-y rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label htmlFor="source-constraints" className="text-[10px] font-semibold text-slate-300">
                Constraints, one per line
              </label>
              <textarea
                id="source-constraints"
                value={sourceForm.constraints}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, constraints: event.target.value }))
                }
                className="mt-1 h-24 w-full resize-y rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={collectSource}
            disabled={!canCollect || isCollecting}
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-cyan-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCollecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
            Generate Structured Task
          </button>
        </div>
      )}

      {message && (
        <p role="status" aria-live="polite" className="mb-4 rounded border border-slate-800 bg-slate-900/50 px-3 py-2 text-[10px] text-cyan-300">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        <aside className="rounded-xl border border-slate-800/50 bg-[#0C101D] p-3 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                Task Library
              </span>
              <h3 className="text-xs font-bold text-white">{tasks.length} active cases</h3>
            </div>
            <BookOpen className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            {tasks.map((task) => {
              const isSelected = task.id === selectedTask.id
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => selectTask(task.id)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-cyan-500/30 bg-cyan-500/10"
                      : "border-slate-800/60 bg-slate-950/30 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                      {task.domain}
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                  </div>
                  <span className="mt-1 block text-[11px] font-bold leading-snug text-white">
                    {task.title}
                  </span>
                  <span className="mt-2 flex items-center gap-1 text-[9px] text-slate-500">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {task.estimated_minutes} min · {task.difficulty}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="space-y-5 lg:col-span-3">
          <article className="rounded-xl border border-slate-800/50 bg-[#0C101D] p-4">
            <div className="flex flex-col gap-3 border-b border-slate-800/50 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-400">
                  {selectedTask.difficulty} · {selectedTask.domain}
                </span>
                <h3 className="mt-1 text-base font-bold text-white">{selectedTask.title}</h3>
                <p className="mt-1 text-[11px] text-slate-400">{selectedTask.brief}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:max-w-[45%] sm:justify-end">
                {selectedTask.skills.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className={`rounded border px-1.5 py-0.5 text-[8px] font-semibold ${categoryStyles[skill.category]}`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Target className="h-3.5 w-3.5" aria-hidden="true" />
                  Case Scenario
                </h4>
                <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-300">
                  {selectedTask.scenario}
                </p>
                {selectedTask.constraints.length > 0 && (
                  <>
                    <h4 className="mt-4 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Constraints
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-[10px] text-slate-400">
                      {selectedTask.constraints.map((constraint) => (
                        <li key={constraint} className="flex gap-2">
                          <AlertTriangle className="mt-0.5 h-3 w-3 flex-none text-amber-400" aria-hidden="true" />
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Required Deliverables
                </h4>
                <ol className="mt-2 space-y-2 text-[10px] text-slate-300">
                  {selectedTask.deliverables.map((deliverable, index) => (
                    <li key={deliverable} className="flex gap-2">
                      <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-indigo-500/15 text-[8px] font-bold text-indigo-300">
                        {index + 1}
                      </span>
                      {deliverable}
                    </li>
                  ))}
                </ol>
                <h4 className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scoring Rubric
                </h4>
                <div className="mt-2 space-y-2">
                  {selectedTask.rubric.map((criterion) => (
                    <div key={criterion.id} className="rounded border border-slate-800/60 bg-slate-950/30 p-2">
                      <div className="flex justify-between gap-2 text-[9px]">
                        <span className="font-semibold text-white">{criterion.title}</span>
                        <span className="font-mono text-cyan-400">{criterion.weight}%</span>
                      </div>
                      <p className="mt-1 text-[9px] text-slate-500">{criterion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <div className="rounded-xl border border-slate-800/50 bg-[#0C101D] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <label htmlFor="training-solution" className="text-xs font-bold text-white">
                  Your Engineering Decision Brief
                </label>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Address the deliverables explicitly. Minimum 80 characters.
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-500">{solution.trim().length} chars</span>
            </div>
            <textarea
              id="training-solution"
              value={solution}
              onChange={(event) => setSolution(event.target.value)}
              placeholder="Propose the architecture, validation evidence, risk controls, and delivery plan..."
              className="h-72 w-full resize-y rounded-md border border-slate-800 bg-slate-950/70 px-3 py-3 text-xs leading-relaxed text-slate-200 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[9px] text-slate-500">
                Evaluation uses Gemini when available and a transparent rubric fallback otherwise.
              </span>
              <button
                type="button"
                onClick={submitSolution}
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                {isSubmitting ? "Evaluating Submission..." : "Evaluate Submission"}
              </button>
            </div>
          </div>

          {evaluation && (
            <section aria-labelledby="evaluation-heading" className="rounded-xl border border-emerald-500/20 bg-[#0C101D] p-4">
              <div className="flex flex-col gap-3 border-b border-slate-800/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                    {evaluation.evaluator_mode === "ai" ? "AI Evaluation" : "Rubric Fallback Evaluation"}
                  </span>
                  <h3 id="evaluation-heading" className="mt-1 text-sm font-bold text-white">
                    Skill-Gap Report
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-400">{evaluation.overall_score}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-300">{evaluation.summary}</p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Rubric Assessment
                  </h4>
                  <div className="mt-2 space-y-2">
                    {evaluation.criterion_assessments.map((criterion) => (
                      <div key={criterion.criterion_id} className="rounded border border-slate-800/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-white">{criterion.title}</span>
                          <span className="font-mono text-[10px] text-cyan-400">{criterion.score}%</span>
                        </div>
                        <p className="mt-1 text-[9px] text-slate-400">{criterion.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Skill Gaps & Next Steps
                  </h4>
                  <div className="mt-2 space-y-2">
                    {evaluation.skill_gaps.length > 0 ? (
                      evaluation.skill_gaps.map((gap) => (
                        <div key={gap.skill_id} className="rounded border border-amber-500/15 bg-amber-500/5 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-white">{gap.name}</span>
                            <span className="text-[9px] font-mono text-amber-300">
                              {gap.score}% / {gap.target}%
                            </span>
                          </div>
                          <p className="mt-1 text-[9px] text-slate-400">{gap.recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-2 rounded border border-emerald-500/15 bg-emerald-500/5 p-3">
                        <CheckCircle2 className="h-4 w-4 flex-none text-emerald-400" aria-hidden="true" />
                        <p className="text-[10px] text-emerald-200">
                          All mapped skills met the current 75% benchmark.
                        </p>
                      </div>
                    )}
                  </div>
                  <ol className="mt-3 space-y-2 text-[10px] text-slate-300">
                    {evaluation.next_steps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-2">
                        <span className="font-mono text-indigo-400">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
