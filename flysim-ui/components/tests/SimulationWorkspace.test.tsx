import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SimulationWorkspace } from "@/components/dashboard/simulation/simulation-workspace"
import { fallbackTrainingTasks } from "@/lib/training-fallback"

const evaluationPayload = {
  submission_id: "submission-test",
  task_id: fallbackTrainingTasks[0].id,
  task_title: fallbackTrainingTasks[0].title,
  submitted_at: "2026-06-13T12:00:00+00:00",
  evaluator_mode: "rubric_fallback",
  overall_score: 78,
  summary: "The proposal addresses the core architecture and delivery requirements.",
  strengths: ["Technical design quality"],
  criterion_assessments: [
    {
      criterion_id: "technical-design",
      title: "Technical design quality",
      score: 82,
      feedback: "The architecture and interfaces are clear.",
      evidence_found: ["architecture", "interface"],
    },
  ],
  skill_assessments: [
    {
      skill_id: "eng-systems",
      name: "Systems Engineering",
      category: "Engineering",
      score: 72,
      benchmark: 75,
    },
  ],
  skill_gaps: [
    {
      skill_id: "eng-systems",
      name: "Systems Engineering",
      category: "Engineering",
      score: 72,
      target: 75,
      gap: 3,
      recommendation: "Add quantified requirements and explicit failure-mode controls.",
    },
  ],
  next_steps: ["Add measurable acceptance evidence."],
}

describe("SimulationWorkspace", () => {
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

  it("keeps the cached task library available for malformed API responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    } as Response)

    render(<SimulationWorkspace />)

    expect(await screen.findByText("Cached Task Library")).toBeInTheDocument()
    expect(
      screen.getByRole("button", {
        name: /Airport Baggage Control Modernization/,
      })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Your Engineering Decision Brief")).toBeInTheDocument()
  })

  it("submits a task solution and renders the skill-gap report", async () => {
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith("/api/training/reports")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response)
      }
      if (url.includes("/submissions")) {
        return Promise.resolve({
          ok: true,
          json: async () => evaluationPayload,
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: async () => fallbackTrainingTasks,
      } as Response)
    })
    const user = userEvent.setup()

    render(<SimulationWorkspace />)
    expect(await screen.findByText("Task API Synced")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Your Engineering Decision Brief"), {
      target: {
        value:
          "The architecture uses explicit interfaces and integration trade-offs. Acceptance tests measure reliability, monitoring, safety failures, mitigations, milestones, owners, dependencies, stakeholder reviews, and phased rollout.",
      },
    })
    await user.click(screen.getByRole("button", { name: "Evaluate Submission" }))

    expect(await screen.findByRole("heading", { name: "Skill-Gap Report" })).toBeInTheDocument()
    expect(screen.getByText("Rubric Fallback Evaluation")).toBeInTheDocument()
    expect(screen.getByText("78")).toBeInTheDocument()
    expect(screen.getAllByText("Systems Engineering").length).toBeGreaterThanOrEqual(1)
  })
})
