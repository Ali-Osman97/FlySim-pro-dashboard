import { useEffect, useState } from "react"
// السطر ده هيستورد كل البيانات اللي في ملف الداتا بتاعك
import * as mockExports from "@/lib/data"
import type { SimData } from "@/lib/data"

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
        const json = await res.json()
        if (!cancelled) {
          setData(json as SimData)
          setError(null)
          setIsLoading(false)
        }
      } catch (e) {
        console.warn("Failed to fetch sim data from backend, falling back to local mock data:", e)
        
        // Fallback to local data
        try {
          const mockData = 
            (mockExports as any).simData || 
            (mockExports as any).data || 
            (mockExports as any).mockData || 
            Object.values(mockExports)[0];

          if (mockData && !cancelled) {
            setData(mockData as SimData)
            setError(null)
            setIsLoading(false)
          } else if (!cancelled) {
            throw new Error("No data found in lib/data")
          }
        } catch (localError) {
          if (!cancelled) {
            console.error("Local data load failed:", localError)
            setError("Error loading local data")
            setIsLoading(false)
          }
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