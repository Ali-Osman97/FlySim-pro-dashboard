type ProxyResult = {
  body: unknown
  status: number
}

export async function fetchDashboardData(
  endpoint: string,
  unavailableMessage: string
): Promise<ProxyResult> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8000"

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Dashboard upstream error for ${endpoint}:`, response.status)
      return {
        body: { message: unavailableMessage },
        status: 502,
      }
    }

    return {
      body: await response.json(),
      status: 200,
    }
  } catch (error) {
    console.error(`Error proxying ${endpoint}:`, error)
    return {
      body: { message: unavailableMessage },
      status: 500,
    }
  }
}

