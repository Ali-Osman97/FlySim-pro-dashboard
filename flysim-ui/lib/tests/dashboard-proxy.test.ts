import { fetchDashboardData } from "@/lib/dashboard-proxy"

describe("dashboard proxy behavior", () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it("hides raw upstream bodies on service failures", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "secret backend stack trace",
    } as Response)

    const result = await fetchDashboardData(
      "/api/dashboard/reports",
      "Dashboard reports service is unavailable"
    )

    expect(result.status).toBe(502)
    expect(JSON.stringify(result.body)).not.toContain("secret backend stack trace")
    expect(result.body).toEqual({
      message: "Dashboard reports service is unavailable",
    })
  })

  it("returns a generic failure for network errors", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("private network detail"))

    const result = await fetchDashboardData(
      "/api/dashboard/skills",
      "Dashboard skills service is unavailable"
    )

    expect(result.status).toBe(500)
    expect(result.body).toEqual({
      message: "Dashboard skills service is unavailable",
    })
  })
})

