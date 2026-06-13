"use client"

import React, { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  FileText,
  Download,
  Filter,
  Brain,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Layers,
  Search,
  RefreshCw,
} from "lucide-react"
import {
  reportsResponseSchema,
  type ApiInsight,
  type ReportItem,
  type ReportsResponse,
} from "@/lib/dashboard-schemas"
import { buildReportsCsv } from "@/lib/report-export"

type CrewAIInsightItem = ApiInsight & { icon?: React.ReactNode }

const fallbackVelocityData: ReportsResponse["velocityData"] = [
  { month: "Jan", Velocity: 82, Completed: 78, Target: 80 },
  { month: "Feb", Velocity: 85, Completed: 84, Target: 82 },
  { month: "Mar", Velocity: 89, Completed: 88, Target: 85 },
  { month: "Apr", Velocity: 92, Completed: 90, Target: 88 },
  { month: "May", Velocity: 94, Completed: 95, Target: 90 },
  { month: "Jun", Velocity: 98, Completed: 96, Target: 95 },
]

const fallbackEfficiencyData: ReportsResponse["efficiencyData"] = [
  { module: "Actuation", Efficiency: 92, DeliveryDays: 14 },
  { module: "Power Systems", Efficiency: 85, DeliveryDays: 18 },
  { module: "Agile Sprints", Efficiency: 88, DeliveryDays: 12 },
  { module: "Embedded OS", Efficiency: 95, DeliveryDays: 10 },
  { module: "Control Loops", Efficiency: 78, DeliveryDays: 22 },
]

const fallbackReportsList: ReportItem[] = [
  { id: "REP-26-05", title: "Q2 Mechatronics Sprint Diagnostic", discipline: "Mechatronics & Robotics", risk: "Low", date: "May 18, 2026" },
  { id: "REP-26-04", title: "HIL Integration Latency Audit", discipline: "Systems Architecture", risk: "Medium", date: "Apr 22, 2026" },
  { id: "REP-26-03", title: "Agile Resource Re-allocation Review", discipline: "Project Management", risk: "High", date: "Mar 15, 2026" },
  { id: "REP-26-02", title: "API Microservices Scalability Stress-Test", discipline: "Software Development", risk: "Low", date: "Feb 28, 2026" },
  { id: "REP-26-01", title: "System Security & RTOS Risk Vectoring", discipline: "Risk Mitigation", risk: "Medium", date: "Jan 10, 2026" },
]

const fallbackCrewAIInsights: ApiInsight[] = [
  {
    id: "insight-1",
    category: "SYSTEMS & MECHATRONICS",
    title: "Kalman Filter HIL Actuation Calibration",
    description: "CrewAI analysis detected a 15% latency reduction in actuator feedback loops during hardware-in-the-loop tests. Expand configuration adjustments to secondary roll dynamics.",
    impact: "High",
    colorClass: "border-cyan-500",
  },
  {
    id: "insight-2",
    category: "PROJECT MANAGEMENT & AGILITY",
    title: "Agile Resource Bottleneck Correction",
    description: "Sub-skill logs indicate high task queue load. Reallocating 2 FTEs from administrative logs to software dev modules can raise sprint velocity by an estimated 8%.",
    impact: "Medium",
    colorClass: "border-indigo-600",
  },
  {
    id: "insight-3",
    category: "RISK MITIGATION & ARCHITECTURE",
    title: "Real-time Execution Pipeline Thresholds",
    description: "High CPU cycles logged in control loops. Recommend immediate compiler optimizations (-O3 flag enablement) and thread priority assignment for RTOS tasks.",
    impact: "High",
    colorClass: "border-rose-400",
  },
]

const getInsightIcon = (id: string) => {
  if (id === "insight-1") return <CpuIcon className="h-3.5 w-3.5 text-cyan-400" />
  if (id === "insight-2") return <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
  return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
}

const CpuIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
  </svg>
)

const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

