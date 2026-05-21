import { NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:8000"

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/sim-data`, {
      // Forward minimal headers; extend as needed
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json(
        { message: "Upstream error", status: res.status, body: text },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying /api/sim-data:", error)
    return NextResponse.json(
      { message: "Failed to fetch sim data from backend" },
      { status: 500 }
    )
  }
}

