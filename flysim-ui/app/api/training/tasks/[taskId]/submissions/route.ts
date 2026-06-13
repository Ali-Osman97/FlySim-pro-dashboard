import { NextResponse } from "next/server"
import { proxyTrainingRequest } from "@/lib/training-proxy"

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params
    const body = await request.json()
    const result = await proxyTrainingRequest(
      `/api/training/tasks/${encodeURIComponent(taskId)}/submissions`,
      "Training evaluation service is unavailable",
      { method: "POST", body, timeoutMs: 90000 }
    )
    return NextResponse.json(result.body, { status: result.status })
  } catch {
    return NextResponse.json({ message: "Invalid training submission" }, { status: 400 })
  }
}