export function ReportsAnalytics() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All")
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const [velocityData, setVelocityData] = useState(fallbackVelocityData)
  const [efficiencyData, setEfficiencyData] = useState(fallbackEfficiencyData)
  const [crewAIInsights, setCrewAIInsights] = useState<CrewAIInsightItem[]>(
    fallbackCrewAIInsights.map((insight) => ({ ...insight, icon: getInsightIcon(insight.id) }))
  )
  const [reportsList, setReportsList] = useState<ReportItem[]>(fallbackReportsList)
  const [syncStatus, setSyncStatus] = useState<"syncing" | "live" | "offline">("syncing")
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const controller = new AbortController()

    async function fetchReports() {
      try {
        setSyncStatus("syncing")
        const res = await fetch("/api/dashboard/reports", { signal: controller.signal })
        if (!res.ok) throw new Error("Failed to get live feed")

        const parsed = reportsResponseSchema.safeParse(await res.json())
        if (!parsed.success) {
          throw new Error("Invalid reports API response")
        }
        const data = parsed.data

        setVelocityData(data.velocityData)
        setEfficiencyData(data.efficiencyData)
        setReportsList(data.reportsList)

        const mappedInsights = data.crewAIInsights.map((insight) => ({
          ...insight,
          icon: getInsightIcon(insight.id)
        }))
        setCrewAIInsights(mappedInsights)

        setSyncStatus("live")
        setSyncError(null)
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : "Unknown API error"
        console.warn("FastAPI Reports offline, falling back to cached presets.", error)
        setSyncStatus("offline")
        setSyncError(`FastAPI connection offline: ${message}. Using cached presets.`)
      }
    }

    fetchReports()
    return () => controller.abort()
  }, [])

  const filteredReports = reportsList.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDiscipline = selectedDiscipline === "All" || report.discipline === selectedDiscipline
    return matchesSearch && matchesDiscipline
  })

  const latestVelocity = velocityData[velocityData.length - 1]
  const previousVelocity = velocityData[velocityData.length - 2]
  const velocityGrowth = previousVelocity
    ? ((latestVelocity.Velocity - previousVelocity.Velocity) / previousVelocity.Velocity) * 100
    : 0
  const milestoneHealth = efficiencyData.reduce((total, item) => total + item.Efficiency, 0) / efficiencyData.length
  const activeBottlenecks = crewAIInsights.filter((insight) => insight.impact === "High").length
  const sprintAccuracy = latestVelocity.Velocity
    ? (latestVelocity.Completed / latestVelocity.Velocity) * 100
    : 0
  const operationalVariance = latestVelocity.Completed - latestVelocity.Target
  const weakestModule = efficiencyData.reduce((weakest, item) =>
    item.Efficiency < weakest.Efficiency ? item : weakest
  )

  const handleExport = (type: "PDF" | "CSV") => {
    if (filteredReports.length === 0) {
      setExportMessage("No reports match the current filters. Adjust the filters before exporting.")
      return
    }

    setIsExporting(true)
    setExportType(type)
    setExportMessage(null)

    try {
      if (type === "CSV") {
        const csv = buildReportsCsv(filteredReports)
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
        const link = document.createElement("a")
        link.href = url
        link.download = `flysim-reports-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        setExportMessage(`Exported ${filteredReports.length} report rows to CSV.`)
      } else {
        const printWindow = window.open("", "_blank", "width=960,height=720")
        if (!printWindow) {
          throw new Error("The print window was blocked by the browser")
        }

        const reportRows = filteredReports
          .map(
            (report) => `
              <tr>
                <td>${escapeHtml(report.id)}</td>
                <td>${escapeHtml(report.title)}</td>
                <td>${escapeHtml(report.discipline)}</td>
                <td>${escapeHtml(report.risk)}</td>
                <td>${escapeHtml(report.date)}</td>
              </tr>`
          )
          .join("")

        const insightRows = crewAIInsights
          .map(
            (insight) => `
              <article>
                <strong>${escapeHtml(insight.title)} (${escapeHtml(insight.impact)})</strong>
                <p>${escapeHtml(insight.description)}</p>
              </article>`
          )
          .join("")

        printWindow.document.write(`<!doctype html>
          <html>
            <head>
              <title>FlySim Reports Export</title>
              <style>
                body { color: #111827; font: 14px/1.5 Arial, sans-serif; margin: 32px; }
                h1 { margin-bottom: 4px; }
                .meta { color: #64748b; margin-bottom: 24px; }
                table { border-collapse: collapse; margin: 16px 0 28px; width: 100%; }
                th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                th { background: #e2e8f0; }
                article { border-left: 3px solid #0891b2; margin: 12px 0; padding-left: 12px; }
                article p { color: #475569; margin: 4px 0; }
                @media print { body { margin: 16mm; } }
              </style>
            </head>
            <body>
              <h1>FlySim Reports & System Analytics</h1>
              <div class="meta">Generated ${escapeHtml(new Date().toLocaleString())}</div>
              <h2>Executive Audits</h2>
              <table>
                <thead>
                  <tr><th>Report ID</th><th>Title</th><th>Discipline</th><th>Risk</th><th>Date</th></tr>
                </thead>
                <tbody>${reportRows}</tbody>
              </table>
              <h2>Engineering Insights</h2>
              ${insightRows}
            </body>
          </html>`)
        printWindow.document.close()
        printWindow.focus()
        printWindow.setTimeout(() => printWindow.print(), 150)
        setExportMessage("Opened the printable report. Choose Save as PDF in the print dialog.")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Export failed"
      setExportMessage(message)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Metadata Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-white">Reports & System Analytics</h2>
            
            {syncStatus === "syncing" && (
              <span role="status" aria-live="polite" className="flex items-center gap-1 text-[8px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded animate-pulse select-none">
                <RefreshCw className="h-2 w-2 animate-spin" />
                <span>Syncing API...</span>
              </span>
            )}
            {syncStatus === "live" && (
              <span role="status" aria-live="polite" className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded select-none">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>API Feed Synced</span>
              </span>
            )}
            {syncStatus === "offline" && (
              <span role="status" aria-live="polite" className="flex items-center gap-1 text-[8px] font-bold text-slate-500 bg-slate-800/5 border border-slate-700/10 px-1.5 py-0.5 rounded select-none" title={syncError || ""}>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span>Offline Mode</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            API-backed project velocity audits, module resource logs, and engineering recommendation summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("CSV")}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded bg-[#0C101D] border border-slate-800/50 hover:border-slate-700/50 text-[10px] font-semibold text-slate-300 px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Download className="h-3 w-3 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded bg-indigo-600 border border-indigo-500/20 hover:bg-indigo-500 text-[10px] font-semibold text-white px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isExporting && exportType === "PDF" ? (
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </div>
      {exportMessage && (
        <p role="status" className="-mt-3 text-right text-[10px] text-cyan-400">
          {exportMessage}
        </p>
      )}

      {/* Main Grid: CrewAI Summary + Stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Column 1 & 2: CrewAI Autonomous Executive Summary */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/20 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 font-mono">Engineering Intelligence Summary</span>
              </div>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                Dataset Ready
              </span>
            </div>
            
            <h3 className="mt-3 text-xs font-bold text-white">{latestVelocity.month} Milestone Health & Resource Review</h3>
            <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
              Project velocity changed {velocityGrowth >= 0 ? "+" : ""}{velocityGrowth.toFixed(1)}% in the latest
              cycle. The synchronized dataset contains {activeBottlenecks} high-priority recommendations.
              {` ${weakestModule.module} is the lowest-efficiency module at ${weakestModule.Efficiency}%, with a ${weakestModule.DeliveryDays}-day delivery cycle.`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800/20 pt-4">
            <div className="p-2 rounded bg-[#060913]/30 border border-slate-800/20">
              <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-medium">Milestone Health</span>
              <span className="mt-1 block text-sm font-bold text-white">{milestoneHealth.toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#060913]/30 border border-slate-800/20">
              <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-medium">Active Bottlenecks</span>
              <span className="mt-1 block text-sm font-bold text-cyan-400 font-mono">{activeBottlenecks} Detected</span>
            </div>
            <div className="p-2 rounded bg-[#060913]/30 border border-slate-800/20">
              <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-medium">Sprint Accuracy</span>
              <span className="mt-1 block text-sm font-bold text-indigo-400 font-mono">{sprintAccuracy.toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#060913]/30 border border-slate-800/20">
              <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-medium">Delivery Variance</span>
              <span className="mt-1 block text-sm font-bold text-rose-400 font-mono">
                {operationalVariance >= 0 ? "+" : ""}{operationalVariance} Target Variance
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Critical Path Alerts */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 font-mono">Telemetry Warnings</span>
            <h3 className="mt-1 text-xs font-bold text-white">Actionable PM Discrepancies</h3>
            <p className="text-[10px] text-slate-400">
              Critical engineering risk points compiled automatically from mechatronics feedback loops.
            </p>
          </div>

          <div className="space-y-2.5 my-3 flex-1 overflow-y-auto">
            {crewAIInsights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className={`flex items-start gap-2 rounded border p-2 transition-all ${
                  insight.impact === "High"
                    ? "border-rose-500/10 bg-rose-500/5"
                    : "border-amber-500/10 bg-amber-500/5"
                }`}
              >
                <AlertTriangle
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                    insight.impact === "High" ? "text-rose-400" : "text-amber-400"
                  }`}
                />
                <div>
                  <h4 className="text-[9px] font-bold text-white uppercase tracking-wider">
                    {insight.title} ({insight.impact})
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/20 pt-3 text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold">
            {syncStatus === "live" ? "Telemetry feed synchronized" : "Using cached telemetry"}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg">
        <div className="border-b border-slate-800/20 pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            Engineering Insight Feed
          </span>
          <h3 className="mt-1 text-xs font-bold text-white">Prioritized Recommendations</h3>
          <p className="text-[10px] text-slate-400">
            Recommendations supplied by the reports API and preserved locally when the backend is unavailable.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {crewAIInsights.map((insight) => (
            <article
              key={insight.id}
              className={`rounded-lg border border-slate-800/30 border-l-2 ${insight.colorClass} bg-[#060913]/30 p-3`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold tracking-wide text-slate-400 font-mono">
                  {insight.category}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                    insight.impact === "High"
                      ? "bg-rose-500/10 text-rose-400"
                      : insight.impact === "Medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {insight.impact}
                </span>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <div className="rounded bg-slate-800/60 p-1">{insight.icon || getInsightIcon(insight.id)}</div>
                <div>
                  <h4 className="text-[10px] font-bold text-white">{insight.title}</h4>
                  <p className="mt-1 text-[9px] leading-normal text-slate-400">{insight.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Section A: Project Velocity Area Chart */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Project Velocity & Sprint Burn-down</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Comparative representation of velocity delivery versus historical monthly targets.
            </p>
          </div>

          <div className="h-[200px] min-w-0 w-full mt-4 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
                initialDimension={{ width: 600, height: 200 }}
              >
                <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" opacity={0.3} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 8 }} stroke="#1e293b" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 8 }} stroke="#1e293b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C101D",
                      borderColor: "rgba(148,163,184,0.12)",
                      borderRadius: 8,
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "8px", paddingTop: "5px" }} iconSize={7} />
                  <Area
                    type="monotone"
                    dataKey="Velocity"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorVelocity)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="Target"
                    stroke="#475569"
                    fillOpacity={0}
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[10px] text-slate-500">Loading velocity metrics...</span>
            )}
          </div>
        </div>

        {/* Section B: Resource Efficiency Bar Chart */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Resource Efficiency & Time-to-Delivery</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Efficiency percentages and actual lifecycle delivery days logged across active modules.
            </p>
          </div>

          <div className="h-[200px] min-w-0 w-full mt-4 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
                initialDimension={{ width: 600, height: 200 }}
              >
                <BarChart data={efficiencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" opacity={0.3} strokeDasharray="3 3" />
                  <XAxis dataKey="module" tick={{ fill: "#94a3b8", fontSize: 8 }} stroke="#1e293b" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 8 }} stroke="#1e293b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C101D",
                      borderColor: "rgba(148,163,184,0.12)",
                      borderRadius: 8,
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "8px", paddingTop: "5px" }} iconSize={7} />
                  <Bar dataKey="Efficiency" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={12} name="Efficiency %" />
                  <Bar dataKey="DeliveryDays" fill="#475569" radius={[3, 3, 0, 0]} barSize={12} name="Delivery Days" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[10px] text-slate-500">Loading module diagnostics...</span>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table & Search/Filter Interface */}
      <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/20 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white">Monthly Executive Audits</h3>
            <p className="text-[10px] text-slate-400">Search and filter validated tech logs compiled over the current annual cycle.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-auto">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search aria-hidden="true" className="absolute left-2.5 h-3 w-3 text-slate-500" />
              <label htmlFor="reports-search" className="sr-only">Search reports by title or ID</label>
              <input
                id="reports-search"
                type="text"
                placeholder="Search report title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded bg-[#060913]/60 border border-slate-800/50 px-2.5 py-1 pl-7 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-slate-700/60 w-full sm:w-[180px] transition-all"
              />
            </div>
            {/* Discipline Filter */}
            <div className="relative flex items-center">
              <Filter aria-hidden="true" className="absolute left-2.5 h-3 w-3 text-slate-500" />
              <label htmlFor="reports-discipline" className="sr-only">Filter reports by discipline</label>
              <select
                id="reports-discipline"
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="rounded bg-[#060913]/60 border border-slate-800/50 px-2.5 py-1 pl-7 text-[10px] text-white focus:outline-none focus:border-slate-700/60 cursor-pointer w-full sm:w-[150px] appearance-none"
              >
                <option value="All">All Disciplines</option>
                <option value="Mechatronics & Robotics">Mechatronics & Robotics</option>
                <option value="Systems Architecture">Systems Architecture</option>
                <option value="Project Management">Project Management</option>
                <option value="Software Development">Software Development</option>
                <option value="Risk Mitigation">Risk Mitigation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table Layout */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-slate-800/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 pl-2 font-mono">Report ID</th>
                <th className="pb-2.5">Title</th>
                <th className="pb-2.5">Discipline</th>
                <th className="pb-2.5 text-center">Risk Level</th>
                <th className="pb-2.5 pr-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#060913]/20 transition-all select-none">
                    <td className="py-2.5 pl-2 font-mono text-slate-500 font-medium">{report.id}</td>
                    <td className="py-2.5 font-bold text-white">{report.title}</td>
                    <td className="py-2.5 text-slate-400">{report.discipline}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold ${
                          report.risk === "High"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                            : report.risk === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        }`}
                      >
                        {report.risk}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right text-slate-400">{report.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold uppercase tracking-wider">
                    No reports match selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/20 pt-3 mt-4 text-[9px] text-slate-500">
          <span>Displaying {filteredReports.length} of {reportsList.length} logs</span>
          <span className="flex items-center gap-1 select-none">
            <Layers className="h-3 w-3" /> Compliance-Standard Audit Logs
          </span>
        </div>
      </div>
    </div>
  )
}
