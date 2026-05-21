import { renderHook, waitFor } from "@testing-library/react"
import { useSimData } from "@/hooks/useSimData"

describe("useSimData", () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    // Mock standard successful API response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            stats: [],
            performance: [],
            skills: [],
            recentSessions: [],
            activityFeed: [],
          }),
      } as Response)
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it("returns loading state initially", () => {
    // Mock a pending fetch promise to capture the initial loading state
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useSimData())
    expect(result.current.isLoading).toBe(true)
  })

  it("eventually sets loading to false", async () => {
    const { result } = renderHook(() => useSimData())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
