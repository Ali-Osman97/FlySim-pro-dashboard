import { useEffect, useState } from "react"
import ClipLoader from "react-spinners/ClipLoader"
import type { ActivityEvent } from "@/lib/data"
import { mockData } from "@/lib/data"

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOnce() {
      try {
        const res = await fetch("/api/activity")
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const json = (await res.json()) as { activityFeed?: ActivityEvent[] }
        if (!cancelled) {
          setEvents(json.activityFeed ?? [])
          setError(null)
        }
      } catch (e) {
        console.warn("Failed to fetch activity feed from backend, falling back to local mock data:", e)
        if (!cancelled) {
          setEvents(mockData.activityFeed ?? [])
          setError(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchOnce()
    const id = setInterval(fetchOnce, 15000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-8">
        <ClipLoader color="#6366F1" size={20} />
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 px-4 py-6 text-xs text-slate-400 text-center">
        No recent activities recorded.
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 p-4 shadow-sm flex flex-col h-full justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Live Activity Feed
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Real-time events and system assessment logs
            </p>
          </div>
          {error ? (
            <span className="text-[9px] text-amber-500 bg-amber-950/20 border border-amber-900/30 px-1.5 py-0.5 rounded">
              Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-900/60 border border-slate-800/80 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </div>

        {/* Flat Timeline Axis */}
        <div className="relative border-l border-slate-850 ml-1.5 pl-4 space-y-3 py-1">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Flat micro Cyan dot on timeline axis */}
              <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-[#0C101D] bg-cyan-500 transition-transform duration-100" />
              
              {/* Content Box */}
              <div className="rounded-md bg-slate-950/30 border border-slate-900/40 px-3 py-2 hover:border-slate-800/50 transition-colors">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  {event.timestamp}
                </span>
                <p className="mt-0.5 text-xs text-slate-200 leading-normal">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
