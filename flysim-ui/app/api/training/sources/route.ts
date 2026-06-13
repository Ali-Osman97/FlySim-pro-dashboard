import { NextResponse } from "next/server"
import { proxyTrainingRequest } from "@/lib/training-proxy"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await proxyTrainingRequest(
      "/api/training/sources",
      "Source collection service is unavailable",
      { method: "POST", body }
    )
    return NextResponse.json(result.body, { status: result.status })
  } catch {
    return NextResponse.json({ message: "Invalid source case request" }, { status: 400 })
  }
}

