export type StatItem = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "warning" | "neutral"
}

export type PerformancePoint = {
  time: string
  engineTempC: number
  altitudeStability: number
  controlLatencyMs: number
}

export type SkillItem = {
  id: string
  name: string
  value: number
}

export type RecentSession = {
  id: string
  scenario: string
  type: string
  score: number
  duration: string
  date: string
  outcome: "Success" | "Partial" | "Fail"
}

export type ActivityEvent = {
  id: string
  timestamp: string
  description: string
}

export interface SimData {
  stats: StatItem[]
  performance: PerformancePoint[]
  skills: SkillItem[]
  recentSessions: RecentSession[]
  activityFeed: ActivityEvent[]
}

export const mockData: SimData = {
  stats: [
    { id: "overall-score", label: "Overall Score", value: "94.2 %", change: "+2.4%", changeType: "positive" },
    { id: "flight-hours", label: "Flight Hours", value: "1,247 hrs", change: "+38 hrs", changeType: "positive" },
    { id: "active-scenarios", label: "Active Scenarios", value: "12", change: "3 pending", changeType: "warning" },
    { id: "skill-growth", label: "Skill Growth", value: "18.6 %", change: "+5.1%", changeType: "positive" },
  ],
  performance: [
    { time: "Jan", engineTempC: 72, altitudeStability: 80, controlLatencyMs: 65 },
    { time: "Feb", engineTempC: 75, altitudeStability: 80, controlLatencyMs: 70 },
    { time: "Mar", engineTempC: 78, altitudeStability: 82, controlLatencyMs: 72 },
    { time: "Apr", engineTempC: 74, altitudeStability: 82, controlLatencyMs: 68 },
    { time: "May", engineTempC: 83, altitudeStability: 84, controlLatencyMs: 80 },
    { time: "Jun", engineTempC: 85, altitudeStability: 84, controlLatencyMs: 84 },
    { time: "Jul", engineTempC: 88, altitudeStability: 86, controlLatencyMs: 86 },
    { time: "Aug", engineTempC: 86, altitudeStability: 86, controlLatencyMs: 85 },
    { time: "Sep", engineTempC: 91, altitudeStability: 88, controlLatencyMs: 88 },
    { time: "Oct", engineTempC: 93, altitudeStability: 88, controlLatencyMs: 91 },
    { time: "Nov", engineTempC: 92, altitudeStability: 90, controlLatencyMs: 90 },
    { time: "Dec", engineTempC: 95, altitudeStability: 90, controlLatencyMs: 94 },
  ],
  skills: [
    { id: "navigation", name: "Navigation", value: 92 },
    { id: "systems", name: "Systems Management", value: 94 },
    { id: "comms", name: "CRM & Communication", value: 96 },
    { id: "emergency", name: "Emergency Response", value: 85 },
    { id: "decision", name: "Decision Making", value: 89 },
    { id: "instrumentation", name: "Instrumentation", value: 87 },
  ],
  recentSessions: [
    {
      id: "SIM-2847",
      scenario: "Engine Failure at V1",
      type: "Emergency",
      score: 96,
      duration: "1h 42m",
      date: "2 hours ago",
      outcome: "Success",
    },
    {
      id: "SIM-2846",
      scenario: "ILS CAT III Approach",
      type: "Navigation",
      score: 91,
      duration: "2h 15m",
      date: "Yesterday",
      outcome: "Success",
    },
    {
      id: "SIM-2845",
      scenario: "Hydraulic System Failure",
      type: "Systems",
      score: 78,
      duration: "1h 58m",
      date: "2 days ago",
      outcome: "Partial",
    },
    {
      id: "SIM-2844",
      scenario: "Crosswind Landing - 35kt",
      type: "Navigation",
      score: 88,
      duration: "0h 54m",
      date: "3 days ago",
      outcome: "Success",
    },
    {
      id: "SIM-2843",
      scenario: "Multi-Engine Flame Out",
      type: "Emergency",
      score: 72,
      duration: "2h 30m",
      date: "5 days ago",
      outcome: "Fail",
    },
  ],
  activityFeed: [
    {
      id: "evt-1",
      timestamp: "30 min ago",
      description: "Certification Renewed: Type Rating B737-MAX renewed for 12 months.",
    },
    {
      id: "evt-2",
      timestamp: "2 hours ago",
      description: "Simulation Completed: Engine Failure at V1 - Score: 96%.",
    },
    {
      id: "evt-3",
      timestamp: "5 hours ago",
      description: "Training Module Assigned: Advanced Weather Radar Interpretation.",
    },
    {
      id: "evt-4",
      timestamp: "Yesterday",
      description: "Review Required: Hydraulic System Failure simulation needs instructor review.",
    },
    {
      id: "evt-5",
      timestamp: "2 days ago",
      description: "Scenario Scheduled: TCAS RA Response drill scheduled for March 2.",
    },
  ],
}

