import { useEffect, useState } from "react"
import { mockData, type SimData } from "@/lib/data"

type UseSimDataState = {
  data: SimData | null
  isLoading: boolean
  error: string | null
}

export function useSimData(): UseSimDataState {
  const [data, setData] = useState<SimData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const res = await fetch("/api/sim-data")
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        const json = (await res.json()) as SimData
        if (!cancelled) {
          setData(json)
          setError(null)
          setIsLoading(false)
        }
      } catch (error: unknown) {
        console.warn("Failed to fetch sim data from backend, falling back to local mock data:", error)

        if (!cancelled) {
          setData(mockData)
          setError(null)
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
