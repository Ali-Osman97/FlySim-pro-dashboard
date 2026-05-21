import { NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/submit-handoff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()

    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Upstream submit error",
          status: res.status,
          body: json,
        },
        { status: 502 }
      )
    }

    return NextResponse.json(json)
  } catch (error) {
    console.error("Error proxying /api/submit-hand-off:", error)
    return NextResponse.json(
      { message: "Failed to submit handoff to backend" },
      { status: 500 }
    )
  }
}

