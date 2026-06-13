import { NextResponse } from "next/server"
import { proxyTrainingRequest } from "@/lib/training-proxy"

export async function GET() {
  const result = await proxyTrainingRequest(
    "/api/training/tasks",
    "Training task service is unavailable"
  )
  return NextResponse.json(result.body, { status: result.status })
}

