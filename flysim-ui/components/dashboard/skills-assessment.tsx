"use client"

import React, { useState, useEffect } from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import {
  Cpu,
  Layers,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Zap,
  Info,
} from "lucide-react"

// Types
interface SubSkill {
  name: string
  score: number // out of 100
  benchmark: number
  trend: "up" | "stable" | "down"
}

interface SkillCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  colorTheme: {
    text: string
    bg: string
    border: string
    accent: string
    fill: string
  }
  subSkills: SubSkill[]
}

interface Insight {
  id: string
  category: string
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  colorClass: string
  icon: React.ReactNode
}

// Static Data
const radarData = [
  { subject: "Project Management", Actual: 85, Benchmark: 75 },
  { subject: "Systems Architecture", Actual: 72, Benchmark: 80 },
  { subject: "Mechatronics & Robotics", Actual: 90, Benchmark: 85 },
  { subject: "Software Dev", Actual: 88, Benchmark: 70 },
  { subject: "Risk Mitigation", Actual: 65, Benchmark: 75 },
]

const skillCategories: SkillCategory[] = [
  {
    id: "pm-agility",
    title: "Project Management & Agility",
    description: "Scope, scheduling, and sprint mechanics for complex engineering cycles.",
    icon: <Briefcase className="h-3.5 w-3.5" />,
    colorTheme: {
      text: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      accent: "bg-indigo-500",
      fill: "#6366f1",
    },
    subSkills: [
      { name: "Agile Sprint Planning", score: 88, benchmark: 75, trend: "up" },
      { name: "Resource Allocation", score: 82, benchmark: 78, trend: "stable" },
      { name: "Scope Management", score: 85, benchmark: 72, trend: "up" },
    ],
  },
  {
    id: "mechatronics",
    title: "Systems & Mechatronics Engineering",
    description: "Multidisciplinary hardware-software loops, dynamics, and automation controls.",
    icon: <Cpu className="h-3.5 w-3.5" />,
    colorTheme: {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      accent: "bg-cyan-500",
      fill: "#06b6d4",
    },
    subSkills: [
      { name: "Hardware-Software Integration", score: 78, benchmark: 80, trend: "stable" },
      { name: "Control Systems & Robotics", score: 92, benchmark: 85, trend: "up" },
      { name: "Embedded Systems", score: 85, benchmark: 76, trend: "up" },
    ],
  },
  {
    id: "tech-execution",
    title: "Technical Execution & Tech Stack",
    description: "Modern full-stack services, system scale, and continuous deployment workflows.",
    icon: <Layers className="h-3.5 w-3.5" />,
    colorTheme: {
      text: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      accent: "bg-slate-400",
      fill: "#94a3b8",
    },
    subSkills: [
      { name: "Full-Stack Dev", score: 90, benchmark: 70, trend: "up" },
      { name: "API Architecture", score: 85, benchmark: 75, trend: "stable" },
      { name: "Automation/DevOps", score: 80, benchmark: 65, trend: "up" },
    ],
  },
]

const crewAIInsights: Insight[] = [
  {
    id: "insight-1",
    category: "SYSTEMS & MECHATRONICS",
    title: "Kalman Filter HIL Actuation Calibration",
    description: "CrewAI analysis detected a 15% latency reduction in actuator feedback loops during hardware-in-the-loop tests. Expand configuration adjustments to secondary roll dynamics.",
    impact: "High",
    colorClass: "border-cyan-500",
    icon: <Cpu className="h-3.5 w-3.5 text-cyan-400" />,
  },
  {
    id: "insight-2",
    category: "PROJECT MANAGEMENT & AGILITY",
    title: "Agile Resource Bottleneck Correction",
    description: "Sub-skill logs indicate high task queue load. Reallocating 2 FTEs from administrative logs to software dev modules can raise sprint velocity by an estimated 8%.",
    impact: "Medium",
    colorClass: "border-indigo-600",
    icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />,
  },
  {
    id: "insight-3",
    category: "RISK MITIGATION & ARCHITECTURE",
    title: "Real-time Execution Pipeline Thresholds",
    description: "High CPU cycles logged in control loops. Recommend immediate compiler optimizations (-O3 flag enablement) and thread priority assignment for RTOS tasks.",
    impact: "High",
    colorClass: "border-rose-400",
    icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
  },
]

