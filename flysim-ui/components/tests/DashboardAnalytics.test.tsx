import "@testing-library/jest-dom"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReportsAnalytics } from "@/components/dashboard/reports-analytics"
import { SkillsAssessment } from "@/components/dashboard/skills-assessment"

jest.mock("recharts", () => {
  const MockContainer = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
  const MockChart = ({ children }: { children?: React.ReactNode }) => <svg>{children}</svg>
  const MockLeaf = () => null

  return {
    ResponsiveContainer: MockContainer,
    AreaChart: MockChart,
    Area: MockLeaf,
    BarChart: MockChart,
    Bar: MockLeaf,
    XAxis: MockLeaf,
    YAxis: MockLeaf,
    CartesianGrid: MockLeaf,
    Tooltip: MockLeaf,
    Legend: MockLeaf,
    RadarChart: MockChart,
    Radar: MockLeaf,
    PolarGrid: MockLeaf,
    PolarAngleAxis: MockLeaf,
    PolarRadiusAxis: MockLeaf,
  }
})

const reportsPayload = {
  velocityData: [
    { month: "May", Velocity: 94, Completed: 95, Target: 90 },
    { month: "Jun", Velocity: 98, Completed: 96, Target: 95 },
  ],
  efficiencyData: [
    { module: "Actuation", Efficiency: 92, DeliveryDays: 14 },
    { module: "Control Loops", Efficiency: 78, DeliveryDays: 22 },
  ],
  crewAIInsights: [
    {
      id: "insight-1",
      category: "SYSTEMS & MECHATRONICS",
      title: "Kalman Filter HIL Actuation Calibration",
      description: "Tune the synchronized control-loop data.",
      impact: "High",
      colorClass: "border-cyan-500",
    },
  ],
  reportsList: [
    {
      id: "REP-26-05",
      title: "Q2 Mechatronics Sprint Diagnostic",
      discipline: "Mechatronics & Robotics",
      risk: "Low",
      date: "May 18, 2026",
    },
    {
      id: "REP-26-04",
      title: "HIL Integration Latency Audit",
      discipline: "Systems Architecture",
      risk: "Medium",
      date: "Apr 22, 2026",
    },
  ],
}

describe("ReportsAnalytics", () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it("falls back to cached data when the API response is malformed", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ velocityData: "invalid" }),
    } as Response)

    render(<ReportsAnalytics />)

    expect(await screen.findByText("Offline Mode")).toBeInTheDocument()
    expect(screen.getByText("Q2 Mechatronics Sprint Diagnostic")).toBeInTheDocument()
  })

  it("filters reports and gives controls accessible labels", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => reportsPayload,
    } as Response)
    const user = userEvent.setup()

    render(<ReportsAnalytics />)
    await screen.findByText("API Feed Synced")

    const search = screen.getByLabelText("Search reports by title or ID")
    expect(screen.getByLabelText("Filter reports by discipline")).toBeInTheDocument()

    await user.type(search, "HIL")

    expect(screen.getByText("HIL Integration Latency Audit")).toBeInTheDocument()
    expect(screen.queryByText("Q2 Mechatronics Sprint Diagnostic")).not.toBeInTheDocument()
    expect(screen.getByText("Displaying 1 of 2 logs")).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, "no matching report")
    await user.click(screen.getByRole("button", { name: "Export CSV" }))

    expect(
      screen.getByText("No reports match the current filters. Adjust the filters before exporting.")
    ).toBeInTheDocument()
  })
})

describe("SkillsAssessment accessibility", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("exposes skill accordions as keyboard-operable buttons", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    } as Response)
    const user = userEvent.setup()

    render(<SkillsAssessment />)
    await screen.findByText("Offline Mode")

    const trigger = screen.getByRole("button", { name: /Project Management & Agility/ })
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    trigger.focus()
    await user.keyboard("{Enter}")

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    await waitFor(() => {
      expect(screen.getByRole("region", { name: /Project Management & Agility/ })).toBeVisible()
    })
  })
})
