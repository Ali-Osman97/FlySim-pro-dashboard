type ProxyOptions = {
  method?: "GET" | "POST"
  body?: unknown
  timeoutMs?: number
}

export type TrainingProxyResult = {
  body: unknown
  status: number
}

export async function proxyTrainingRequest(
  endpoint: string,
  unavailableMessage: string,
  options: ProxyOptions = {}
): Promise<TrainingProxyResult> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8000"
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error(`Training upstream error for ${endpoint}:`, response.status)
      return {
        body: { message: unavailableMessage },
        status: response.status === 404 ? 404 : 502,
      }
    }

    return {
      body: await response.json(),
      status: response.status,
    }
  } catch (error) {
    console.error(`Error proxying ${endpoint}:`, error)
    return {
      body: { message: unavailableMessage },
      status: 503,
    }
  } finally {
    clearTimeout(timeout)
  }
}

