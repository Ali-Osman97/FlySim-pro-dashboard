"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { SkillsRadar } from "@/components/dashboard/skills-radar"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { SkillProgress } from "@/components/dashboard/skill-progress"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StatusBar } from "@/components/dashboard/status-bar"

export default function OverviewPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Mission Control</h2>
        <p className="text-sm text-muted-foreground">
          Assessment overview and simulation performance for Cmdr. M. Reyes
        </p>
      </div>

      <section aria-label="Key performance indicators">
        <StatsCards />
      </section>

      <section
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5"
        aria-label="Performance analytics"
      >
        <div className="lg:col-span-3">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-2">
          <SkillsRadar />
        </div>
      </section>

      <section className="mt-6" aria-label="Recent simulation sessions">
        <RecentSessions />
      </section>

      <section
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
        aria-label="Skills and activity"
      >
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

      <div className="mt-8">
        <StatusBar />
      </div>
    </>
  )
}