export function SkillsAssessment() {
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Title & Metadata Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-800/40 pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white">Skills Assessment & Analytics</h2>
          <p className="text-[11px] text-slate-400">
            Real-time multi-disciplinary engineering competency diagnostics and automated CrewAI optimization insights.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start rounded bg-[#0C101D] px-2.5 py-1 border border-slate-800/50">
          <Award className="h-3 w-3 text-indigo-400" />
          <span className="text-[10px] font-semibold text-slate-300">Level 4 Certified Systems Engineer</span>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-3 shadow-lg transition-all duration-300 hover:border-slate-700/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Overall Competency Score</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <Zap className="h-2.5 w-2.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">82.3%</span>
            <span className="text-[10px] font-medium text-cyan-400">+3.4% vs benchmark</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-3 shadow-lg transition-all duration-300 hover:border-slate-700/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Skills Validated</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="h-2.5 w-2.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">9 / 9 Domains</span>
            <span className="text-[10px] font-medium text-slate-400">100% compliance rate</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-3 shadow-lg transition-all duration-300 hover:border-slate-700/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Active CrewAI Focus</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <BookOpen className="h-2.5 w-2.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">3 Action Items</span>
            <span className="text-[10px] font-medium text-rose-400">1 Critical path task</span>
          </div>
        </div>
      </div>

      {/* Advanced 3-Column Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Column 1: Radar Chart Competency Matrix */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              <Info className="h-3 w-3" />
              <span>Competency Matrix</span>
            </div>
            <h3 className="mt-1 text-xs font-bold text-white">Engineering Radar Profile</h3>
            <p className="text-[10px] text-slate-400">
              Dimensional assessment contrasting your technical execution metrics against industry-standard engineering benchmarks.
            </p>
          </div>

          <div className="h-[250px] w-full mt-4 flex items-center justify-center relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#1e293b" opacity={0.5} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: "bold" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#475569", fontSize: 7 }}
                    stroke="#1e293b"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C101D",
                      borderColor: "rgba(148,163,184,0.12)",
                      borderRadius: 8,
                      fontSize: "10px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "9px", paddingTop: "10px" }}
                    iconSize={8}
                    verticalAlign="bottom"
                  />
                  <Radar
                    name="Actual Performance"
                    dataKey="Actual"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.15}
                    dot={{ r: 2.5, strokeWidth: 1 }}
                  />
                  <Radar
                    name="Industry Benchmark"
                    dataKey="Benchmark"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.05}
                    strokeDasharray="3 3"
                    dot={{ r: 2, strokeWidth: 1 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-[10px] text-slate-500">Loading Radar Matrix...</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/30 pt-3 text-[10px] text-slate-500 text-center">
            Updated via telemetry logs from flight system assessor.
          </div>
        </div>

        {/* Column 2: Detailed Skill Categories */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg flex flex-col justify-between min-h-[420px]">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Technical Breakdown</span>
            <h3 className="mt-1 text-xs font-bold text-white">Active Domains & Sub-skills</h3>
            <p className="text-[10px] text-slate-400">
              Interactive competency drilldowns categorized by core organizational disciplines. Click to focus.
            </p>
          </div>

          <div className="space-y-4 my-4 flex-1">
            {skillCategories.map((category) => {
              const isActive = activeCategory === category.id
              return (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(isActive ? null : category.id)}
                  className={`cursor-pointer rounded-lg border p-2.5 transition-all duration-300 ${
                    isActive
                      ? `${category.colorTheme.border} ${category.colorTheme.bg}`
                      : "border-slate-800/40 bg-[#060913]/30 hover:border-slate-700/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded ${category.colorTheme.bg} ${category.colorTheme.text}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{category.title}</h4>
                        <p className="text-[9px] text-slate-400 leading-tight">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-3 w-3 text-slate-500 transition-transform duration-300 ${
                        isActive ? "rotate-90 text-slate-300" : ""
                      }`}
                    />
                  </div>

                  {/* Sub-Skills List (Collapsible / Expandable) */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isActive ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-slate-800/30" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="space-y-2.5 overflow-hidden">
                      {category.subSkills.map((sub) => (
                        <div key={sub.name} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium text-slate-300">{sub.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400">Bench: {sub.benchmark}%</span>
                              <span className={`font-bold ${category.colorTheme.text}`}>{sub.score}%</span>
                            </div>
                          </div>
                          {/* Compact progress bar */}
                          <div className="relative h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            {/* Benchmark Marker Line */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10 opacity-70"
                              style={{ left: `${sub.benchmark}%` }}
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${category.colorTheme.accent}`}
                              style={{ width: `${sub.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/30 pt-3">
            <span>Score threshold: 80% (Advanced)</span>
            <span className="flex items-center gap-1 text-[9px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Benchmark Line
            </span>
          </div>
        </div>

        {/* Column 3: CrewAI Strategic Insights */}
        <div className="rounded-xl border border-slate-800/40 bg-[#0C101D] p-4 shadow-lg flex flex-col justify-between min-h-[420px]">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 font-mono">CrewAI Agent Loop</span>
            <h3 className="mt-1 text-xs font-bold text-white">Strategic Optimization Feed</h3>
            <p className="text-[10px] text-slate-400">
              Autonomous performance diagnostic agents monitoring telemetry logs, code pipelines, and agile execution indices.
            </p>
          </div>

          <div className="space-y-3.5 my-4 flex-1">
            {crewAIInsights.map((insight) => (
              <div
                key={insight.id}
                className={`rounded-lg border-l-2 ${insight.colorClass} bg-[#060913]/30 p-2.5 border border-y-slate-800/30 border-r-slate-800/30 hover:border-y-slate-700/40 hover:border-r-slate-700/40 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-slate-400 tracking-wide font-mono">{insight.category}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                      insight.impact === "High"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {insight.impact} Priority
                  </span>
                </div>
                <div className="mt-1.5 flex items-start gap-2">
                  <div className="mt-0.5 rounded bg-slate-800/60 p-1 flex-shrink-0">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white leading-tight">{insight.title}</h4>
                    <p className="mt-1 text-[9px] text-slate-400 leading-normal">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/30 pt-3 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">CrewAI Agent State: IDLE / MONITORING</span>
            <button className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors text-[9px] uppercase tracking-wider flex items-center gap-0.5">
              <span>Trigger Loop</span>
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
