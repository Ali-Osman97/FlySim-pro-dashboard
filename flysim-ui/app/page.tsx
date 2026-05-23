"use client"

import { useState } from "react"
import { DashboardHeader, type DashboardView } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { SkillsRadar } from "@/components/dashboard/skills-radar"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { SkillProgress } from "@/components/dashboard/skill-progress"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StatusBar } from "@/components/dashboard/status-bar"
import { SimulationWorkspace } from "@/components/dashboard/simulation/simulation-workspace"
import { SkillsAssessment } from "@/components/dashboard/skills-assessment"

function OverviewContent() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Mission Control
        </h2>
        <p className="text-sm text-muted-foreground">
          Assessment overview and simulation performance for Cmdr. M. Reyes
        </p>
      </div>

      {/* Stats row */}
      <section aria-label="Key performance indicators">
        <StatsCards />
      </section>

      {/* Charts row */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5" aria-label="Performance analytics">
        <div className="lg:col-span-3">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-2">
          <SkillsRadar />
        </div>
      </section>

      {/* Sessions table */}
      <section className="mt-6" aria-label="Recent simulation sessions">
        <RecentSessions />
      </section>

      {/* Bottom row */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Skills and activity">
        <div className="lg:col-span-1">
          <SkillProgress />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </section>
    </div>
  )
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>("overview")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-auto">
        {activeView === "overview" && <OverviewContent />}
        {activeView === "simulation" && <SimulationWorkspace />}
        {activeView === "skills" && (
          <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
            <SkillsAssessment />
          </div>
        )}
        {activeView === "reports" && (
          <PlaceholderView
            title="Reports & Analytics"
            description="Comprehensive performance reports and data exports"
          />
        )}
      </main>

      <StatusBar />
    </div>
  )
}
