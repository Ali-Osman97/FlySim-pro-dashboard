import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import { StatsCards } from "@/components/dashboard/stats-cards"

jest.mock("@/hooks/useSimData", () => ({
  useSimData: () => ({
    data: {
      stats: [{ id: "total", label: "Total Flights", value: "42" }],
      performance: [],
      skills: [],
      recentSessions: [],
      activityFeed: [],
    },
    isLoading: false,
    error: null,
  }),
}))

describe("StatsCards", () => {
  it("renders stats", () => {
    const { asFragment, getByText } = render(<StatsCards />)
    expect(getByText("Total Flights")).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })
})

