import { proxyTrainingRequest } from "@/lib/training-proxy"

describe("training proxy", () => {
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

  it("forwards successful created responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ submission_id: "submission-1" }),
    } as Response)

    const result = await proxyTrainingRequest(
      "/api/training/tasks/task-1/submissions",
      "Evaluation unavailable",
      { method: "POST", body: { solution: "test" } }
    )

    expect(result).toEqual({
      body: { submission_id: "submission-1" },
      status: 201,
    })
  })

  it("does not expose an upstream failure body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "private stack trace",
    } as Response)

    const result = await proxyTrainingRequest(
      "/api/training/tasks",
      "Training task service is unavailable"
    )

    expect(result.status).toBe(502)
    expect(JSON.stringify(result.body)).not.toContain("private stack trace")
  })
})

