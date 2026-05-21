"use client"

import { useParams } from "next/navigation"

export default function SessionDetailsPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params?.sessionId

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Session Details</h2>
        <p className="text-sm text-muted-foreground">
          Detailed breakdown for simulation session <span className="font-mono">{sessionId}</span>.
        </p>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">
          Session-specific analytics and debrief will appear here.
        </p>
      </div>
    </div>
  )
}

