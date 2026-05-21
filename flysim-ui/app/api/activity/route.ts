import { NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:8000"

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/activity`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      // Fallback: empty activity list
      return NextResponse.json({ activityFeed: [] }, { status: 200 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying /api/activity:", error)
    // Still return a 200 with empty feed so UI stays graceful
    return NextResponse.json({ activityFeed: [] }, { status: 200 })
  }
}

